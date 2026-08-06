/* ══════════════════════════════════════════════════════
   SHADOW MONARCH GENERATOR
   Builds a paste-ready SeenU layout-code block from form
   input, and mirrors it live in an on-page preview that
   uses the SAME class hooks as the exported code — so one
   generated <style> block styles both simultaneously.
   ══════════════════════════════════════════════════════ */

const STORAGE_KEY = 'shadowMonarchGeneratorState_v1';
const CHAR_LIMIT = 20000;

/* ---------------- Color utils ---------------- */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  const mix = c => Math.max(0, Math.min(255, Math.round(c + (255 - c) * amt)));
  return '#' + [mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function isValidHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v); }
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function uid() { return 'r' + Math.random().toString(36).slice(2, 9); }

/* ---------------- Default state ---------------- */
function defaultState() {
  return {
    identity: { name: 'YOUR NAME', title: 'Shadow Monarch', cls: 'Necromancer', guild: '', level: 'MAX' },
    rank: { enabled: true, text: 'S-RANK', top: 13, left: -12 },
    splash: { enabled: true, line1: '⟨ SYSTEM ⟩', line2: 'PLAYER HAS LOGGED IN.', line3: 'WELCOME BACK, MONARCH', once: true },
    record: {
      enabled: true, top: -34, left: 208,
      rows: [
        { id: uid(), label: '⚔ SHADOWS EXTRACTED', value: '001337' },
        { id: uid(), label: '🗡 GATES CLEARED', value: '000108' }
      ]
    },
    quest: {
      enabled: true,
      subtitle: 'PREPARATION FOR BECOMING STRONG',
      warningEnabled: true,
      warning: '⚠ FAILURE WILL RESULT IN PENALTY',
      rows: [
        { id: uid(), label: 'PUSH-UPS', value: '100/100', done: true },
        { id: uid(), label: 'SIT-UPS', value: '100/100', done: true },
        { id: uid(), label: 'RUNNING', value: '10KM/10KM', done: true }
      ]
    },
    status: { enabled: true },
    colors: { primary: '#3d7bff', secondary: '#6e28ff', accent: '#e8b923', bg: '#06060c' },
    bgImage: '',
    effects: {
      scanlines: true, grain: true, glitch: true, shimmer: true,
      hoverPowerup: true, notch: true,
      scrollbar: true, cursor: true,
      postGradient: true, statsTypography: true, platformFixes: true
    }
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    // shallow-merge onto defaults so new fields in future versions don't break old saves
    const d = defaultState();
    return {
      identity: { ...d.identity, ...saved.identity },
      rank: { ...d.rank, ...saved.rank },
      splash: { ...d.splash, ...saved.splash },
      record: { ...d.record, ...saved.record, rows: saved.record?.rows?.length ? saved.record.rows : d.record.rows },
      quest: { ...d.quest, ...saved.quest, rows: saved.quest?.rows?.length ? saved.quest.rows : d.quest.rows },
      status: { ...d.status, ...saved.status },
      colors: { ...d.colors, ...saved.colors },
      bgImage: saved.bgImage ?? d.bgImage,
      effects: { ...d.effects, ...saved.effects }
    };
  } catch (e) {
    return defaultState();
  }
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }, 350);
}

/* ---------------- CSS block builders ---------------- */
function blockFonts() {
  return `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Orbitron:wght@600&display=swap');`;
}

function blockBackground(s) {
  const layers = [];
  layers.push(`radial-gradient(ellipse at 50% 0%, ${rgba(s.colors.secondary, 0.25)} 0%, transparent 55%)`);
  layers.push(`radial-gradient(ellipse at 80% 100%, ${rgba(s.colors.primary, 0.15)} 0%, transparent 50%)`);
  if (s.bgImage.trim()) {
    layers.push(`url("${s.bgImage.trim()}") center center / cover no-repeat fixed`);
  }
  layers.push(`${s.colors.bg} !important`);
  return `
body, .seenu-profile-root {
  background: ${layers.join(',\n    ')};
  background-attachment: fixed;
  color: #cfd8ff;
  font-family: 'Rajdhani', sans-serif;
}`;
}

function blockAtmosphere(s) {
  if (!s.effects.scanlines && !s.effects.grain) return '';
  const layers = [];
  if (s.effects.scanlines) {
    layers.push(`repeating-linear-gradient(transparent, transparent 2px, ${rgba(s.colors.primary, 0.035)} 3px)`);
  }
  if (s.effects.grain) {
    layers.push(`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E")`);
  }
  return `
.seenu-profile-root::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background: ${layers.join(',\n    ')};
}`;
}

function blockSplashCss(s) {
  if (!s.splash.enabled) return '';
  return `
.sysSplash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  height: 92vh;
  width: 100%;
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 10000;
  overflow: hidden;
  background: ${rgba(s.colors.bg, 0.97)};
  border-bottom: 1px solid ${rgba(s.colors.primary, 0.6)};
  box-shadow: 0 0 40px ${rgba(s.colors.primary, 0.35)};
  color: ${lighten(s.colors.primary, 0.15)};
  font-family: 'Orbitron', sans-serif;
  font-size: 2.4rem;
  letter-spacing: 0.35em;
  line-height: 1.8;
  text-shadow: 0 0 16px ${s.colors.primary}, 0 0 55px ${s.colors.secondary};
  animation: sysIntro 4.5s ease 0.5s 1 normal forwards;
  pointer-events: none;
}
.sysSplash small {
  font-size: 0.85rem;
  letter-spacing: 0.45em;
  color: ${lighten(s.colors.primary, 0.2)};
  text-shadow: 0 0 10px ${rgba(s.colors.primary, 0.9)};
  animation: qwBlink 1.4s ease-in-out infinite;
}
@keyframes sysIntro {
  0%   { opacity: 1; height: 92vh; }
  65%  { opacity: 1; }
  88%  { opacity: 0; height: 92vh; }
  100% { opacity: 0; height: 0; visibility: hidden; display: none; }
}
@media (prefers-reduced-motion: reduce) { .sysSplash { display: none; } }`;
}

