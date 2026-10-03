// Runs after the existing build on an ephemeral GitHub runner; refuses laptop execution.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
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
  noModelCalls: true, productionActivated: false, serverExited: false, browserClosed: false };
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
async function exercise(width) {
  const tag = width === 390 ? 'mobile' : 'desktop';
  const context = await browser.newContext({ viewport: { width, height: 1000 }, isMobile: width === 390, reducedMotion: 'reduce', acceptDownloads: true });
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
      assert.ok(report.purchaseReviews.length); assert.equal(report.purchaseReviews[0].deliveredTotalMinor, null);
    });
    await check(`${tag}: hardware-only share omits private work and factory assumptions`, async () => {
      const text = fs.readFileSync(await download(page, 'Export hardware only', `${tag}-hardware.md`), 'utf8');
      assert.ok(!text.includes(notes)); assert.ok(!text.includes(title)); assert.ok(!text.includes('Factory workload'));
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
