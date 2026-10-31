const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'min');
const context = { window: {} };
for (const file of ['data/scenario.js', 'data/assets.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const source = context.window.VN_SCENARIO;
const originalAssets = context.window.VN_ASSETS;
const clone = value => JSON.parse(JSON.stringify(value));
const step = (node, index) => clone(source.nodes[node].steps[index]);
const bg = id => ({ type: 'bg', id });
const char = id => ({ type: 'char', id });
const node = (steps, next) => next ? { steps, next } : { steps };
const intro = step('intro', 8);
intro.text = intro.text.slice(0, intro.text.indexOf('.') + 1);
const ending = step('scene6_finale', 3);
ending.body = ending.body.replace('80', '30');

// Only selection, ordering and score denominator change; narrative stays verbatim.
const scenario = {
  title: source.title,
  maxScore: 30,
  instantText: true,
  start: 'intro',
  nodes: {
    intro: node([bg('scene1'), char(null), step('intro', 3), bg('scene4'), char('yanseli3'), intro], 'fire_intro'),
    fire_intro: node([char('yanseli8'), step('fire_intro', 4), step('fire_intro', 5)]),
    fire_1: node([bg('scene9_10'), char('yanseli6'), step('fire_1', 5)], 'scene2_intro'),
    fire_2: node([char('yanseli10'), step('fire_2', 3)], 'scene2_intro'),
    fire_3: node([char('yanseli3'), step('fire_3', 2)], 'scene2_intro'),
    scene2_intro: node([bg('s2_intro'), char('s2_yanseli_intro'), step('scene2_intro', 4), step('scene2_intro', 5)]),
    scene2_water_luck: node([char('s2_yanseli_neutral'), step('scene2_water_luck', 1)], 'scene5_intro'),
    scene2_water_knowledge: node([char('s2_yanseli_kind'), step('scene2_water_knowledge', 1)], 'scene5_intro'),
    scene2_water_silent: node([char('s2_yanseli_angry'), step('scene2_water_silent', 1)], 'scene5_intro'),
    scene5_intro: node([bg('s5_intro'), char('s5_elder_neutral'), step('scene5_intro', 5), step('scene5_intro', 6)]),
    scene5_choice_weapon: node([char('s5_elder_displeased'), step('scene5_choice_weapon', 2)], 'finale'),
    scene5_choice_supplies: node([char('s5_elder_displeased'), step('scene5_choice_supplies', 2)], 'finale'),
    scene5_choice_offering: node([char('s5_elder_pleased'), step('scene5_choice_offering', 2)], 'finale'),
    finale: node([bg('s6_final'), char(null), step('scene6_finale', 2), ending])
  }
};

const sourceLines = Object.values(source.nodes).flatMap(n => n.steps.filter(s => s.type === 'say').map(s => s.text));
const backgrounds = new Set();
const characters = new Set();
for (const n of Object.values(scenario.nodes)) {
  if (n.next && !scenario.nodes[n.next]) throw new Error(`Missing next: ${n.next}`);
  for (const s of n.steps) {
    if (s.type === 'say' && !sourceLines.some(text => text.includes(s.text))) throw new Error('Non-source narrative');
    if (s.type === 'bg') backgrounds.add(s.id);
    if (s.type === 'char' && s.id) characters.add(s.id);
    if (s.type === 'choice') {
      for (const option of s.options) {
        if (!scenario.nodes[option.next]) throw new Error(`Missing choice: ${option.next}`);
      }
    }
  }
}
const assets = {
  backgrounds: Object.fromEntries([...backgrounds].map(id => [id, originalAssets.backgrounds[id]])),
  characters: Object.fromEntries([...characters].map(id => [id, originalAssets.characters[id]]))
};
const files = new Set(['favicon.ico', 'apple-touch-icon.png', 'js/app.js', 'О сайте для презентации.txt',
  'optimized/ui/logo-mp.svg', 'optimized/ui/logo-so.png', 'optimized/ui/logo-unity-2026.png',
  ...ending.links.map(link => link.buttonAsset)]);
for (const record of [...Object.values(assets.backgrounds), ...Object.values(assets.characters)]) {
  for (const file of Object.values(record)) files.add(file);
}
for (const file of files) {
  const target = path.join(out, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
fs.mkdirSync(path.join(out, 'data'), { recursive: true });
fs.writeFileSync(path.join(out, 'data/scenario.js'), `window.VN_SCENARIO = ${JSON.stringify(scenario, null, 2)};\n`);
const spriteFiles = [...new Set(Object.values(assets.characters).flatMap(Object.values))];
const geometry = JSON.parse(execFileSync('python', [path.join(__dirname, 'measure-sprites.py')], {
  input: JSON.stringify(spriteFiles), cwd: root, encoding: 'utf8'
}));
assets.spriteBounds = geometry;
fs.writeFileSync(path.join(out, 'data/assets.js'), `window.VN_ASSETS = ${JSON.stringify(assets, null, 2)};\n`);

const words = text => (text.match(/[\p{L}\p{N}]+(?:[-—][\p{L}\p{N}]+)*/gu) || []).length;
const routes = [];
function walk(id, count = 0, score = 0, choices = 0, visited = []) {
  if (visited.includes(id)) throw new Error('Scenario loop');
  const n = scenario.nodes[id];
  for (const s of n.steps) {
    if (s.type === 'say') count += words(s.text);
    if (s.type === 'choice') {
      count += words(s.question) + s.options.reduce((sum, o) => sum + words(o.text), 0);
      for (const o of s.options) walk(o.next, count, score + o.score, choices + 1, [...visited, id]);
      return;
    }
    if (s.type === 'endcard') {
      routes.push({ words: count, score, choices });
      return;
    }
  }
  if (n.next) walk(n.next, count, score, choices, [...visited, id]);
  else throw new Error('Route without an ending');
}
walk(scenario.start);
if (Math.max(...routes.map(r => r.score)) !== scenario.maxScore) throw new Error('Wrong score maximum');
console.log(JSON.stringify({ files: files.size + 5, backgrounds: backgrounds.size, characters: characters.size,
  routes: routes.length, words: [Math.min(...routes.map(r => r.words)), Math.max(...routes.map(r => r.words))],
  scores: [...new Set(routes.map(r => r.score))].sort((a, b) => a - b), choices: [...new Set(routes.map(r => r.choices))]
}, null, 2));
