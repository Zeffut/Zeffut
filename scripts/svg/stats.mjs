import { svg } from './frame.mjs'
import { esc, num, rrect, width, fit } from '../lib/kit.mjs'

const W = 1000, H = 240

// Quatre compteurs, chacun avec une jauge qui dit sa part du total : le chiffre
// seul ne situe rien. Puis la répartition réelle des langages, en octets écrits.
export function renderStats(t, d) {
  const { c } = t
  const bigFace = t.label === 'CHUNK' ? t.data : t.display
  const bigWeight = t.label === 'CHUNK' ? 800 : t.displayWeight

  const metrics = [
    ['commits', d.totals.commits, c.accent2],
    ['pull requests', d.totals.prs, c.accent],
    ['issues', d.totals.issues, c.accent4],
    ['revues', d.totals.reviews, c.accent3],
  ]
  const COLW = 229
  const counters = metrics.map(([label, v, col], i) => {
    const x = 42 + i * COLW
    return `<text x="${x}" y="114" font-family="${bigFace}" font-weight="${bigWeight}" font-size="42" fill="${col}" class="rise" style="animation-delay:${(0.1 + i * 0.09).toFixed(2)}s">${esc(num(v))}</text>` +
      `<text x="${x + 1}" y="136" font-family="${t.data}" font-size="10.5" fill="${c.dim}" letter-spacing="1.6">${esc(label.toUpperCase())}</text>` +
      `<rect class="grow" x="${x}" y="148" width="${COLW - 30}" height="2" rx="1" fill="${col}" opacity=".38" style="animation-delay:${(0.3 + i * 0.09).toFixed(2)}s"/>`
  }).join('')

  // Barre empilée : on garde les 8 premiers langages, le reste devient « autres ».
  const BW = 916, top = d.languages.slice(0, 8)
  const rest = 100 - top.reduce((a, l) => a + l.pct, 0)
  const segs = [...top, ...(rest > 0.5 ? [{ name: 'autres', color: c.faint, pct: rest }] : [])]
  let sx = 42
  const bar = segs.map((l, i) => {
    const w = (l.pct / 100) * BW
    const s = `<rect x="${sx.toFixed(1)}" y="190" width="${Math.max(1.5, w - 1.5).toFixed(1)}" height="15" rx="2" fill="${l.color || c.dim}" class="grow" style="animation-delay:${(0.5 + i * 0.055).toFixed(2)}s"/>`
    sx += w
    return s
  }).join('')

  let lx = 42
  const legend = segs.slice(0, 6).map((l) => {
    const label = `${l.name} ${l.pct.toFixed(1)}%`
    const s = `<rect x="${lx.toFixed(1)}" y="220" width="8" height="8" rx="${t.label === 'CHUNK' ? 1 : 4}" fill="${l.color || c.dim}"/>` +
      `<text x="${(lx + 13).toFixed(1)}" y="228" font-family="${t.data}" font-size="10.5" fill="${c.dim}">${esc(label)}</text>`
    lx += 13 + width(label, 'mono', 10.5) + 20
    return s
  }).join('')

  return svg({
    t, w: W, h: H,
    css: `
.rise{animation:rise .6s cubic-bezier(.2,.9,.3,1)}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.grow{transform-box:fill-box;transform-origin:0 50%;animation:grow .7s cubic-bezier(.2,.9,.3,1)}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.shine{animation:slide 6s cubic-bezier(.45,0,.55,1) 2.4s infinite}
@keyframes slide{0%{transform:translateX(0)}55%,100%{transform:translateX(1180px)}}`,
    body: `
<text x="42" y="52" font-family="${t.data}" font-size="10.5" fill="${c.dim}" letter-spacing="3">ACTIVITÉ · 12 DERNIERS MOIS</text>
<text x="958" y="52" text-anchor="end" font-family="${t.data}" font-size="10.5" fill="${c.faint}">${d.totals.contributions} contributions · série ${tspanSafe(d.streak.current, c.accent2)} j · record ${d.streak.longest} j</text>
<path d="M42 66h916" stroke="${c.line}"/>
${counters}
<text x="42" y="180" font-family="${t.data}" font-size="10.5" fill="${c.dim}" letter-spacing="3">RÉPARTITION DES LANGAGES</text>
<text x="958" y="180" text-anchor="end" font-family="${t.data}" font-size="10.5" fill="${c.faint}">${d.languages.length} langages · ${esc(fit(d.languages[0]?.name ?? '', 'mono', 10.5, 160))} en tête</text>
${bar}
<defs>
  <clipPath id="bc"><rect x="42" y="190" width="916" height="15" rx="2"/></clipPath>
  <linearGradient id="sh" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".5" stop-color="#fff" stop-opacity=".5"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
</defs>
<g clip-path="url(#bc)"><rect class="shine" x="-220" y="190" width="220" height="15" fill="url(#sh)"/></g>
${legend}`,
  })
}
const tspanSafe = (v, col) => `<tspan fill="${col}">${esc(v)}</tspan>`
