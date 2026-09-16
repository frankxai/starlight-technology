import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const finiteInt = value => Number.isSafeInteger(value) && value >= 0;

// Only discovery URLs are normalized. Never call this on a partner-issued URL.
export function sourceUrl(value, allowedHosts) {
  const url = new URL(value);
  requireValue(url.protocol === 'https:' && !url.username && !url.password && !url.port, 'Unsafe source URL');
  requireValue(allowedHosts.includes(url.hostname), 'Unregistered source host');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.href;
}

function checkedTime(value, now, maxAgeDays) {
  const time = Date.parse(value);
  return typeof value === 'string' && Number.isFinite(time) && time <= now && now - time <= maxAgeDays * 86400000;
}

export function plan(input, policy, previous, asOf) {
  const now = Date.parse(asOf);
  requireValue(Number.isFinite(now), 'Explicit valid asOf timestamp required');
  const period = new Date(now).toISOString().slice(0, 7);
  requireValue(Array.isArray(input.signals) && input.signals.length <= policy.maxSignals, 'Invalid or oversized intake');
  requireValue(previous && previous.schemaVersion === 1 && Array.isArray(previous.jobs) && previous.months, 'Explicit durable state required');
  requireValue(Array.isArray(input.inventory), 'Canonical inventory required');
  requireValue(new Set(previous.jobs.map(job => job.id)).size === previous.jobs.length, 'Duplicate state jobs');
  for (const job of previous.jobs) {
    requireValue(['reserved', 'completed', 'held', 'killed'].includes(job.status) && Array.isArray(job.eventIds), 'Invalid state job');
    requireValue(finiteInt(job.reservedTokens) && /^\d{4}-\d{2}$/.test(job.period), 'Invalid job reservation');
  }
  for (const value of Object.values(previous.months)) {
    requireValue(finiteInt(value.reservedTokens), 'Invalid monthly reservation');
  }
  const minimumByMonth = {};
  for (const job of previous.jobs) minimumByMonth[job.period] = (minimumByMonth[job.period] ?? 0) + job.reservedTokens;
  for (const [month, minimum] of Object.entries(minimumByMonth)) {
    requireValue(previous.months[month]?.reservedTokens >= minimum, 'Monthly ledger cannot discard prior reservations');
  }
  for (const key of ['maxSignals', 'maxNewBriefs', 'maxOutstandingBriefs', 'maxRunTokens', 'maxMonthTokens', 'briefInputTokens', 'briefOutputTokens', 'sourceFreshnessDays']) {
    requireValue(finiteInt(policy[key]) && policy[key] > 0, `Invalid policy: ${key}`);
  }
  const state = structuredClone(previous);
  state.months[period] ??= { reservedTokens: 0 };
  const known = new Set(state.jobs.flatMap(job => job.eventIds));
  const rejected = [];
  const groups = new Map();
  const runKeys = new Set();
  for (const signal of input.signals) {
    try {
      const source = policy.sources.find(source => source.id === signal.sourceId && source.status === 'verified-directory');
      requireValue(source, 'Source directory not verified');
      requireValue(checkedTime(source.checkedAt, now, policy.sourceFreshnessDays), 'Source directory needs recheck');
      requireValue(checkedTime(signal.checkedAt, now, policy.sourceFreshnessDays), 'Source observation stale, missing or future');
      requireValue(policy.categories.includes(signal.category), 'Unsupported category');
      requireValue(source.categories.includes(signal.category), 'Category outside registered source coverage');
      for (const key of ['productId', 'intentId']) {
        requireValue(typeof signal[key] === 'string' && /^[a-z0-9][a-z0-9-]{2,100}$/.test(signal[key]), `Invalid ${key}`);
      }
      requireValue(typeof signal.summary === 'string' && signal.summary.trim().length >= 20 && signal.summary.length <= 1200, 'Use a compact source paraphrase');
      requireValue(typeof signal.readerDecision === 'string' && signal.readerDecision.trim().length >= 20 && signal.readerDecision.length <= 600, 'Reader decision required');
      requireValue(Array.isArray(signal.facts) && signal.facts.length > 0 && signal.facts.length <= 12 && signal.facts.every(fact => typeof fact === 'string' && fact.length > 0 && fact.length <= 300), 'Compact atomic facts required');
      requireValue(['launch', 'update', 'comparison', 'refresh'].includes(signal.kind), 'Unknown signal kind');
      const url = sourceUrl(signal.url, source.allowedHosts);
      const facts = [...new Set(signal.facts.map(fact => fact.trim()))].sort();
      const eventId = hash([signal.sourceId, url, signal.productId, facts]);
      if (known.has(eventId) || runKeys.has(eventId)) continue;
      runKeys.add(eventId);
      const groupId = `${signal.productId}:${signal.intentId}`;
      const existing = groups.get(groupId) ?? [];
      existing.push({ ...signal, url, eventId });
      groups.set(groupId, existing);
    } catch (error) {
      rejected.push({ productId: signal?.productId ?? null, reason: error.message });
    }
  }
  const selected = [];
  const deferred = [];
  const outstanding = state.jobs.filter(job => job.status === 'reserved').length;
  const perBrief = policy.briefInputTokens + policy.briefOutputTokens;
  let reservedThisRun = 0;
  const candidates = [...groups.entries()].sort(([a, av], [b, bv]) => {
    const age = Math.max(...bv.map(s => Date.parse(s.checkedAt))) - Math.max(...av.map(s => Date.parse(s.checkedAt)));
    return age || a.localeCompare(b);
  });
  for (const [key, signals] of candidates) {
    const first = signals[0];
    const inventory = input.inventory.find(item => item.productId === first.productId && item.intentId === first.intentId);
    const active = state.jobs.find(job => job.key === key && job.status === 'reserved');
    let reason = null;
    if (active) reason = 'Update the existing reserved brief before commissioning another';
    else if (selected.length >= policy.maxNewBriefs || outstanding + selected.length >= policy.maxOutstandingBriefs) reason = 'Brief work-in-progress limit';
    else if (reservedThisRun + perBrief > policy.maxRunTokens || state.months[period].reservedTokens + perBrief > policy.maxMonthTokens) reason = 'Token reservation limit';
    if (reason) { deferred.push({ key, reason, eventIds: signals.map(s => s.eventId) }); continue; }
    const eventIds = signals.map(s => s.eventId).sort();
    const job = {
      id: `hw-${hash([key, eventIds]).slice(0, 20)}`, key, eventIds, status: 'reserved',
      reservedAt: asOf, period, reservedTokens: perBrief,
      productId: first.productId, intentId: first.intentId, category: first.category,
      action: inventory ? 'refresh-existing' : 'commission-research',
      canonicalUrl: inventory?.canonicalUrl ?? null,
      owner: 'starlight.technology',
      frankxTreatment: 'Only commission a separate creator workflow with original evidence and a distinct reader job',
      readerDecision: first.readerDecision,
      sources: signals.map(s => ({ sourceId: s.sourceId, url: s.url, checkedAt: s.checkedAt, summary: s.summary, facts: s.facts })),
      commercial: 'Evaluate fit; resolve enrolled partner from the canonical affiliate ledger; otherwise use an ordinary link',
      media: 'Source real product images; quarantine until usage rights and credits are recorded; add a decision diagram when useful',
      gates: ['full-source-fact-check', 'rights-and-credit', 'distinct-reader-value', 'independent-review', 'desktop-and-mobile-preview', 'publication-authority'],
      evidenceLevel: 'manufacturer-source; no hands-on testing claimed',
      publishable: false,
    };
    selected.push(job);
    state.jobs.push(job);
    state.months[period].reservedTokens += perBrief;
    reservedThisRun += perBrief;
  }
  return {
    schemaVersion: 1, asOf, selected: selected.map(job => job.id), deferred, rejected,
    pending: state.jobs.filter(job => job.status === 'reserved').map(job => job.id),
    budget: { reservedThisRun, reservedThisMonth: state.months[period].reservedTokens, monthLimit: policy.maxMonthTokens, modelCalls: 0, paidApiCalls: 0, actualModelTokens: 0 },
    nextState: state,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [inputPath, statePath, outputPath, asOf] = process.argv.slice(2);
  if (!inputPath || !statePath || !outputPath || !asOf) throw new Error('Usage: node scripts/editorial/plan.mjs intake.json state.json output.json ISO_TIMESTAMP');
  requireValue(outputPath !== inputPath && outputPath !== statePath, 'Write a new bundle; preserve input and state');
  const policy = JSON.parse(readFileSync(new URL('../../data/editorial/policy.json', import.meta.url), 'utf8'));
  const result = plan(JSON.parse(readFileSync(inputPath, 'utf8')), policy, JSON.parse(readFileSync(statePath, 'utf8')), asOf);
  writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ selected: result.selected.length, pending: result.pending.length, deferred: result.deferred.length, rejected: result.rejected.length, budget: result.budget }));
}