function blockCards(s) {
  const hover = s.effects.hoverPowerup ? `
.seenu-card { transition: box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease; }
.seenu-card:hover {
  border-color: ${s.colors.secondary} !important;
  box-shadow: 0 0 24px ${rgba(s.colors.secondary, 0.75)}, 0 0 60px ${rgba(s.colors.secondary, 0.35)}, inset 0 0 40px ${rgba(s.colors.secondary, 0.12)};
  transform: translateY(-2px);
}
.seenu-card:hover .seenu-card-title:before { color: ${s.colors.accent}; text-shadow: 0 0 10px ${rgba(s.colors.accent, 0.95)}; }
@media (prefers-reduced-motion: reduce) { .seenu-card:hover { transform: none; } }` : '';

  const shimmer = s.effects.shimmer ? `
.seenu-card-title { position: relative; overflow: hidden; }
.seenu-card-title::after {
  content: "";
  position: absolute; top: 0; left: -100%;
  width: 45%; height: 100%;
  background: linear-gradient(100deg, transparent, ${rgba(lighten(s.colors.primary, 0.3), 0.35)}, transparent);
  animation: sysRefresh 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes sysRefresh { 0% { left: -100%; } 60% { left: 150%; } 100% { left: 150%; } }` : '';

  return `
.seenu-card {
  background: ${rgba(lighten(s.colors.bg, 0.08), 0.82)} !important;
  border: 1px solid ${s.colors.primary} !important;
  border-radius: 4px;
  box-shadow: 0 0 12px ${rgba(s.colors.primary, 0.55)}, inset 0 0 30px ${rgba(s.colors.primary, 0.08)};
  backdrop-filter: blur(3px);
  overflow: hidden;
  margin-bottom: 18px;
}
${hover}
.seenu-card-title {
  font-family: 'Orbitron', sans-serif;
  color: ${lighten(s.colors.primary, 0.2)} !important;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  text-shadow: 0 0 8px ${rgba(s.colors.primary, 0.9)};
  border-bottom: 1px solid ${rgba(s.colors.primary, 0.5)};
  padding: 8px 10px 6px !important;
}
.seenu-card-title:before { content: "⟡ "; color: ${lighten(s.colors.secondary, 0.2)}; text-shadow: 0 0 8px ${rgba(s.colors.secondary, 0.9)}; }
${shimmer}
.seenu-card-body { color: #cfd8ff !important; padding: 12px !important; line-height: 1.5; }`;
}

function blockName(s) {
  const glitch = s.effects.glitch ? `,
    nameGlitch 7s steps(1) infinite` : '';
  const glitchKeyframes = s.effects.glitch ? `
@keyframes nameGlitch {
  0%, 91%, 100% { transform: none; }
  92% { transform: translate(2px, -1px) skewX(4deg); }
  93% { transform: translate(-3px, 1px) skewX(-4deg); }
  94% { transform: translate(1px, 0) skewX(2deg); }
  95% { transform: none; }
}` : '';
  return `
.seenu-name {
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  background: linear-gradient(90deg, ${s.colors.primary}, ${s.colors.secondary}, ${lighten(s.colors.secondary, 0.4)}, ${s.colors.primary});
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent !important;
  filter: drop-shadow(0 0 8px ${rgba(s.colors.secondary, 0.85)}) drop-shadow(0 0 24px ${rgba(s.colors.primary, 0.5)});
  animation: nameFlow 8s linear infinite${glitch};
}
@keyframes nameFlow { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
${glitchKeyframes}
@media (prefers-reduced-motion: reduce) { .seenu-name { animation: nameFlow 8s linear infinite; } }
.seenu-name + p, .seenu-name + div, .seenu-name + span {
  font-family: 'Rajdhani', sans-serif !important;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: ${lighten(s.colors.primary, 0.1)} !important;
  text-shadow: 0 0 8px ${rgba(s.colors.primary, 0.6)};
}`;
}

function blockLinksButtons(s) {
  return `
.seenu-profile-root a:link, .seenu-profile-root a:visited {
  color: ${lighten(s.colors.primary, 0.1)} !important;
  font-weight: 700;
  text-decoration: none;
  text-shadow: 0 0 6px ${rgba(s.colors.primary, 0.6)};
  transition: all 0.2s ease;
}
.seenu-profile-root a:hover {
  color: ${lighten(s.colors.secondary, 0.25)} !important;
  text-shadow: 0 0 10px ${rgba(s.colors.secondary, 0.8)}, 0 0 25px ${rgba(s.colors.secondary, 0.6)};
}
button {
  background: linear-gradient(180deg, #16234d, #0a1128) !important;
  color: ${lighten(s.colors.primary, 0.2)} !important;
  font-family: 'Orbitron', sans-serif !important;
  border: 1px solid ${s.colors.primary} !important;
  border-radius: 3px !important;
  letter-spacing: 0.15em;
  text-shadow: 0 0 6px ${rgba(s.colors.primary, 0.7)};
  transition: all 0.2s ease;
}
button:hover {
  box-shadow: 0 0 15px ${rgba(s.colors.primary, 0.8)};
  color: ${lighten(s.colors.secondary, 0.25)} !important;
  border-color: ${s.colors.secondary} !important;
}`;
}

