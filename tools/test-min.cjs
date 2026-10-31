const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.run', 'min-check');
fs.mkdirSync(output, { recursive: true });
const url = process.env.MIN_TEST_URL || pathToFileURL(path.join(root, 'min/index.html')).href;
const report = { url, routes: 0, frames: 0, sizes: [], errors: [] };

function pauses(scenario, route) {
  const result = [];
  let id = scenario.start, score = 0, bg = null, char = null, decision = 0;
  for (let guard = 0; guard < 50; guard++) {
    const node = scenario.nodes[id];
    let next = node.next;
    for (const step of node.steps) {
      if (step.type === 'bg') bg = step.id;
      if (step.type === 'char') char = step.id;
      if (['say', 'choice', 'endcard'].includes(step.type)) {
        result.push({ ...step, bg, char, score, node: id });
      }
      if (step.type === 'choice') {
        const index = route[decision++];
        result.at(-1).pick = index;
        const option = step.options[index];
        next = option.next;
        score += option.score;
        break;
      }
      if (step.type === 'endcard') return result;
    }
    id = next;
  }
  throw new Error('Route did not finish');
}

async function checkFrame(page, frame, label, screenshot) {
  if (frame.type === 'say') await page.waitForFunction(text => document.getElementById('dialogueText').textContent === text, frame.text);
  if (frame.type === 'choice') await page.waitForSelector('#choiceBox.is-visible');
  if (frame.type === 'endcard') await page.waitForSelector('#endingCard.is-visible');
  if (frame.char && frame.type !== 'endcard') {
    await page.waitForFunction(id => {
      const image = document.getElementById('characterSprite');
      return image.getAttribute('src')?.endsWith('/' + id + '.webp') && image.dataset.fitted === 'true' &&
        image.complete && image.naturalWidth > 0 && image.classList.contains('is-visible');
    }, frame.char);
  }
  await page.waitForTimeout(40);
  const result = await page.evaluate(({ frame }) => {
    const rect = selector => {
      const el = document.querySelector(selector), r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const root = rect('#vnRoot');
    const title = rect('.hud-title'), logos = rect('.hud-logos'), mark = rect('.hud-unity-mark');
    const score = rect('#scoreBadge'), back = rect('#backButton');
    const overlap = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
    const elements = [title, logos, rect('.hud-unity-logo'), rect('.hud-actions')];
    const issues = [];
    if (document.documentElement.scrollWidth > innerWidth) issues.push('Page horizontal overflow');
    if (back.top < score.bottom) issues.push('Back above score');
    if (Math.max(title.bottom, logos.bottom, mark.bottom) - Math.min(title.bottom, logos.bottom, mark.bottom) > 1) issues.push('Brand baseline mismatch');
    elements.forEach((a, i) => {
      if (a.left < 0 || a.right > innerWidth + 1) issues.push('Header outside viewport');
      elements.slice(i + 1).forEach(b => { if (overlap(a, b)) issues.push('Header overlap'); });
    });
    if (document.getElementById('scoreBadge').textContent !== 'Гармония: ' + frame.score + '/30') issues.push('Score mismatch');
    let visible;
    if (frame.char && frame.type !== 'endcard') {
      const sprite = document.getElementById('characterSprite');
      const b = window.VN_ASSETS.spriteBounds[sprite.getAttribute('src')];
      const r = sprite.getBoundingClientRect(), scale = r.width / b.width;
      visible = { left: r.left + b.x * scale, right: r.left + b.right * scale,
        top: r.top + b.y * scale, bottom: r.top + b.bottom * scale, height: (b.bottom - b.y) * scale };
      const dock = rect('.story-dock'), stage = rect('.character-stage');
      if (Math.abs(visible.bottom - dock.top) > 1) issues.push('Character not touching text');
      if (visible.left < -1 || visible.right > innerWidth + 1 || visible.top < stage.top - 1) issues.push('Character outside stage');
      if (innerHeight > innerWidth && frame.type === 'say' && visible.height < Math.min(innerHeight * 0.4, stage.height * 0.9)) issues.push('Character too small');
      const activeBg = getComputedStyle(document.querySelector('.bg-layer.is-active')).backgroundImage;
      if (!activeBg.includes(frame.bg + '_')) issues.push('Wrong background');
    }
    const panel = rect(frame.type === 'endcard' ? '.ending-card__panel' : frame.type === 'choice' ? '#choiceBox' : '#dialogueBox');
    if (panel.bottom > root.bottom + 1 || panel.top < 0 || panel.right > innerWidth + 1) issues.push('Panel outside viewport');
    if (frame.type === 'endcard' && innerHeight > 540 && Math.abs((panel.top + panel.bottom) / 2 - innerHeight / 2) > 1) issues.push('Ending not centered');
    document.querySelectorAll(frame.type === 'choice' ? '.choice-btn' : '.dialogue-text').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 1) issues.push('Text horizontal overflow');
    });
    return { issues, visible, panel, viewport: [innerWidth, innerHeight] };
  }, { frame });
  assert.deepEqual(result.issues, [], label + ': ' + JSON.stringify(result));
  if (screenshot) {
    await page.waitForTimeout(380);
    await page.screenshot({ path: path.join(output, label + '.png') });
  }
  report.frames++;
}

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const sizes = process.env.MIN_SMOKE ? [[390, 844], [1440, 900]] :
      [[390, 844], [320, 568], [360, 640], [412, 915], [540, 720], [768, 1024], [900, 1400], [1024, 768], [1440, 900], [2560, 1440], [844, 390], [568, 320]];
    for (let sizeIndex = 0; sizeIndex < sizes.length; sizeIndex++) {
      const [width, height] = sizes[sizeIndex];
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      page.on('pageerror', e => report.errors.push(e.message));
      page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
      page.on('response', response => { if (response.status() >= 400) report.errors.push(response.status() + ' ' + response.url()); });
      const routes = sizeIndex === 0 && !process.env.MIN_SMOKE
        ? Array.from({ length: 27 }, (_, i) => [Math.floor(i / 9), Math.floor(i / 3) % 3, i % 3])
        : [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
      const captured = new Set();
      for (const route of routes) {
        await page.goto(url, { waitUntil: 'load' });
        const scenario = await page.evaluate(() => window.VN_SCENARIO);
        const frames = pauses(scenario, route);
        for (let index = 0; index < frames.length; index++) {
          const frame = frames[index];
          const key = frame.type === 'endcard' ? 'ending' : frame.type === 'choice' ? 'choice-' + frame.node : frame.char || frame.bg;
          const label = width + 'x' + height + '-' + key;
          const screenshot = !captured.has(key) && [390, 320, 412, 1440, 844].includes(width);
          await checkFrame(page, frame, label, screenshot);
          captured.add(key);
          if (index === frames.length - 1) {
            const body = await page.locator('#endingBody').textContent();
            assert.ok(body.includes(String(frame.score) + ' из 30'));
            if (frame.score === 30) assert.ok(body.includes('вы едины с природой'));
            await page.locator('#backButton').click();
            await checkFrame(page, frames[index - 1], label + '-back', false);
          } else if (frame.type === 'choice') {
            // Native keyboard activation must work, not be swallowed by advance.
            await page.locator('.choice-btn').nth(frame.pick).focus();
            await page.keyboard.press('Enter');
          } else {
            await page.locator('#dialogueBox').click();
          }
        }
        report.routes++;
      }
      // Change orientation mid-scene and verify the floor after asset replacement.
      await page.goto(url, { waitUntil: 'load' });
      const frames = pauses(await page.evaluate(() => window.VN_SCENARIO), [0, 1, 2]);
      await page.locator('#dialogueBox').click();
      await page.setViewportSize({ width: height, height: width });
      await page.waitForTimeout(350);
      await checkFrame(page, frames[1], `${width}x${height}-rotated`, false);
      report.sizes.push([width, height]);
      await page.close();
      console.log('PASS', width, height, routes.length, 'routes');
    }
    assert.deepEqual(report.errors, []);
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
