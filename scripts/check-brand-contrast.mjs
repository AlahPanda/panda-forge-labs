import { readFileSync } from 'node:fs';

const css = readFileSync('src/index.css', 'utf8');
const root = css.slice(css.indexOf('  :root {'), css.indexOf('  .dark {'));
const dark = css.slice(css.indexOf('  .dark {'), css.indexOf('\n}\n\n@layer base', css.indexOf('  .dark {')));
function channels(block, key) {
  const raw = block.match(new RegExp(`^\\s*--${key}: ([^;]+);`, 'm'))?.[1]?.trim();
  if (!raw) throw new Error(`Missing ${key}`);
  if (raw.startsWith('var(')) return channels(block, raw.slice(6, -1));
  const parts = raw.split(/\s+/).map(parseFloat);
  if (parts.length !== 3 || parts.some(Number.isNaN)) throw new Error(`Unsupported token ${key}: ${raw}`);
  return parts;
}
function luminance([h, saturation, lightness]) {
  const s = saturation / 100, l = lightness / 100;
  const channel = (n) => {
    const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  };
  return .2126 * channel(0) + .7152 * channel(8) + .0722 * channel(4);
}
const pairs = [
  ['body', 'foreground', 'background'], ['muted', 'muted-foreground', 'background'],
  ['card', 'card-foreground', 'card'], ['secondary', 'secondary-foreground', 'secondary'],
  ['primary button', 'primary-foreground', 'primary'], ['primary link', 'primary', 'background'],
  ['subtle accent', 'accent-foreground', 'accent'], ['beta badge', 'status-beta', 'card'],
  ['development badge', 'status-development', 'card'], ['stable badge', 'status-stable', 'card'],
  ['archived badge', 'status-archived', 'card'],
];
let failures = 0;
for (const [theme, block] of [['Day', root], ['Night', dark]]) {
  for (const [label, foreground, background] of pairs) {
    const a = luminance(channels(block, foreground)), b = luminance(channels(block, background));
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    console.log(`${theme} ${label}: ${ratio.toFixed(2)}:1`);
    if (ratio < 4.5) failures++;
  }
}
if (failures) { console.error(`${failures} contrast pair(s) below WCAG AA normal text`); process.exitCode = 1; }