function blockScrollbarCursor(s) {
  let out = '';
  if (s.effects.scrollbar) {
    out += `
::-webkit-scrollbar { width: 12px; }
::-webkit-scrollbar-track { background: ${s.colors.bg}; border-left: 1px solid ${rgba(s.colors.primary, 0.3)}; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, ${lighten(s.colors.primary, 0.15)}, ${s.colors.secondary});
  border-radius: 6px; border: 2px solid ${s.colors.bg};
  box-shadow: 0 0 8px ${rgba(s.colors.primary, 0.6)};
}
::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, ${lighten(s.colors.primary, 0.3)}, ${lighten(s.colors.secondary, 0.15)}); }
* { scrollbar-width: thin; scrollbar-color: ${s.colors.primary} ${s.colors.bg}; }`;
  }
  if (s.effects.cursor) {
    out += `
* , .seenu-profile-root, .seenu-profile-root * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='40%25'%3E%3Cstop offset='0%25' stop-color='${encodeURIComponent(lighten(s.colors.secondary, 0.3))}'/%3E%3Cstop offset='60%25' stop-color='${encodeURIComponent(s.colors.secondary)}'/%3E%3Cstop offset='100%25' stop-color='${encodeURIComponent(s.colors.secondary)}' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='10' cy='10' r='9' fill='url(%23g)'/%3E%3Cpath d='M10 2 L13 10 L10 8 L7 10 Z' fill='${encodeURIComponent(lighten(s.colors.secondary, 0.4))}'/%3E%3C/svg%3E") 4 4, auto !important;
}`;
  }
  return out;
}

function notchClip(px) {
  return `clip-path: polygon(${px}px 0, calc(100% - ${px}px) 0, 100% ${px}px, 100% calc(100% - ${px}px), calc(100% - ${px}px) 100%, ${px}px 100%, 0 calc(100% - ${px}px), 0 ${px}px);`;
}

function blockGate(s) {
  if (!s.rank.enabled) return '';
  return `
@keyframes gateSpin { 100% { transform: rotate(360deg); } }
@keyframes gateSpinRev { 100% { transform: rotate(-360deg); } }
.gateSigil {
  position: absolute;
  top: ${s.rank.top}px;
  left: ${s.rank.left}px;
  width: 170px; height: 170px;
  display: flex; justify-content: center; align-items: center;
  pointer-events: none;
  z-index: 15;
}
.gateSigil .ringOuter, .gateSigil .ringInner {
  position: absolute; border-radius: 50%;
  border: 2px dashed ${s.colors.primary};
  box-shadow: 0 0 15px ${rgba(s.colors.primary, 0.7)}, inset 0 0 15px ${rgba(s.colors.primary, 0.4)};
}
.gateSigil .ringOuter { width: 148px; height: 148px; animation: gateSpin 12s linear infinite; }
.gateSigil .ringInner {
  width: 134px; height: 134px; border-style: dotted; border-color: ${s.colors.secondary};
  box-shadow: 0 0 15px ${rgba(s.colors.secondary, 0.7)}, inset 0 0 15px ${rgba(s.colors.secondary, 0.4)};
  animation: gateSpinRev 8s linear infinite;
}
.gateSigil .rankTag {
  position: absolute; top: -16px; left: 0; width: 100%; text-align: center;
  font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: 600;
  letter-spacing: 0.45em; text-indent: 0.45em;
  background: linear-gradient(90deg, ${lighten(s.colors.accent, 0.25)}, ${lighten(s.colors.accent, 0.55)}, ${s.colors.accent}, ${lighten(s.colors.accent, 0.4)}, ${lighten(s.colors.accent, 0.25)});
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
  filter: drop-shadow(0 0 6px ${rgba(s.colors.accent, 0.9)}) drop-shadow(0 0 18px ${rgba(s.colors.accent, 0.55)});
  animation: nameFlow 6s linear infinite, rankPulse 2.4s ease-in-out infinite;
}
.gateSigil .rankTag::before { content: "✦ "; }
.gateSigil .rankTag::after { content: " ✦"; }
@keyframes rankPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@media (prefers-reduced-motion: reduce) { .gateSigil .ringOuter, .gateSigil .ringInner { animation: none; } }
@media (max-width: 1100px) { .gateSigil { display: none; } }`;
}

function windowShellCss(s, notch) {
  const clip = notch && s.effects.notch ? notchClip(12) : 'border-radius: 4px;';
  return `
  ${clip}
  background:
    repeating-linear-gradient(transparent, transparent 2px, ${rgba(s.colors.primary, 0.05)} 3px),
    linear-gradient(180deg, ${rgba(s.colors.secondary, 0.35)}, ${rgba(s.colors.bg, 0.95)});
  box-shadow: 0 0 14px ${rgba(s.colors.primary, 0.65)}, 0 0 34px ${rgba(s.colors.secondary, 0.35)}, inset 0 0 22px ${rgba(s.colors.primary, 0.12)};`;
}

