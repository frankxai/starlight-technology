// Runs after the existing build on an ephemeral GitHub runner; refuses laptop execution.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
if (process.env.GITHUB_ACTIONS !== 'true' || process.platform !== 'linux' || !process.env.STARLIGHT_PLAYWRIGHT_DIR) {
  throw Error('This browser workload requires the admitted ephemeral GitHub Linux runner.');
}
const { chromium } = await import(pathToFileURL(path.join(process.env.STARLIGHT_PLAYWRIGHT_DIR, 'node_modules/playwright/index.mjs')).href);
const origin = 'http://127.0.0.1:3199';
const key = 'starlight-creator-plan-v1';
const output = path.join(process.env.RUNNER_TEMP, 'creator-studio-browser-results');
fs.mkdirSync(output, { recursive: true });
const receipt = { schema: 'StarlightCreatorBrowser.v1', startedAt: new Date().toISOString(),
  testedCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  scope: 'Real Chromium edit/export/import/reload/recovery at desktop and mobile sizes; synthetic private fixture, no model calls or visual approval', checks: [],
  noModelCalls: true, productionActivated: false, serverExited: false, browserClosed: false, captures: [] };
let browser;
const server = spawn(process.execPath, [createRequire(import.meta.url).resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '3199'],
  { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
receipt.serverOwnedPid = server.pid;
let serverLog = '';
for (const pipe of [server.stdout, server.stderr]) pipe.on('data', (data) => { serverLog = (serverLog + data).slice(-12000); });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function check(name, work) {
  try { await work(); receipt.checks.push({ name, pass: true }); }
  catch (error) { receipt.checks.push({ name, pass: false, error: error.message }); throw error; }
}
async function dialog(page, trigger, accept) {
  const pending = page.waitForEvent('dialog', { timeout: 10000 });
  const action = trigger();
  const prompt = await pending;
  const message = prompt.message();
  await (accept ? prompt.accept() : prompt.dismiss());
  await action;
  return message;
}
async function download(page, label, name) {
  const pending = page.waitForEvent('download', { timeout: 10000 });
  await page.getByRole('button', { name: label, exact: true }).click();
  const file = path.join(output, name);
  await (await pending).saveAs(file);
  return file;
}
async function saved(page, title) {
  await page.waitForFunction(([storageKey, expected]) => {
    try { return JSON.parse(localStorage.getItem(storageKey)).title === expected; } catch { return false; }
  }, [key, title], { timeout: 10000 });
}
async function capture(target, name, viewport, style) {
  const file = path.join(output, name), createdAt = new Date().toISOString();
  await target.screenshot({ path: file, animations: 'disabled', style });
  const sha256 = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const sidecar = { $schema: 'https://frankx.ai/schemas/vis-provenance-sidecar.schema.json', asset_id: `${receipt.testedCommit}-${name}`,
    created_at: createdAt, brand: 'starlight-technology', agent_session: '01a101b1-9d38-7fa1-b1f0-dec923631d7f',
    model: 'none (render capture)', provider: 'GitHub Actions / Playwright Chromium', seed: null,
    method: 'Actual rendered product screenshot; no image-generation model or image editing',
    prompt: `Capture ${name} from the actual Creator Studio source ${receipt.testedCommit}, viewport ${viewport} CSS pixels, reduced motion, synthetic private notes. Capture-only CSS: ${style ?? 'none'}. The isolated component capture makes global navigation non-sticky and hides the global skip link so neither can cover the component; page captures retain normal navigation and skip-link behavior. Preserve the rendered component as evidence; do not grant design or release acceptance.`,
    capture_css: style ?? null,
    sha256, source_commit: receipt.testedCommit, viewport_width: viewport, private: false, public_release: false,
    schema_validation: { status: 'not-validated', reason: 'Referenced schema was unavailable; provenance fields recorded.' } };
  fs.writeFileSync(file + '.vis.provenance.json', JSON.stringify(sidecar, null, 2) + '\n');
  receipt.captures.push({ name, sha256, sidecar: name + '.vis.provenance.json', createdAt });
}
async function exercise(width) {
  const tag = width === 390 ? 'mobile' : 'desktop';
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, isMobile: width === 390, reducedMotion: 'reduce', acceptDownloads: true });
  const blocked = [], errors = [];
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(origin + '/') || url.startsWith('blob:')) return route.continue();
    blocked.push(url); return route.abort();
  });
  const page = await context.newPage(); page.setDefaultTimeout(10000);
  page.on('pageerror', (error) => errors.push(error.message));
  let reportPath, report;
  const title = `CI ${tag} creator plan`, notes = 'Synthetic private work notes for recovery testing.';
  try {
    await page.goto(origin + '/studio');
    await saved(page, 'My creator system');
    await check(`${tag}: hydrated responsive plan without horizontal overflow`, async () => {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    });
    await check(`${tag}: visual candidate keyboard selection and interrupted changes survive reload`, async () => {
      const explorer = page.getByRole('region', { name: 'Current system alternatives', exact: true });
      const choices = explorer.getByRole('button');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await choices.first().focus(); await page.keyboard.press('Enter');
      assert.equal(await choices.first().getAttribute('aria-pressed'), 'true');
      assert.equal(await choices.first().evaluate((node) => getComputedStyle(node).transitionDuration), '0s', 'Keyboard selection must be immediate with normal motion settings too.');
      const outline = await choices.first().evaluate((node) => getComputedStyle(node).outlineStyle);
      assert.notEqual(outline, 'none');
      await choices.last().click(); await choices.first().click();
      const chosen = await choices.first().getAttribute('data-archetype-id');
      await page.waitForFunction(([storageKey, expected]) => JSON.parse(localStorage.getItem(storageKey)).selectedArchetypeId === expected, [key, chosen]);
      assert.ok(chosen); await page.reload(); await saved(page, 'My creator system');
      assert.equal(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)).selectedArchetypeId, key), chosen);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const transitions = await explorer.getByRole('button').first().evaluate((node) => getComputedStyle(node).transitionDuration);
      assert.equal(transitions, '0s');
      assert.ok(await explorer.getByRole('link', { name: /Framework Desktop/ }).count());
      const links = await explorer.getByRole('link').evaluateAll((nodes) => nodes.map((node) => ({ href: node.getAttribute('href'), rel: node.rel })));
      assert.ok(links.every((link) => !link.href.includes('Synthetic') && !link.href.includes('My%20creator')));
      assert.ok(links.filter((link) => link.href.startsWith('https:')).every((link) => link.rel.includes('noopener')));
      const targets = await explorer.locator('button, a, summary').evaluateAll((nodes) => nodes.filter((node) => node.getClientRects().length).map((node) => node.getBoundingClientRect().height));
      assert.ok(targets.every((height) => height >= 44));
      await page.evaluate(() => { scrollTo(0, 0); return new Promise(requestAnimationFrame); });
      const artifactInViewport = await explorer.getByRole('img').first().evaluate((node) => {
        const bounds = node.getBoundingClientRect(); return bounds.y >= 0 && bounds.bottom <= innerHeight;
      });
      assert.equal(artifactInViewport, true, 'The actual system artifact must fit in the first viewport.');
      await capture(page, `${tag}-visual-studio.png`, width);
      await capture(explorer, `${tag}-system-explorer.png`, width, '.site-header { position: static !important; } .skip-link { visibility: hidden !important; }');
    });
    await check(`${tag}: licensed product photograph and failed-image recovery preserve editable inputs`, async () => {
      const original = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
      await page.getByLabel('Run a 32B-class model locally', { exact: true }).uncheck();
      await page.getByLabel('Edit and deliver 4K video', { exact: true }).uncheck();
      await page.getByLabel('Record and mix music', { exact: true }).check();
      const explorer = page.getByRole('region', { name: 'Current system alternatives', exact: true });
      await explorer.getByRole('button', { name: /Use Mac mini/ }).first().click();
      const photo = explorer.getByRole('img', { name: /Silver Mac mini M4/ });
      await photo.waitFor(); await photo.evaluate((node) => node.decode());
      await explorer.getByRole('link', { name: 'CC BY 4.0', exact: true }).waitFor();
      await capture(explorer, `${tag}-licensed-product.png`, width, '.site-header { position: static !important; } .skip-link { visibility: hidden !important; }');
      const before = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
      await page.route('**/_next/image?**', (route) => route.abort());
      await page.reload(); await saved(page, 'My creator system');
      await explorer.getByRole('img', { name: /Capacity diagram for Mac mini/ }).waitFor();
      const afterPlan = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key);
      const beforePlan = JSON.parse(before); delete afterPlan.savedAt; delete beforePlan.savedAt;
      assert.deepEqual(afterPlan, beforePlan);
      await page.unroute('**/_next/image?**');
      await page.evaluate(([storageKey, raw]) => localStorage.setItem(storageKey, raw), [key, original]);
      await page.reload(); await saved(page, 'My creator system');
    });
    await check(`${tag}: edit context and enable a factory scenario`, async () => {
      await page.getByLabel('Plan title', { exact: true }).fill(title);
      await page.getByLabel('Existing equipment and intended work', { exact: true }).fill(notes);
      await page.getByRole('button', { name: 'Estimate agent operating costs', exact: true }).click();
      await page.waitForFunction((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory !== null, key);
      await saved(page, title);
    });
    await check(`${tag}: rejected decimal draft restores saved input and focus`, async () => {
      const field = page.getByRole('group', { name: 'Maker', exact: true }).getByLabel('Fresh input tokens per mission', { exact: true });
      await field.fill('50000.5'); await field.press('Tab');
      assert.equal(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory.maker.freshInputTokens, key), 50000);
      await page.getByRole('button', { name: 'Restore saved value for fresh input tokens per mission', exact: true }).click();
      assert.equal(await field.inputValue(), '50000'); assert.equal(await field.evaluate((node) => node === document.activeElement), true);
    });
    await check(`${tag}: complete report download preserves context, costs and purchase caveats`, async () => {
      reportPath = await download(page, 'Export report JSON', `${tag}-report.json`);
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      assert.equal(report.plan.title, title); assert.equal(report.plan.privateContext, notes);
      assert.equal(report.factory.modeledSubtotal.usd, 78.9012);
      assert.equal(report.factory.ratesModified, false);
      assert.ok(report.factory.rateEvidence.every((row) => row.kind === 'bundled-snapshot'));
      assert.ok(report.purchaseReviews.length); assert.equal(report.purchaseReviews[0].deliveredTotalMinor, null);
      await page.evaluate(() => scrollTo(0, 0));
      await capture(page, `${tag}-studio.png`, width);
      await capture(page.getByRole('region', { name: 'What would this workload cost?', exact: true }), `${tag}-factory.png`, width, '.site-header { position: static !important; } .skip-link { visibility: hidden !important; }');
    });
    await check(`${tag}: hardware-only share omits private work and factory assumptions`, async () => {
      const text = fs.readFileSync(await download(page, 'Export hardware only', `${tag}-hardware.md`), 'utf8');
      assert.ok(!text.includes(notes)); assert.ok(!text.includes(title)); assert.ok(!text.includes('Factory workload'));
    });
    await check(`${tag}: native routing and metered contingency survive edits, export and reload`, async () => {
      const maker = page.getByRole('group', { name: 'Maker', exact: true });
      await maker.getByText('Cache and native subscription assumptions', { exact: true }).click();
      const share = maker.getByLabel('Missions billed through APIs (%)', { exact: true });
      await share.fill('50'); await share.press('Tab');
      await page.getByText('Compute, monthly fees and currency', { exact: true }).click();
      const cap = page.getByLabel('Incremental monthly cap (EUR)', { exact: true });
      await cap.fill('60'); await cap.press('Tab');
      await page.waitForFunction((storageKey) => {
        const factory = JSON.parse(localStorage.getItem(storageKey)).factory;
        return factory.maker.apiShareBps === 5000 && factory.monthlyCapEuroMinor === 6000;
      }, key);
      await page.reload(); await saved(page, title);
      const disclosure = page.getByText('Runtime and subscription routes', { exact: true });
      await disclosure.click();
      await page.getByText('Known costs exceed your incremental cap.').waitFor();
      await page.getByText('Codex managed cloud', { exact: true }).waitFor();
      await page.getByText('Claude managed cloud', { exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const routed = JSON.parse(fs.readFileSync(await download(page, 'Export report JSON', `${tag}-native-runtime-report.json`), 'utf8'));
      assert.equal(routed.schema, 'StarlightCreatorReport.v3');
      assert.equal(routed.runtimePlan.executionAuthorized, false);
      assert.equal(routed.runtimePlan.stages[0].nativeShareBps, 5000);
      assert.equal(routed.runtimePlan.stages[0].accountAccess, 'unverified');
      assert.equal(routed.factory.modeledSubtotal.usd, 56.9012);
      assert.equal(routed.factory.overCap, false);
      assert.equal(routed.runtimePlan.meteredContingency.modeledSubtotal.usd, 78.9012);
      assert.equal(routed.runtimePlan.meteredContingency.overCap, true);
      const costs = JSON.parse(fs.readFileSync(await download(page, 'Export cost comparison', `${tag}-runtime-costs.json`), 'utf8'));
      assert.equal(costs.schema, 'StarlightFactoryCostReport.v2');
      assert.equal(costs.runtimePlan.meteredContingency.overCap, true);
      assert.equal(costs.privateContextIncluded, false); assert.ok(!JSON.stringify(costs).includes(notes));
      await capture(disclosure.locator('..'), `${tag}-runtime.png`, width, '.site-header { position: static !important; } .skip-link { visibility: hidden !important; }');
    });
    await check(`${tag}: changing the maker updates coding-plan boundaries without losing the workload`, async () => {
      await page.getByRole('group', { name: 'Maker', exact: true }).getByRole('combobox').selectOption('glm');
      await page.getByText('GLM Coding Plan in supported tools', { exact: true }).waitFor();
      const routed = JSON.parse(fs.readFileSync(await download(page, 'Export report JSON', `${tag}-glm-runtime-report.json`), 'utf8'));
      assert.equal(routed.plan.factory.maker.apiShareBps, 5000);
      assert.equal(routed.runtimePlan.stages[0].provider, 'zai');
      assert.equal(routed.runtimePlan.stages[0].nativeRoutes.length, 1);
      assert.match(routed.runtimePlan.stages[0].nativeRoutes[0].requirement, /5-hour and weekly/);
      assert.deepEqual(routed.plan.factory.compute, report.plan.factory.compute);
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(reportPath), true);
      await page.waitForFunction((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory.maker.apiShareBps === 10000, key);
    });
    await check(`${tag}: Kimi TTL prices, membership limits and same-provider recovery`, async () => {
      const maker = page.getByRole('group', { name: 'Maker', exact: true });
      await maker.getByRole('combobox').selectOption('kimi-k3-5m');
      await maker.getByText('Cache and native subscription assumptions', { exact: true }).click();
      for (const [label, value] of [['Fresh input tokens per mission', '0'], ['Output tokens per mission', '0'], ['Cache-write tokens per mission', '1000000'], ['Cache-candidate input tokens', '1000000'], ['This provider’s cache-hit assumption (%)', '50']]) {
        const field = maker.getByLabel(label, { exact: true }); await field.fill(value); await field.press('Tab');
      }
      await page.waitForFunction((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory.maker.cacheHitBps === 5000, key);
      const short = JSON.parse(fs.readFileSync(await download(page, 'Export report JSON', `${tag}-kimi-5m-report.json`), 'utf8'));
      assert.equal(short.factory.makerApi.usd, 1023);
      await maker.getByRole('combobox').selectOption('kimi-k3-1h');
      const kimiPath = await download(page, 'Export report JSON', `${tag}-kimi-1h-report.json`);
      assert.ok(fs.statSync(kimiPath).size <= 64 * 1024);
      const long = JSON.parse(fs.readFileSync(kimiPath, 'utf8'));
      assert.equal(long.factory.makerApi.usd, 2013);
      assert.equal(long.factory.rateEvidence[0].cachePolicy.candidateMiss, 'write');
      assert.equal(long.factory.rateEvidence[0].sources.length, 2);
      assert.match(long.runtimePlan.stages[0].nativeRoutes[0].requirement, /New plans.*no weekly/);
      assert.match(long.runtimePlan.stages[0].nativeRoutes[0].requirement, /Legacy plans retain the weekly/);
      assert.equal(long.runtimePlan.executionAuthorized, false);
      await page.reload(); await saved(page, title);
      assert.equal(await page.getByRole('group', { name: 'Maker', exact: true }).getByRole('combobox').inputValue(), 'kimi-k3-1h');
      await page.getByText('Runtime and subscription routes', { exact: true }).click();
      await page.getByText('Kimi Code in supported coding hosts', { exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await capture(page.getByRole('region', { name: 'What would this workload cost?', exact: true }), `${tag}-kimi.png`, width, '.site-header { position: static !important; } .skip-link { visibility: hidden !important; }');
      await page.getByRole('group', { name: 'Independent reviewer', exact: true }).getByRole('combobox').selectOption('kimi-k3-5m');
      const shared = JSON.parse(fs.readFileSync(await download(page, 'Export report JSON', `${tag}-kimi-same-provider.json`), 'utf8'));
      assert.equal(shared.factory.independentProvider, false);
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(kimiPath), true);
      await page.waitForFunction((storageKey) => {
        const factory = JSON.parse(localStorage.getItem(storageKey)).factory;
        return factory.maker.rate.id === 'kimi-k3-1h' && factory.reviewer.rate.id === 'opus' && factory.maker.cacheHitBps === 5000;
      }, key);
      assert.deepEqual(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory, key), long.plan.factory);
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(reportPath), true);
      await page.waitForFunction((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory.maker.rate.id === 'sol', key);
    });
    await check(`${tag}: cancelled reset preserves inputs`, async () => {
      await dialog(page, () => page.getByRole('button', { name: 'Reset plan', exact: true }).click(), false);
      assert.equal(await page.getByLabel('Plan title', { exact: true }).inputValue(), title);
    });
    await check(`${tag}: report import restores editable inputs and survives reload`, async () => {
      await dialog(page, () => page.getByRole('button', { name: 'Reset plan', exact: true }).click(), true);
      await saved(page, 'My creator system');
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(reportPath), true);
      await saved(page, title); await page.reload();
      await saved(page, title); assert.equal(await page.getByLabel('Existing equipment and intended work', { exact: true }).inputValue(), notes);
    });
    await check(`${tag}: imported observation date remains an assumption in rendered and downloaded costs`, async () => {
      const changed = structuredClone(report); changed.plan.factory.maker.rate.observedAt = '2026-11-04';
      const importedFile = path.join(output, `${tag}-changed-rate-input.json`); fs.writeFileSync(importedFile, JSON.stringify(changed));
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(importedFile), true);
      await page.getByText('Imported rate or observation-date assumptions differ from the bundled snapshots. The cost comparison uses your assumptions.', { exact: true }).waitFor();
      await page.waitForFunction((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory.maker.rate.observedAt === '2026-11-04', key);
      const edited = JSON.parse(fs.readFileSync(await download(page, 'Export report JSON', `${tag}-changed-rate-report.json`), 'utf8'));
      assert.equal(edited.factory.ratesModified, true); assert.equal(edited.factory.rateEvidence[0].sourceObservedAt, '2026-10-03');
      assert.equal(edited.factory.rateEvidence[0].assumedObservedAt, '2026-11-04'); assert.equal(edited.factory.rateEvidence[0].kind, 'edited-assumption');
      assert.equal(edited.factory.modeledSubtotal.usd, report.factory.modeledSubtotal.usd);
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(reportPath), true);
      await page.waitForFunction((storageKey) => JSON.parse(localStorage.getItem(storageKey)).factory.maker.rate.observedAt === '2026-10-03', key);
    });
    await check(`${tag}: unsafe report import preserves the saved copy`, async () => {
      const before = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
      const unsafe = path.join(output, `${tag}-unsafe.json`); fs.writeFileSync(unsafe, JSON.stringify({ ...report, execute: true }));
      await page.getByLabel('Import editable plan', { exact: true }).setInputFiles(unsafe);
      await page.getByText('Unsupported report envelope. Your current draft is unchanged.', { exact: true }).waitFor();
      assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), before);
    });
    await check(`${tag}: unreadable saved copy survives cancelled import and reset`, async () => {
      await page.evaluate((storageKey) => localStorage.setItem(storageKey, '{broken'), key); await page.reload();
      await page.getByRole('button', { name: 'Export recovery copy', exact: true }).waitFor();
      for (const trigger of [() => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(reportPath), () => page.getByRole('button', { name: 'Reset plan', exact: true }).click()]) {
        assert.match(await dialog(page, trigger, false), /unreadable saved data/);
        assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), '{broken');
      }
    });
    await check(`${tag}: explicit report replacement recovers and removes the blocked state`, async () => {
      assert.match(await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(reportPath), true), /unreadable saved data/);
      await saved(page, title); await page.getByRole('button', { name: 'Export recovery copy', exact: true }).waitFor({ state: 'hidden' });
    });
    await check(`${tag}: blocked recovery plus another-tab change requires named replacement`, async () => {
      await page.evaluate((storageKey) => localStorage.setItem(storageKey, '{broken'), key); await page.reload();
      await page.getByRole('button', { name: 'Export recovery copy', exact: true }).waitFor();
      const other = await context.newPage(); await other.goto(origin + '/studio');
      await other.getByRole('button', { name: 'Export recovery copy', exact: true }).waitFor();
      await other.evaluate(([storageKey, raw]) => localStorage.setItem(storageKey, raw), [key, JSON.stringify(report.plan)]);
      await page.getByRole('button', { name: 'Save this draft instead', exact: true }).waitFor();
      assert.match(await dialog(page, () => page.getByRole('button', { name: 'Save this draft instead', exact: true }).click(), false), /unreadable saved data/);
      assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), JSON.stringify(report.plan));
      assert.match(await dialog(page, () => page.getByRole('button', { name: 'Save this draft instead', exact: true }).click(), true), /unreadable saved data/);
      await saved(page, 'My creator system');
      await page.getByRole('button', { name: 'Export recovery copy', exact: true }).waitFor({ state: 'hidden' });
      await other.close();
    });
    await check(`${tag}: import during a save conflict keeps the other copy and explains paused autosave`, async () => {
      const other = await context.newPage(); await other.goto(origin + '/studio');
      await other.getByLabel('Plan title', { exact: true }).waitFor();
      const otherRaw = JSON.stringify(report.plan);
      await other.evaluate(([storageKey, raw]) => localStorage.setItem(storageKey, raw), [key, otherRaw]);
      await page.getByRole('button', { name: 'Save this draft instead', exact: true }).waitFor();
      const imported = structuredClone(report); imported.plan.title = `${title} conflict import`;
      const conflictFile = path.join(output, `${tag}-conflict-input.json`); fs.writeFileSync(conflictFile, JSON.stringify(imported));
      await dialog(page, () => page.getByLabel('Import editable plan', { exact: true }).setInputFiles(conflictFile), true);
      await page.getByText('Editable inputs imported. Autosave stays paused to preserve the other saved copy; export this draft or choose a copy below.', { exact: true }).waitFor();
      assert.equal(await page.getByLabel('Plan title', { exact: true }).inputValue(), imported.plan.title);
      assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), otherRaw);
      await dialog(page, () => page.getByRole('button', { name: 'Save this draft instead', exact: true }).click(), true);
      await saved(page, imported.plan.title); await other.close();
    });
    await check(`${tag}: no external browser request or uncaught application error`, async () => {
      assert.deepEqual(blocked, []); assert.deepEqual(errors, []);
    });
  } finally { await context.close(); }
}
(async () => {
  let failure;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (server.exitCode !== null || server.signalCode !== null) throw Error('Owned Next server exited before readiness');
      try { ready = (await fetch(origin + '/studio', { signal: AbortSignal.timeout(1000) })).ok; } catch { /* retry bounded startup */ }
      if (ready) break; await delay(250);
    }
    assert.ok(ready, 'Owned Next server must become ready');
    browser = await chromium.launch({ headless: true }); receipt.browserVersion = browser.version();
    await exercise(1440); await exercise(390);
  } catch (error) { failure = error; receipt.error = error.stack; }
  finally {
    try { if (browser) { await browser.close(); receipt.browserClosed = true; } }
    catch (error) { failure ??= error; }
    const live = () => server.exitCode === null && server.signalCode === null;
    if (live()) server.kill('SIGTERM');
    for (let attempt = 0; attempt < 20 && live(); attempt++) await delay(100);
    if (live()) { server.kill('SIGKILL'); await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(1500)]); }
    receipt.serverExited = server.exitCode !== null || server.signalCode !== null;
    receipt.finishedAt = new Date().toISOString(); receipt.pass = !failure && receipt.serverExited && receipt.browserClosed;
    fs.writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    if (failure) fs.writeFileSync(path.join(output, 'owned-server.log'), serverLog);
    console.log(JSON.stringify({ pass: receipt.pass, checks: receipt.checks.length, testedCommit: receipt.testedCommit, serverExited: receipt.serverExited, browserClosed: receipt.browserClosed }));
  }
  if (failure) console.error(failure.message);
  if (!receipt.pass) process.exitCode = 1;
})();
