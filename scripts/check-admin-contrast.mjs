import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/pages/admin/admin.css', import.meta.url), 'utf8');
const token = (name) => {
  const match = css.match(new RegExp(`--ad-${name}:(#[0-9a-f]{6})`, 'i'));
  if (!match) throw new Error(`Missing owner panel token: ${name}`);
  return match[1];
};
const luminosity = (color) => {
  const rgb = color.slice(1).match(/.{2}/g).map((hex) => parseInt(hex,16)/255).map((v) => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const contrast = (one,two) => {
  const a = luminosity(one), b = luminosity(two);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
};
const pairs = [
  ['page text / background','text','bg',4.5],['panel text / panel','text','panel',4.5],
  ['muted text / panel','muted','panel',4.5],['muted text / sidebar','muted','side',4.5],
  ['link / panel','blue','panel',4.5],['focus / panel','focus','panel',3],
].map(([label,fg,bg,minimum]) => ({label,ratio:contrast(token(fg),token(bg)),minimum}));
const primaryButton = contrast('#10233a','#8bb8fa');
pairs.push({label:'primary button',ratio:primaryButton,minimum:4.5});
for (const {label,ratio,minimum} of pairs) {
  console.log(`${label}: ${ratio.toFixed(2)}:1 (minimum ${minimum}:1)`);
  if (ratio < minimum) process.exitCode = 1;
}