function blockStatusWindow(s) {
  if (!s.status.enabled) return '';
  return `
.statusWindow {
  font-family: 'Rajdhani', sans-serif;
  color: #cfd8ff;
  border: 1px solid ${s.colors.primary};
  padding: 12px 16px; margin: 10px auto; max-width: 340px;
  ${windowShellCss(s, true)}
}
.statusWindow .swTitle {
  font-family: 'Orbitron', sans-serif;
  color: ${lighten(s.colors.primary, 0.2)};
  text-align: center; letter-spacing: 0.3em;
  border-bottom: 1px solid ${rgba(s.colors.primary, 0.5)};
  margin-bottom: 8px; padding-bottom: 4px;
}
.statusWindow .swRow { display: flex; justify-content: space-between; padding: 2px 0; }
.statusWindow .swRow b { color: ${lighten(s.colors.primary, 0.1)}; }
.statusWindow .swRow .lv { color: ${lighten(s.colors.secondary, 0.2)}; text-shadow: 0 0 8px ${rgba(s.colors.secondary, 0.8)}; font-weight: 700; }`;
}

function blockRecordWindow(s) {
  if (!s.record.enabled) return '';
  return `
.monarchRecord {
  position: absolute;
  top: ${s.record.top}px; left: ${s.record.left}px;
  width: 330px; margin: 0; z-index: 20;
  padding: 8px 14px;
  animation: counterPulse 3s ease-in-out infinite;
}
@keyframes counterPulse {
  0%, 100% { box-shadow: 0 0 14px ${rgba(s.colors.primary, 0.65)}, 0 0 34px ${rgba(s.colors.secondary, 0.35)}, inset 0 0 22px ${rgba(s.colors.primary, 0.12)}; }
  50% { box-shadow: 0 0 22px ${rgba(s.colors.secondary, 0.75)}, 0 0 46px ${rgba(s.colors.secondary, 0.45)}, inset 0 0 28px ${rgba(s.colors.secondary, 0.18)}; }
}
@media (max-width: 1100px) { .monarchRecord { position: static; width: auto; max-width: 340px; margin: 14px auto; } }`;
}

function blockQuestWindow(s) {
  if (!s.quest.enabled) return '';
  return `
.questWindow {
  font-family: 'Rajdhani', sans-serif;
  color: #cfd8ff;
  border: 1px solid ${s.colors.primary};
  padding: 12px 16px; margin: 14px auto; max-width: 340px;
  ${windowShellCss(s, true)}
}
.questWindow .qwTitle {
  font-family: 'Orbitron', sans-serif;
  color: ${lighten(s.colors.primary, 0.2)};
  text-align: center; letter-spacing: 0.25em;
  border-bottom: 1px solid ${rgba(s.colors.primary, 0.5)};
  margin-bottom: 8px; padding-bottom: 4px;
}
.questWindow .qwSub { text-align: center; font-size: 0.8rem; color: #8fa8d8; margin-bottom: 8px; letter-spacing: 0.1em; }
.questWindow .qwRow { display: flex; justify-content: space-between; padding: 2px 0; }
.questWindow .qwRow b { color: ${lighten(s.colors.primary, 0.1)}; font-weight: 700; }
.questWindow .qwRow .done { color: #7dff9b; text-shadow: 0 0 6px rgba(125,255,155,.7); }
.questWindow .qwWarn {
  margin-top: 10px; padding-top: 8px;
  border-top: 1px dashed rgba(255,77,77,0.5);
  text-align: center; font-size: 0.72rem; letter-spacing: 0.15em;
  color: #ff4d4d; text-shadow: 0 0 8px rgba(255,77,77,0.8);
  animation: qwBlink 1.6s ease-in-out infinite;
}
@keyframes qwBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .questWindow .qwWarn { animation: none; } }`;
}

