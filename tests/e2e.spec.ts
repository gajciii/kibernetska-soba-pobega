import { test, expect, type Page } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function checkLayout(page: Page) {
  const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, window: window.innerWidth }));
  expect(width.content).toBeLessThanOrEqual(width.window + 1);
}
async function expectFirstStage(page: Page) {
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Odpri prvo sled', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Razbij skrivno sporočilo', exact: true })).toBeVisible();
}
async function submit(page: Page, answer?: string, label = 'Odgovor') {
  if (answer) await page.getByLabel(label, { exact: true }).fill(answer);
  await page.getByRole('button', { name: 'Preveri odgovor', exact: true }).click();
  await expect(page.locator('main[aria-busy]')).toHaveAttribute('aria-busy', 'false');
}
async function next(page: Page) {
  const before = await page.locator('.stage-breadcrumb').textContent();
  await page.getByRole('button', { name: 'Nadaljuj', exact: true }).click();
  await expect(page.locator('.stage-breadcrumb')).not.toHaveText(before!);
  await expect(page.locator('main[aria-busy]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
  await checkLayout(page);
}

test('vseh osem stopenj, lokalni pripomočki, nadaljevanje in zaključek', async ({ page }, testInfo) => {
  const foreignRequests: string[] = [];
  const browserErrors: string[] = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173/')) foreignRequests.push(request.url()); });
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.goto('/');
  await page.getByLabel('Ime ekipe').fill('Digitalna preiskovalca');
  await page.screenshot({ path: `.local/qa-${testInfo.project.name}-intro.png`, fullPage: true });
  await page.getByRole('button', { name: 'Začni preiskavo', exact: true }).click();
  await expectFirstStage(page);
  const timeline = page.getByRole('navigation', { name: 'Stopnje preiskave' });
  await expect(timeline.locator('.step-dot')).toHaveCount(8);
  await expect(timeline.getByRole('button').first()).toContainText('01');
  await expect(timeline.getByRole('button').first()).toContainText('Razbij skrivno sporočilo');
  await expect(timeline.getByRole('button').last()).toContainText('08');
  await expect(timeline.getByRole('button').last()).toContainText('Računalnik govori v ničlah in enicah');
  if ((page.viewportSize()?.width ?? 0) >= 1200) {
    const sidebar = await page.locator('.sidebar').boundingBox();
    const main = await page.locator('.investigation-main').boundingBox();
    expect(sidebar).not.toBeNull();
    expect(main).not.toBeNull();
    expect(sidebar!.x).toBeGreaterThanOrEqual(main!.x + main!.width - 1);
  }
  await page.getByLabel('Premik nazaj po abecedi A–Z').focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'Dešifriraj', exact: true }).click();
  await expect(page.locator('output')).toHaveText('KODA JE MOST');
  await page.getByRole('button', { name: 'Razkrij namig 1', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Nadaljuj preiskavo', exact: true }).click();
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
  await expect(page.getByText('Vsako črko premakni za enako število mest.', { exact: true })).toBeVisible();
  await checkLayout(page);
  await submit(page, 'napacno');
  await expect(page.getByLabel('Odgovor', { exact: true })).toHaveValue('napacno');
  await expect(page.getByRole('alert')).toBeVisible();
  await submit(page, '  koda  je most  ');
  await page.screenshot({ path: `.local/qa-${testInfo.project.name}-stage.png`, fullPage: true });
  await next(page);
  await page.getByLabel('Besedilo za pretvorbo').fill('%%%');
  await page.getByRole('button', { name: 'Dekodiraj Base64' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Besedilo za pretvorbo').fill('PGI+dmFybm88L2I+');
  await page.getByRole('button', { name: 'Dekodiraj Base64' }).click();
  await expect(page.locator('output')).toHaveText('<b>varno</b>');
  await expect(page.locator('output b')).toHaveCount(0);
  await page.getByLabel('Besedilo za pretvorbo').fill('S09EQTogU09WQQ==');
  await page.getByRole('button', { name: 'Dekodiraj Base64' }).click();
  await expect(page.locator('output')).toHaveText('KODA: SOVA');
  await submit(page, 'sova'); await next(page);
  await page.getByRole('radio', { name: /Sporočilo B/ }).check();
  await page.getByRole('checkbox', { name: 'Domena pošiljatelja se ne ujema s šolsko domeno.' }).check();
  await submit(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Povezava vodi na drugo domeno.' }).check();
  await page.getByRole('checkbox', { name: 'Sporočilo uporablja HTTPS.' }).check();
  await submit(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Sporočilo uporablja HTTPS.' }).uncheck();
  await submit(page); await next(page);
  await page.getByRole('radio', { name: /Možnost A/ }).check();
  await submit(page); await next(page);
  await page.getByRole('button', { name: 'Poglej metapodatke' }).click();
  await expect(page.locator('#metadata')).toContainText('DateTimeOriginal: 2026:11:20 10:42:17');
  await submit(page, '11:15', 'Ura in minute');
  await expect(page.getByRole('alert')).toBeVisible();
  await submit(page, '10:42:17', 'Ura in minute'); await next(page);
  await page.getByLabel('Išči po vseh poljih dnevnika').fill('DOWNLOAD');
  await expect(page.getByText('Prikazano: 3 od 7 dogodkov')).toBeVisible();
  await page.getByRole('button', { name: 'Podrobnosti dogodka ob 10:45:12' }).click();
  await expect(page.locator('.log-detail')).toContainText('ucenec17');
  await checkLayout(page);
  await page.screenshot({ path: `.local/qa-${testInfo.project.name}-logs.png`, fullPage: true });
  await submit(page, 'ucenec08', 'Uporabniški račun');
  await expect(page.getByRole('alert')).toBeVisible();
  await submit(page, 'ucenec17', 'Uporabniški račun'); await next(page);
  await page.getByRole('radio', { name: /Možnost C/ }).check();
  await submit(page);
  await expect(page.getByRole('heading', { name: 'Kako preberemo te naslove' })).toBeVisible();
  await expect(page.locator('.solved-result')).toContainText('prijava-varno.example');
  await next(page);
  await page.getByLabel('Osembitne skupine, ločene s presledki ali novimi vrsticami').fill('101');
  await page.getByRole('button', { name: 'Pretvori v besedilo' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Osembitne skupine, ločene s presledki ali novimi vrsticami').fill('01001011 01001100 01001010 01010101 01000011');
  await page.getByRole('button', { name: 'Pretvori v besedilo' }).click();
  await expect(page.locator('output')).toHaveText('KLJUC');
  await submit(page, 'ključ');
  await expect(page.getByRole('heading', { name: 'Preiskava zaključena', exact: true })).toBeVisible();
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
  await expect(page.locator('.finale-stats')).toContainText('8 / 8');
  await expect(page.locator('.finale-stats')).toContainText('1uporabljenih namigov');
  await expect(page.locator('.completed-stages > div')).toHaveCount(8);
  await checkLayout(page);
  await page.screenshot({ path: `.local/qa-${testInfo.project.name}-finale.png`, fullPage: true });
  await page.reload();
  await page.getByRole('button', { name: 'Odpri zaključeno preiskavo' }).click();
  await expect(page.getByRole('heading', { name: 'Preiskava zaključena', exact: true })).toBeVisible();
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
  expect(foreignRequests).toEqual([]);
  expect(browserErrors).toEqual([]);
});

test('napaka omrežja ohrani odgovor; ponastavitev zahteva potrditev', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni preiskavo', exact: true }).click();
  await expectFirstStage(page);
  await page.route('**/api/stages/1/answer', route => route.abort());
  await submit(page, 'MOST');
  await expect(page.getByRole('alert')).toContainText('Vnos je ohranjen');
  await expect(page.getByLabel('Odgovor', { exact: true })).toHaveValue('MOST');
  await page.unroute('**/api/stages/1/answer');
  await submit(page);
  await page.getByRole('button', { name: 'Ponastavi preiskavo' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ohrani preiskavo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Izbriši in začni znova' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Ohrani preiskavo' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ponastavi preiskavo' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Nadaljuj', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ponastavi preiskavo' }).click();
  await page.getByRole('button', { name: 'Izbriši in začni znova' }).click();
  await expect(page.getByRole('button', { name: 'Začni preiskavo', exact: true })).toBeVisible();
});

test('zaprt in ponovno odprt brskalnik ohrani trajno sejo', async ({ playwright, browserName }, testInfo) => {
  const browserType = playwright[browserName];
  const profile = mkdtempSync(join(tmpdir(), 'operacija404-profile-'));
  const options = { headless: true, channel: testInfo.project.use.channel, ...testInfo.project.use.launchOptions, viewport: testInfo.project.use.viewport };
  let context;
  try {
    context = await browserType.launchPersistentContext(profile, options);
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    await page.getByRole('button', { name: 'Začni preiskavo', exact: true }).click();
    await expectFirstStage(page);
    await submit(page, 'MOST');
    expect((await context.cookies())[0].expires).toBeGreaterThan(Date.now() / 1000);
    // Zapre tudi proces brskalnika; drugi zagon prebere piškotke iz istega profila.
    await context.close();
    context = await browserType.launchPersistentContext(profile, options);
    const otherPage = await context.newPage();
    await otherPage.goto('http://127.0.0.1:4173/');
    await otherPage.getByRole('button', { name: 'Nadaljuj preiskavo', exact: true }).click();
    await expect(otherPage.getByText('Stopnja 2 od 8', { exact: true })).toBeVisible();
    await expect(otherPage.getByTestId('dark-entry')).toHaveCount(0);
  } finally {
    await context?.close();
    rmSync(profile, { recursive: true, force: true });
  }
});

test('svetilka spremlja naslov vsake naloge brez dodatnega uvoda in ohrani berljivo vsebino', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni preiskavo', exact: true }).click();
  await expectFirstStage(page);
  const title = page.getByTestId('spotlight-title');
  const light = page.getByTestId('title-light');
  await expect(title.getByRole('heading', { name: 'Razbij skrivno sporočilo', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dokazno gradivo', exact: true })).toBeVisible();
  await expect(page.getByLabel('Odgovor', { exact: true })).toBeVisible();
  const supportsPointerLight = await page.evaluate(() =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && CSS.supports('mask-image', 'radial-gradient(circle, transparent, black)'),
  );
  if (supportsPointerLight) {
    await expect(light).toHaveCount(1);
    await expect(light).toHaveAttribute('aria-hidden', 'true');
    const bounds = await title.boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.move(bounds!.x + 12, bounds!.y + 12);
    await expect(light).toHaveAttribute('style', /--light-x:\s*[\d.]+px/);
    const previousStyle = await light.getAttribute('style');
    await page.mouse.move(bounds!.x + bounds!.width - 12, bounds!.y + bounds!.height - 12);
    await expect(light).not.toHaveAttribute('style', previousStyle!);
  } else {
    await expect(light).toHaveCount(0);
  }
  await checkLayout(page);
  await page.screenshot({ path: `.local/qa-${testInfo.project.name}-title-light.png`, fullPage: true });
  await submit(page, 'MOST');
  await next(page);
  await expect(title.getByRole('heading', { name: 'Kaj se skriva za čudnimi znaki?', exact: true })).toBeVisible();
  await expect(light).toHaveCount(supportsPointerLight ? 1 : 0);
  await expect(page.getByLabel('Besedilo za pretvorbo')).toBeVisible();
  await page.getByRole('navigation', { name: 'Stopnje preiskave' }).getByRole('button', { name: /Razbij skrivno sporočilo/ }).click();
  await expectFirstStage(page);
  await expect(light).toHaveCount(supportsPointerLight ? 1 : 0);
  await page.reload();
  await page.getByRole('button', { name: 'Nadaljuj preiskavo', exact: true }).click();
  await expect(page.getByText('Stopnja 2 od 8', { exact: true })).toBeVisible();
  await expect(title.getByRole('heading', { name: 'Kaj se skriva za čudnimi znaki?', exact: true })).toBeVisible();
  await expect(light).toHaveCount(supportsPointerLight ? 1 : 0);
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
});

test('zmanjšano gibanje ohrani naslove in naloge brez svetilke ter uporabo s tipkovnico', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Začni preiskavo', exact: true }).click();
  await expectFirstStage(page);
  await expect(page.getByTestId('spotlight-title')).toBeVisible();
  await expect(page.getByTestId('title-light')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Dokazno gradivo', exact: true })).toBeVisible();
  await expect(page.locator('.code-evidence code')).toHaveText('NRGD MH PRVW');
  await checkLayout(page);
  await page.getByLabel('Odgovor', { exact: true }).focus();
  await page.keyboard.type('MOST');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Dokaz je razvozlan', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nadaljuj', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Kaj se skriva za čudnimi znaki?', exact: true })).toBeVisible();
  await expect(page.getByTestId('title-light')).toHaveCount(0);
  await expect(page.getByTestId('dark-entry')).toHaveCount(0);
  await expect(page.getByLabel('Besedilo za pretvorbo')).toBeVisible();
});
