import { svg } from './frame.mjs'
import { esc, fit, num, shade, days, clamp, rrect, width } from '../lib/kit.mjs'

const W = 1000, H = 300

const tspan = (s, fill, extra = '') => `<tspan fill="${fill}"${extra}>${esc(s)}</tspan>`

// ─── DA 1 · CHUNK ────────────────────────────────────────────────────────────
// La grille de droite n'est pas un ornement : un bloc = un dépôt, sa couleur
// est celle du langage, son opacité dit à quel point il est récent. Les blocs
// se chargent en cascade comme un monde qui génère ses chunks.
function chunk(t, d) {
  const { c } = t
  const S = 42, G = 8, COLS = 8
  const gx = 958 - (COLS * (S + G) - G)
  const gy = 64
  const repos = d.fresh.slice(0, 32)
  const rows = Math.ceil(repos.length / COLS)
  const slots = rows * COLS

  const blocks = repos.map((r, i) => {
    const col = i % COLS, row = (i / COLS) | 0
    const x = gx + col * (S + G), y = gy + row * (S + G)
    const fresh = 1 - clamp(days(r.pushedAt) / 400, 0, 1)
    const o = (0.34 + 0.66 * fresh).toFixed(2)
    const col0 = r.langColor || c.faint
    return `<g>` +
      `<rect x="${x}" y="${y}" width="${S}" height="${S}" rx="2" fill="${col0}" opacity="${o}"/>` +
      `<rect x="${x}" y="${y}" width="${S}" height="5" rx="2" fill="${shade(col0, 0.42)}" opacity="${o}"/>` +
      `<rect x="${x}" y="${y + S - 4}" width="${S}" height="4" fill="${shade(col0, -0.45)}" opacity="${o}"/>` +
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="${S - 1}" height="${S - 1}" rx="2" fill="none" stroke="${c.bg}" stroke-width="1" opacity=".55"/>` +
      `</g>`
  }).join('')

  const empty = Array.from({ length: slots - repos.length }, (_, k) => {
    const i = repos.length + k, col = i % COLS, row = (i / COLS) | 0
    return `<rect x="${gx + col * (S + G) + 0.5}" y="${gy + row * (S + G) + 0.5}" width="${S - 1}" height="${S - 1}" rx="2" fill="none" stroke="${c.line}" stroke-dasharray="3 3"/>`
  }).join('')
  const gw = COLS * (S + G) - G, gh = rows * (S + G) - G

  // Les quatre langages dominants, en pastilles carrées — pas des pastilles
  // rondes : ici tout est cubique.
  let lx = 42
  const langs = d.languages.slice(0, 4).map((l) => {
    const s = `<rect x="${lx}" y="164" width="9" height="9" rx="1.5" fill="${l.color || c.dim}"/>` +
      `<text x="${lx + 15}" y="173" font-family="${t.body}" font-size="11.5" fill="${c.text}">${esc(l.name)}</text>` +
      `<text x="${lx + 19 + width(l.name, 'mono', 11.5)}" y="173" font-family="${t.body}" font-size="11.5" fill="${c.faint}">${l.pct.toFixed(0)}%</text>`
    lx += 15 + width(l.name, 'mono', 11.5) + 4 + width(l.pct.toFixed(0) + '%', 'mono', 11.5) + 20
    return s
  }).join('')

  const line = (y, parts) =>
    `<text x="42" y="${y}" font-family="${t.data}" font-size="12">${parts}</text>`
  const kv = (k, v, vc = c.text) => tspan(k + ': ', c.dim) + tspan(v, vc)
  const sep = tspan('  ·  ', c.faint)

  return svg({
    t, w: W, h: H,
    css: `
.cur{animation:blink 1.1s steps(1) infinite}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.scan{animation:scan 4.6s cubic-bezier(.5,0,.5,1) 2.6s infinite}
@keyframes scan{from{transform:translateX(-140px)}to{transform:translateX(${gw + 140}px)}}
.dot{animation:pulse 2.2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}`,
    body: `
<text x="42" y="48" font-family="${t.data}" font-size="11" fill="${c.dim}">${tspan('▸ ', c.accent)}github.com/${esc(d.user.login)}${tspan('  ·  ', c.faint)}profile @ main</text>

<text x="42" y="126" font-family="${t.display}" font-weight="${t.displayWeight}" font-size="54" letter-spacing="${t.tracking}" fill="${c.text}">${esc(d.user.login.toUpperCase())}</text>
<rect class="cur" x="${42 + width(d.user.login, 'monoBold', 54) + d.user.login.length * t.tracking + 6}" y="84" width="20" height="46" fill="${c.accent}"/>

<path d="M42 146H330" stroke="${c.line}" stroke-width="1"/>
${langs}

${line(206, kv('Dépôts', String(d.totals.repos)) + sep + kv('Étoiles', String(d.totals.stars), c.accent4) + sep + kv('Forks', String(d.totals.forks)))}
${line(228, kv('Commits', num(d.totals.commits) + ' / an', c.accent2) + sep + kv('Série', d.streak.current + ' j') + sep + kv('Record', d.streak.longest + ' j'))}
${line(250, kv('Biome', d.focus[0].label, c.accent) + sep + kv('Seed', String(d.seed)))}

<circle class="dot" cx="46" cy="274" r="3.5" fill="${c.accent2}"/>
<text x="58" y="278" font-family="${t.data}" font-size="10" fill="${c.dim}">Régénéré ${esc(d.stampFr)} · toutes les 6 h</text>

<text x="958" y="48" text-anchor="end" font-family="${t.data}" font-size="10.5" fill="${c.dim}">chunks chargés ${tspan(repos.length + '/' + d.totals.repos, c.accent)}</text>
<g>
  ${blocks}${empty}
  <g clip-path="url(#gc)">
    <rect class="scan" x="${gx - 140}" y="${gy}" width="140" height="${gh}" fill="url(#sw)" opacity=".55"/>
  </g>
</g>
<defs><clipPath id="gc"><rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="2"/></clipPath>
<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${c.accent}" stop-opacity="0"/>
  <stop offset=".7" stop-color="${c.accent}" stop-opacity=".28"/>
  <stop offset="1" stop-color="${c.accent}" stop-opacity="0"/>
</linearGradient></defs>
<text x="958" y="${gy + gh + 26}" text-anchor="end" font-family="${t.data}" font-size="10" fill="${c.faint}">1 bloc = 1 dépôt · teinte = langage · opacité = fraîcheur</text>`,
  })
}
export { chunk }

// ─── DA 2 · REPLAY ───────────────────────────────────────────────────────────
// Flashback est son projet phare : le README devient une station de montage.
// Chaque dépôt est un clip dont la longueur est sa période d'activité réelle,
// chaque release un keyframe. La tête de lecture rejoue sa carrière en boucle.
function replay(t, d) {
  const { c } = t
  const LX = 142, LW = 816, DUR = 11
  const t0 = Math.min(...d.repos.map((r) => +new Date(r.createdAt)))
  const t1 = Date.now()
  const at = (d0) => LX + ((+new Date(d0) - t0) / (t1 - t0)) * LW
  const frac = (d0) => (+new Date(d0) - t0) / (t1 - t0)

  // Règle temporelle : une graduation par trimestre, un libellé par année.
  const y0 = new Date(t0).getFullYear(), y1 = new Date(t1).getFullYear()
  let ruler = ''
  for (let y = y0; y <= y1; y++) {
    for (let q = 0; q < 4; q++) {
      const date = +Date.UTC(y, q * 3, 1)
      if (date < t0 || date > t1) continue
      const x = at(date)
      ruler += `<path d="M${x.toFixed(1)} ${q === 0 ? 12 : 20}V32" stroke="${q === 0 ? c.dim : c.faint}" stroke-width="1"/>`
    }
    const lx = Math.max(LX, at(+Date.UTC(y, 0, 1)))
    if (lx < LX + LW - 34) {
      ruler += `<text x="${(lx + 6).toFixed(1)}" y="20" font-family="${t.data}" font-size="9.5" fill="${c.dim}" letter-spacing="1.5">${y}</text>`
    }
  }

  const diamonds = d.releases.slice(0, 28).map((r) => {
    const x = at(r.at)
    return `<path d="M${x.toFixed(1)} 26l4 4-4 4-4-4z" fill="${c.accent3}" opacity=".85"/>`
  }).join('')

  const laneY = [162, 196, 230]
  const SUB = 3, SH = 7, SG = 1
  const lanes = d.lanes.slice(0, 3).map((lane, i) => {
    const y = laneY[i]
    const ends = new Array(SUB).fill(-Infinity)
    const clips = [...lane.repos]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((r) => {
        const x = at(r.createdAt)
        const w = Math.max(6, at(r.pushedAt) - x)
        let k = ends.findIndex((e) => e <= x)
        if (k === -1) k = SUB - 1
        ends[k] = x + w + 3
        return `<rect class="clip" x="${x.toFixed(1)}" y="${y + k * (SH + SG)}" width="${w.toFixed(1)}" height="${SH}" rx="2"` +
          ` fill="${r.langColor || c.dim}" style="animation-delay:${(DUR * frac(r.pushedAt) - DUR).toFixed(2)}s"/>`
      }).join('')
    return `<rect x="${LX}" y="${y}" width="${LW}" height="24" rx="2.5" fill="${c.panelAlt}"/>` +
      `<text x="42" y="${y + 11}" font-family="${t.data}" font-weight="700" font-size="10.5" fill="${lane.color}" letter-spacing="1">${esc(lane.slot)}</text>` +
      `<text x="42" y="${y + 22}" font-family="${t.data}" font-size="9" fill="${c.dim}" letter-spacing=".5">${esc(lane.short)}</text>` +
      `<text x="${LX - 12}" y="${y + 17}" text-anchor="end" font-family="${t.data}" font-size="9.5" fill="${c.faint}">${lane.repos.length}</text>` +
      clips
  }).join('')

  // Piste audio : les commits de l'année, en forme d'onde symétrique.
  const wk = d.calendar.weeks
  const step = LW / wk.length
  const wave = wk.map((week, i) => {
    const v = week.reduce((a, x) => a + x.contributionCount, 0)
    const h = Math.max(1.5, (v / Math.max(1, d.weekMax)) * 26)
    const x = LX + i * step
    return `<rect x="${x.toFixed(1)}" y="${(278 - h).toFixed(1)}" width="${(step - 3.5).toFixed(1)}" height="${(h * 2).toFixed(1)}" rx="1.2" fill="${c.accent4}" opacity=".62"/>`
  }).join('')

  return svg({
    t, w: W, h: H,
    css: `
.ph{animation:play ${DUR}s linear infinite}
@keyframes play{from{transform:translateX(0)}to{transform:translateX(${LW}px)}}
.clip{opacity:.6;animation:flash ${DUR}s linear infinite}
@keyframes flash{0%{opacity:1}7%{opacity:.6}100%{opacity:.6}}
.rec{animation:rec 1.4s ease-in-out infinite}
@keyframes rec{0%,100%{opacity:1}50%{opacity:.15}}`,
    body: `
<path d="M1 34h998" stroke="${c.line}"/>
<rect x="1" y="1" width="998" height="33" fill="${c.panel}"/>
${ruler}${diamonds}
<circle class="rec" cx="880" cy="18" r="4" fill="${c.accent3}"/>
<text x="892" y="22" font-family="${t.data}" font-weight="700" font-size="10" fill="${c.text}" letter-spacing="2">REC</text>
<text x="958" y="22" text-anchor="end" font-family="${t.data}" font-size="10" fill="${c.dim}">${y1 - y0 + 1} ANS</text>

<text x="42" y="100" font-family="${t.display}" font-size="56" letter-spacing="${t.tracking}" fill="${c.text}">${esc(d.user.login.toUpperCase())}</text>
<text x="42" y="126" font-family="${t.body}" font-size="12.5" fill="${c.dim}">${esc(fit(d.tagline, 'plex', 12.5, 630))}</text>

<text x="958" y="88" text-anchor="end" font-family="${t.data}" font-weight="700" font-size="26" fill="${c.accent}">${d.totals.repos}<tspan font-size="11" fill="${c.dim}" letter-spacing="1.5">  DÉPÔTS</tspan></text>
<text x="958" y="112" text-anchor="end" font-family="${t.data}" font-weight="700" font-size="26" fill="${c.accent2}">${num(d.totals.commits)}<tspan font-size="11" fill="${c.dim}" letter-spacing="1.5">  COMMITS / AN</tspan></text>
<text x="958" y="134" text-anchor="end" font-family="${t.data}" font-size="10" fill="${c.faint}">★ ${d.totals.stars} · ${d.totals.releases} releases · maj ${esc(d.stampFr)}</text>

${lanes}
<text x="42" y="272" font-family="${t.data}" font-weight="700" font-size="10.5" fill="${c.accent4}" letter-spacing="1">A2</text>
<text x="42" y="283" font-family="${t.data}" font-size="9" fill="${c.dim}">commits/sem.</text>
<path d="M${LX} 278h${LW}" stroke="${c.faint}" stroke-width=".75"/>
${wave}

<g class="ph"><path d="M${LX} 36V292" stroke="${c.accent}" stroke-width="1.5"/>
<path d="M${LX - 6} 36h12l-6 8z" fill="${c.accent}"/></g>`,
  })
}
export { replay }

// ─── DA 3 · DEEPSLATE ────────────────────────────────────────────────────────
// La table d'enchantement : l'artisan qui fabrique des outils. Le glint —
// ce balayage iridescent qui court sur les objets enchantés — traverse le nom
// en boucle, les orbes d'XP montent. Seul point de bravoure de la carte.
function deepslate(t, d) {
  const { c } = t
  const NAME = d.user.login.toUpperCase()

  // Orbes déterministes : même build, même pluie de particules.
  let s = 1337
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
  const orbs = Array.from({ length: 26 }, (_, i) => {
    const x = 30 + rnd() * 940
    const r = 1.2 + rnd() * 2.2
    const dur = (4.5 + rnd() * 4).toFixed(1)
    const delay = (-rnd() * 8).toFixed(1)
    return `<circle class="orb" cx="${x.toFixed(0)}" cy="310" r="${r.toFixed(1)}" fill="${c.accent2}" style="animation-duration:${dur}s;animation-delay:${delay}s"/>`
  }).join('')

  const pills = [
    ['commits', num(d.totals.commits), c.accent2],
    ['série', d.streak.current + ' j', c.accent4],
    ['langages', String(d.languages.length), c.accent],
    ['releases', String(d.totals.releases), c.accent3],
  ]
  const PH = 32, PAD = 15, GAP = 11
  const pw = pills.map(([k, v]) => PAD * 2 + width(k, 'mono', 10) + 9 + width(v, 'mono', 12.5))
  let px = 500 - (pw.reduce((a, b) => a + b, 0) + GAP * (pills.length - 1)) / 2
  const pillRow = pills.map(([k, v, col], i) => {
    const x = px, w = pw[i]
    px += w + GAP
    return `<path d="${rrect(x, 232, w, PH, 16)}" fill="${c.panelAlt}" stroke="${c.line}"/>` +
      `<text x="${x + PAD}" y="${232 + 21}" font-family="${t.data}" font-size="10" fill="${c.dim}" letter-spacing=".6">${esc(k)}</text>` +
      `<text x="${x + PAD + width(k, 'mono', 10) + 9}" y="${232 + 21}" font-family="${t.data}" font-size="12.5" font-weight="400" fill="${col}">${esc(v)}</text>`
  }).join('')

  const bracket = (x, y, sx, sy) =>
    `<path d="M${x} ${y + sy * 26}V${y}h${sx * 26}" stroke="${c.accent}" stroke-width="1.5" opacity=".45" fill="none"/>`

  const title = (extra) =>
    `<text x="${500 + 2}" y="164" text-anchor="middle" font-family="${t.display}" font-weight="${t.displayWeight}" font-size="78" letter-spacing="${t.tracking}" ${extra}>${esc(NAME)}</text>`

  return svg({
    t, w: W, h: H,
    css: `
.orb{animation-name:rise;animation-timing-function:ease-in;animation-iteration-count:infinite;opacity:0}
@keyframes rise{0%{transform:translateY(0);opacity:0}12%{opacity:.9}80%{opacity:.55}100%{transform:translateY(-300px);opacity:0}}
.glint{animation:sweep 3.6s cubic-bezier(.6,0,.35,1) infinite}
@keyframes sweep{0%,18%{transform:translateX(-420px)}82%,100%{transform:translateX(1180px)}}
.halo{animation:breathe 5s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.72}50%{opacity:1}}`,
    body: `
<defs>
  <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${c.glint}" stop-opacity="0"/>
    <stop offset=".42" stop-color="${c.accent3}" stop-opacity=".85"/>
    <stop offset=".52" stop-color="${c.glint}" stop-opacity="1"/>
    <stop offset=".62" stop-color="${c.accent}" stop-opacity=".85"/>
    <stop offset="1" stop-color="${c.glint}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="rl" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${c.accent}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${c.accent}" stop-opacity=".9"/>
    <stop offset="1" stop-color="${c.accent}" stop-opacity="0"/>
  </linearGradient>
  <mask id="tm"><rect width="1000" height="300" fill="#000"/>${title(`fill="#fff"`)}</mask>
</defs>

<g opacity=".9">${orbs}</g>

${bracket(30, 30, 1, 1)}${bracket(970, 30, -1, 1)}${bracket(30, 270, 1, -1)}${bracket(970, 270, -1, -1)}

<text x="500" y="78" text-anchor="middle" font-family="${t.data}" font-size="10.5" fill="${c.accent}" letter-spacing="3.6" class="halo">⟨ ${d.totals.repos} PROJETS · ${d.totals.stars} ÉTOILES · DEPUIS ${esc(d.user.since)} ⟩</text>

${title(`fill="${c.text}"`)}
<g mask="url(#tm)"><rect class="glint" x="-420" y="80" width="300" height="120" fill="url(#gl)" transform="skewX(-18)"/></g>

<rect x="290" y="182" width="420" height="1.5" fill="url(#rl)"/>
<text x="500" y="210" text-anchor="middle" font-family="${t.body}" font-weight="500" font-size="14.5" fill="${c.dim}">${esc(fit(d.tagline, 'groteskMed', 14.5, 780))}</text>

${pillRow}
<text x="500" y="288" text-anchor="middle" font-family="${t.data}" font-size="9.5" fill="${c.faint}">régénéré ${esc(d.stampFr)} · toutes les 6 h</text>`,
  })
}

export const HEADERS = { CHUNK: chunk, REPLAY: replay, DEEPSLATE: deepslate }
export const renderHeader = (t, d) => HEADERS[t.label](t, d)