function blockPlatformFixes(s) {
  if (!s.effects.platformFixes) return '';
  let out = `
.seenu-profile-root span[class*="h-5"][class*="w-20"],
.seenu-profile-root span.pointer-events-none.absolute[class*="rotate"],
.seenu-card [class*="h-3"][class*="w-2"],
article [class*="h-3"][class*="w-2"],
.seenu-profile-root [class*="bg-white/1"] {
  display: none !important;
}
.seenu-profile-root div[class*="28px"] ~ div {
  background: ${lighten(s.colors.bg, 0.1)} !important;
  box-shadow: 0 0 10px ${rgba(s.colors.primary, 0.5)};
}
.seenu-profile-root div[class*="28px"] { position: relative; }
.seenu-profile-root div[class*="28px"]::after {
  content: ""; position: absolute; inset: 16px; border-radius: 16px; pointer-events: none;
  background: repeating-linear-gradient(transparent, transparent 2px, ${rgba(s.colors.primary, 0.06)} 3px);
  box-shadow: inset 0 0 30px ${rgba(s.colors.primary, 0.25)};
}
.seenu-profile-root div[class*="28px"] span[class*="text-xs"] {
  color: ${lighten(s.colors.primary, 0.2)} !important;
  font-family: 'Orbitron', sans-serif !important; letter-spacing: 0.2em;
  text-shadow: 0 0 8px ${rgba(s.colors.primary, 0.9)};
}
header.seenu-nav {
  background: ${rgba(s.colors.bg, 0.88)} !important;
  border-bottom: 1px solid ${rgba(s.colors.primary, 0.5)} !important;
  box-shadow: 0 0 18px ${rgba(s.colors.primary, 0.3)};
}
.seenu-profile-root textarea { color: #cfd8ff !important; font-family: 'Rajdhani', sans-serif !important; }
.seenu-profile-root textarea::placeholder { color: #5f739f !important; }
.seenu-profile-root .rounded-tl-sm {
  ${notchClip(10)}
  background:
    repeating-linear-gradient(transparent, transparent 2px, ${rgba(s.colors.primary, 0.05)} 3px),
    linear-gradient(180deg, ${rgba(s.colors.secondary, 0.35)}, ${rgba(s.colors.bg, 0.95)}) !important;
  border: 1px solid ${s.colors.primary} !important;
  box-shadow: 0 0 12px ${rgba(s.colors.primary, 0.55)}, inset 0 0 18px ${rgba(s.colors.primary, 0.1)} !important;
}`;
  if (s.effects.statsTypography) {
    out += `
.seenu-card-body [class*="text-xl"], .seenu-card-body [class*="font-extrabold"] {
  font-family: 'Orbitron', sans-serif !important;
  color: ${lighten(s.colors.primary, 0.2)} !important;
  text-shadow: 0 0 10px ${rgba(s.colors.primary, 0.75)};
  letter-spacing: 0.04em;
}
.seenu-card-body [class*="text-xs"][class*="uppercase"], .seenu-card-body [class*="uppercase"][class*="text-muted"] {
  letter-spacing: 0.25em !important; color: #8a93c9 !important;
}`;
  }
  if (s.effects.postGradient) {
    out += `
article.bg-surface { border: 1px solid ${rgba(s.colors.primary, 0.6)} !important; ${s.effects.hoverPowerup ? `transition: box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease;` : ''} }
${s.effects.hoverPowerup ? `
article.bg-surface:hover {
  border-color: ${s.colors.secondary} !important;
  box-shadow: 0 0 20px ${rgba(s.colors.secondary, 0.7)}, 0 0 48px ${rgba(s.colors.secondary, 0.3)} !important;
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) { article.bg-surface:hover { transform: none; } }` : ''}
article a[class*="font-bold"], article span[class*="font-bold"] {
  background: linear-gradient(90deg, ${s.colors.primary}, ${s.colors.secondary}, ${lighten(s.colors.secondary, 0.4)}, ${s.colors.primary});
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent !important;
  filter: drop-shadow(0 0 6px ${rgba(s.colors.secondary, 0.6)});
  animation: nameFlow 8s linear infinite;
}`;
  }
  return out;
}

/* ---------------- HTML fragment builders (export only) ---------------- */
function statusRowsHtml(s) {
  const rows = [
    ['NAME', s.identity.name],
    ['TITLE', s.identity.title],
    ['CLASS', s.identity.cls],
    ['GUILD', s.identity.guild],
    ['LEVEL', s.identity.level]
  ].filter(([, v]) => String(v || '').trim() !== '');
  return rows.map(([l, v]) => `<div class="swRow"><b>${esc(l)}</b><span>${esc(v)}</span></div>`).join('');
}
function recordRowsHtml(s) {
  return s.record.rows
    .filter(r => r.label.trim() || r.value.trim())
    .map(r => `<div class="swRow"><b>${esc(r.label)}</b><span class="lv">${esc(r.value)}</span></div>`)
    .join('');
}
function questRowsHtml(s) {
  return s.quest.rows
    .filter(r => r.label.trim() || r.value.trim())
    .map(r => `<div class="qwRow"><b>${esc(r.label)}</b><span class="${r.done ? 'done' : ''}">${esc(r.value)}${r.done ? ' \u2714' : ''}</span></div>`)
    .join('');
}

function exportSplashHtml(s) {
  if (!s.splash.enabled) return '';
  let html = `<div class="sysSplash"><small>${esc(s.splash.line1)}</small>${esc(s.splash.line2)}<small>${esc(s.splash.line3)}</small></div>`;
  if (s.splash.once) {
    html += `
<script>
try {
  if (sessionStorage.getItem('smSplashSeen')) {
    var smE = document.querySelector('.sysSplash');
    if (smE) smE.remove();
  } else { sessionStorage.setItem('smSplashSeen', '1'); }
} catch (e) {}
</script>`;
  }
  return html;
}
function exportGateHtml(s) {
  if (!s.rank.enabled) return '';
  return `<div class="gateSigil"><div class="ringOuter"></div><div class="ringInner"></div><div class="rankTag">${esc(s.rank.text)}</div></div>`;
}
function exportStatusHtml(s) {
  if (!s.status.enabled) return '';
  return `<div class="statusWindow"><div class="swTitle">⟡ STATUS</div>${statusRowsHtml(s)}</div>`;
}
function exportRecordHtml(s) {
  if (!s.record.enabled) return '';
  return `<div class="statusWindow monarchRecord"><div class="swTitle">⟡ MONARCH RECORD</div>${recordRowsHtml(s)}</div>`;
}
function exportQuestHtml(s) {
  if (!s.quest.enabled) return '';
  const warn = s.quest.warningEnabled ? `<div class="qwWarn">${esc(s.quest.warning)}</div>` : '';
  return `<div class="questWindow"><div class="qwTitle">⟡ DAILY QUEST</div><div class="qwSub">${esc(s.quest.subtitle)}</div>${questRowsHtml(s)}${warn}</div>`;
}

/* ---------------- Assemble full CSS ---------------- */
function assembleCss(s) {
  return [
    blockFonts(),
    blockBackground(s),
    blockAtmosphere(s),
    blockSplashCss(s),
    blockCards(s),
    blockName(s),
    blockLinksButtons(s),
    blockScrollbarCursor(s),
    blockGate(s),
    blockStatusWindow(s),
    blockRecordWindow(s),
    blockQuestWindow(s),
    blockPlatformFixes(s)
  ].filter(Boolean).join('\n');
}

function assembleExportHtml(s) {
  return [
    exportSplashHtml(s),
    exportGateHtml(s),
    exportStatusHtml(s),
    exportRecordHtml(s),
    exportQuestHtml(s)
  ].filter(Boolean).join('\n');
}

/* ---------------- Minifier ---------------- */
function minify(css, html) {
  let c = css.replace(/\/\*[\s\S]*?\*\//g, '');
  c = c.replace(/\s+/g, ' ').replace(/\s*([{}:;,>+~])\s*/g, '$1').replace(/;}/g, '}').trim();

  // pull scripts out before collapsing whitespace, reinsert verbatim
  const scripts = [];
  let h = html.replace(/<script>[\s\S]*?<\/script>/g, m => {
    scripts.push(m);
    return `\u0000SCRIPT${scripts.length - 1}\u0000`;
  });
  h = h.replace(/>\s+</g, '><').trim();
  scripts.forEach((s, i) => { h = h.replace(`\u0000SCRIPT${i}\u0000`, s); });

  return `<style>${c}</style>\n${h}`;
}

/* ---------------- Row editors (UI) ---------------- */
function renderRowEditor(container, rows, kind, onChange) {
  container.innerHTML = '';
  rows.forEach((row, idx) => {
    const div = document.createElement('div');
    div.className = 'row-item' + (kind === 'quest' ? ' quest-row' : '');

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.value = row.label;
    labelInput.placeholder = 'Label';
    labelInput.addEventListener('input', () => { row.label = labelInput.value; onChange(); });

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.value = row.value;
    valueInput.placeholder = 'Value';
    valueInput.addEventListener('input', () => { row.value = valueInput.value; onChange(); });

    div.appendChild(labelInput);
    div.appendChild(valueInput);

    if (kind === 'quest') {
      const doneWrap = document.createElement('label');
      doneWrap.className = 'done-check';
      const doneCheck = document.createElement('input');
      doneCheck.type = 'checkbox';
      doneCheck.checked = !!row.done;
      doneCheck.addEventListener('change', () => { row.done = doneCheck.checked; onChange(); });
      doneWrap.appendChild(doneCheck);
      doneWrap.appendChild(document.createTextNode('done'));
      div.appendChild(doneWrap);
    } else {
      div.appendChild(document.createElement('span'));
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'row-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', () => {
      rows.splice(idx, 1);
      renderRowEditor(container, rows, kind, onChange);
      onChange();
    });
    div.appendChild(removeBtn);

    container.appendChild(div);
  });
}

/* ---------------- DOM refs ---------------- */
const $ = id => document.getElementById(id);
const els = {
  name: $('f-name'), title: $('f-title'), cls: $('f-class'), guild: $('f-guild'), level: $('f-level'),
  statusEnabled: $('f-status-enabled'),
  gateEnabled: $('f-gate-enabled'), rankText: $('f-rank-text'), gateTop: $('f-gate-top'), gateLeft: $('f-gate-left'),
  splashEnabled: $('f-splash-enabled'), splash1: $('f-splash-1'), splash2: $('f-splash-2'), splash3: $('f-splash-3'), splashOnce: $('f-splash-once'),
  recordEnabled: $('f-record-enabled'), recordRows: $('record-rows'), recordAdd: $('record-add'), recordTop: $('f-record-top'), recordLeft: $('f-record-left'),
  questEnabled: $('f-quest-enabled'), questSubtitle: $('f-quest-subtitle'), questRows: $('quest-rows'), questAdd: $('quest-add'),
  questWarnEnabled: $('f-quest-warning-enabled'), questWarn: $('f-quest-warning'),
  colorPrimary: $('f-color-primary'), colorPrimaryHex: $('f-color-primary-hex'),
  colorSecondary: $('f-color-secondary'), colorSecondaryHex: $('f-color-secondary-hex'),
  colorAccent: $('f-color-accent'), colorAccentHex: $('f-color-accent-hex'),
  colorBg: $('f-color-bg'), colorBgHex: $('f-color-bg-hex'),
  bgImage: $('f-bg-image'),
  fxScanlines: $('f-fx-scanlines'), fxGrain: $('f-fx-grain'), fxGlitch: $('f-fx-glitch'), fxShimmer: $('f-fx-shimmer'),
  fxHover: $('f-fx-hover'), fxNotch: $('f-fx-notch'), fxScrollbar: $('f-fx-scrollbar'), fxCursor: $('f-fx-cursor'),
  fxPostgrad: $('f-fx-postgrad'), fxStats: $('f-fx-stats'), fxPlatform: $('f-fx-platform'),
  output: $('output'), charCount: $('charCount'),
  copyBtn: $('copyBtn'), downloadBtn: $('downloadBtn'), resetBtn: $('resetBtn'), clearSaveBtn: $('clearSaveBtn'),
  replaySplash: $('replaySplash'),
  previewRoot: $('previewRoot'),
  mockGate: $('mockGate'), mockRank: $('mockRank'),
  mockName: $('mockName'),
  mockRecord: $('mockRecord'), mockRecordRows: $('mockRecordRows'),
  mockStatusCard: $('mockStatusCard'), mockStatusRows: $('mockStatusRows'),
  mockQuestCardWrap: $('mockQuestCardWrap'), mockQuestSub: $('mockQuestSub'), mockQuestRows: $('mockQuestRows'), mockQuestWarn: $('mockQuestWarn'),
};

let liveStyleTag = document.getElementById('live-style');
if (!liveStyleTag) {
  liveStyleTag = document.createElement('style');
  liveStyleTag.id = 'live-style';
  document.head.appendChild(liveStyleTag);
}

/* ---------------- Form <-> state sync ---------------- */
function syncFormFromState() {
  els.name.value = state.identity.name;
  els.title.value = state.identity.title;
  els.cls.value = state.identity.cls;
  els.guild.value = state.identity.guild;
  els.level.value = state.identity.level;
  els.statusEnabled.checked = state.status.enabled;

  els.gateEnabled.checked = state.rank.enabled;
  els.rankText.value = state.rank.text;
  els.gateTop.value = state.rank.top;
  els.gateLeft.value = state.rank.left;

  els.splashEnabled.checked = state.splash.enabled;
  els.splash1.value = state.splash.line1;
  els.splash2.value = state.splash.line2;
  els.splash3.value = state.splash.line3;
  els.splashOnce.checked = state.splash.once;

  els.recordEnabled.checked = state.record.enabled;
  els.recordTop.value = state.record.top;
  els.recordLeft.value = state.record.left;

  els.questEnabled.checked = state.quest.enabled;
  els.questSubtitle.value = state.quest.subtitle;
  els.questWarnEnabled.checked = state.quest.warningEnabled;
  els.questWarn.value = state.quest.warning;

  els.colorPrimary.value = state.colors.primary; els.colorPrimaryHex.value = state.colors.primary;
  els.colorSecondary.value = state.colors.secondary; els.colorSecondaryHex.value = state.colors.secondary;
  els.colorAccent.value = state.colors.accent; els.colorAccentHex.value = state.colors.accent;
  els.colorBg.value = state.colors.bg; els.colorBgHex.value = state.colors.bg;
  els.bgImage.value = state.bgImage;

  els.fxScanlines.checked = state.effects.scanlines;
  els.fxGrain.checked = state.effects.grain;
  els.fxGlitch.checked = state.effects.glitch;
  els.fxShimmer.checked = state.effects.shimmer;
  els.fxHover.checked = state.effects.hoverPowerup;
  els.fxNotch.checked = state.effects.notch;
  els.fxScrollbar.checked = state.effects.scrollbar;
  els.fxCursor.checked = state.effects.cursor;
  els.fxPostgrad.checked = state.effects.postGradient;
  els.fxStats.checked = state.effects.statsTypography;
  els.fxPlatform.checked = state.effects.platformFixes;

  renderRowEditor(els.recordRows, state.record.rows, 'record', onAnyChange);
  renderRowEditor(els.questRows, state.quest.rows, 'quest', onAnyChange);
}

function readFormIntoState() {
  state.identity.name = els.name.value || 'YOUR NAME';
  state.identity.title = els.title.value;
  state.identity.cls = els.cls.value;
  state.identity.guild = els.guild.value;
  state.identity.level = els.level.value;
  state.status.enabled = els.statusEnabled.checked;

  state.rank.enabled = els.gateEnabled.checked;
  state.rank.text = els.rankText.value || 'S-RANK';
  state.rank.top = parseInt(els.gateTop.value, 10) || 0;
  state.rank.left = parseInt(els.gateLeft.value, 10) || 0;

  state.splash.enabled = els.splashEnabled.checked;
  state.splash.line1 = els.splash1.value;
  state.splash.line2 = els.splash2.value;
  state.splash.line3 = els.splash3.value;
  state.splash.once = els.splashOnce.checked;

  state.record.enabled = els.recordEnabled.checked;
  state.record.top = parseInt(els.recordTop.value, 10) || 0;
  state.record.left = parseInt(els.recordLeft.value, 10) || 0;

  state.quest.enabled = els.questEnabled.checked;
  state.quest.subtitle = els.questSubtitle.value;
  state.quest.warningEnabled = els.questWarnEnabled.checked;
  state.quest.warning = els.questWarn.value;

  state.effects.scanlines = els.fxScanlines.checked;
  state.effects.grain = els.fxGrain.checked;
  state.effects.glitch = els.fxGlitch.checked;
  state.effects.shimmer = els.fxShimmer.checked;
  state.effects.hoverPowerup = els.fxHover.checked;
  state.effects.notch = els.fxNotch.checked;
  state.effects.scrollbar = els.fxScrollbar.checked;
  state.effects.cursor = els.fxCursor.checked;
  state.effects.postGradient = els.fxPostgrad.checked;
  state.effects.statsTypography = els.fxStats.checked;
  state.effects.platformFixes = els.fxPlatform.checked;

  state.bgImage = els.bgImage.value;
}

/* ---------------- Preview + output render ---------------- */
function renderPreview() {
  els.mockGate.style.display = state.rank.enabled ? '' : 'none';
  els.mockRank.textContent = state.rank.text || 'S-RANK';

  els.mockName.textContent = state.identity.name || 'YOUR NAME';

  els.mockRecord.style.display = state.record.enabled ? '' : 'none';
  els.mockRecordRows.innerHTML = recordRowsHtml(state) || '<div class="swRow"><span style="color:#5f739f">Add a row to see it here</span></div>';

  els.mockStatusCard.style.display = state.status.enabled ? '' : 'none';
  els.mockStatusRows.innerHTML = statusRowsHtml(state);

  els.mockQuestCardWrap.style.display = state.quest.enabled ? '' : 'none';
  els.mockQuestSub.textContent = state.quest.subtitle;
  els.mockQuestRows.innerHTML = questRowsHtml(state);
  els.mockQuestWarn.style.display = state.quest.warningEnabled ? '' : 'none';
  els.mockQuestWarn.textContent = state.quest.warning;

  // splash: managed as a real element so "replay" can restart its animation
  let splashEl = els.previewRoot.querySelector('.sysSplash');
  if (state.splash.enabled) {
    if (!splashEl) {
      splashEl = document.createElement('div');
      splashEl.className = 'sysSplash';
      els.previewRoot.prepend(splashEl);
    }
    splashEl.innerHTML = `<small>${esc(state.splash.line1)}</small>${esc(state.splash.line2)}<small>${esc(state.splash.line3)}</small>`;
  } else if (splashEl) {
    splashEl.remove();
  }
}

function renderOutput() {
  const css = assembleCss(state);
  const html = assembleExportHtml(state);

  // drive the live preview with the exact same CSS that gets exported
  liveStyleTag.textContent = css;

  const full = minify(css, html);
  els.output.value = full;

  const len = full.length;
  els.charCount.textContent = `${len.toLocaleString()} / ${CHAR_LIMIT.toLocaleString()}`;
  els.charCount.classList.remove('warn', 'over');
  if (len >= CHAR_LIMIT) els.charCount.classList.add('over');
  else if (len >= CHAR_LIMIT * 0.75) els.charCount.classList.add('warn');
}

function onAnyChange() {
  readFormIntoState();
  renderPreview();
  renderOutput();
  saveState();
}

/* ---------------- Hex <-> color picker sync ---------------- */
function wireColorPair(colorInput, hexInput, key) {
  colorInput.addEventListener('input', () => {
    hexInput.value = colorInput.value;
    state.colors[key] = colorInput.value;
    onAnyChange();
  });
  hexInput.addEventListener('input', () => {
    if (isValidHex(hexInput.value)) {
      colorInput.value = hexInput.value;
      state.colors[key] = hexInput.value;
      onAnyChange();
    }
  });
}

/* ---------------- Wire up events ---------------- */
function wireEvents() {
  [els.name, els.title, els.cls, els.guild, els.level,
   els.rankText, els.gateTop, els.gateLeft,
   els.splash1, els.splash2, els.splash3,
   els.recordTop, els.recordLeft,
   els.questSubtitle, els.questWarn,
   els.bgImage
  ].forEach(el => el.addEventListener('input', onAnyChange));

  [els.statusEnabled, els.gateEnabled, els.splashEnabled, els.splashOnce,
   els.recordEnabled, els.questEnabled, els.questWarnEnabled,
   els.fxScanlines, els.fxGrain, els.fxGlitch, els.fxShimmer, els.fxHover,
   els.fxNotch, els.fxScrollbar, els.fxCursor, els.fxPostgrad, els.fxStats, els.fxPlatform
  ].forEach(el => el.addEventListener('change', onAnyChange));

  wireColorPair(els.colorPrimary, els.colorPrimaryHex, 'primary');
  wireColorPair(els.colorSecondary, els.colorSecondaryHex, 'secondary');
  wireColorPair(els.colorAccent, els.colorAccentHex, 'accent');
  wireColorPair(els.colorBg, els.colorBgHex, 'bg');

  els.recordAdd.addEventListener('click', () => {
    state.record.rows.push({ id: uid(), label: 'NEW STAT', value: '000000' });
    renderRowEditor(els.recordRows, state.record.rows, 'record', onAnyChange);
    onAnyChange();
  });
  els.questAdd.addEventListener('click', () => {
    state.quest.rows.push({ id: uid(), label: 'NEW QUEST', value: '0/0', done: false });
    renderRowEditor(els.questRows, state.quest.rows, 'quest', onAnyChange);
    onAnyChange();
  });

  els.copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(els.output.value);
      const orig = els.copyBtn.textContent;
      els.copyBtn.textContent = 'Copied!';
      setTimeout(() => { els.copyBtn.textContent = orig; }, 1400);
    } catch (e) {
      els.output.select();
      document.execCommand('copy');
    }
  });

  els.downloadBtn.addEventListener('click', () => {
    const blob = new Blob([els.output.value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shadow-monarch-theme.html';
    a.click();
    URL.revokeObjectURL(url);
  });

  els.resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all fields to defaults? This clears your current setup.')) return;
    state = defaultState();
    syncFormFromState();
    onAnyChange();
  });

  els.clearSaveBtn.addEventListener('click', () => {
    if (!confirm('Clear autosaved data from this browser? Your current form stays as-is until you reload.')) return;
    localStorage.removeItem(STORAGE_KEY);
  });

  els.replaySplash.addEventListener('click', () => {
    const el = els.previewRoot.querySelector('.sysSplash');
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

/* ---------------- Init ---------------- */
syncFormFromState();
wireEvents();
onAnyChange();
