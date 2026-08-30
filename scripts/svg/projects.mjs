import { svg } from './frame.mjs'
import { esc, fit, ago, rrect, width } from '../lib/kit.mjs'

const W = 1000, H = 320

// Six cartes, deux colonnes. La barre de gauche prend la couleur du langage et
// pousse vers le bas à l'apparition : la carte se « monte » sous les yeux.
export function renderProjects(t, d) {
  const { c } = t
  const CW = 446, CH = 70, GX = 24, GY = 14
  const picks = d.top.slice(0, 6)

  const cards = picks.map((r, i) => {
    const col = i % 2, row = (i / 2) | 0
    const x = 42 + col * (CW + GX), y = 64 + row * (CH + GY)
    const lc = r.langColor || c.dim
    const meta = `${r.lang ?? '—'} · maj ${ago(r.pushedAt)}`
    const badge = `★ ${r.stars}${r.forks ? `   ⑂ ${r.forks}` : ''}`
    return `<g>
  <path d="${rrect(x, y, CW, CH, Math.max(3, t.radius - 2))}" fill="${c.panel}" stroke="${c.line}"/>
  <rect${i === 0 ? ' class="lead"' : ''} x="${x}" y="${y + 8}" width="3" height="${CH - 16}" rx="1.5" fill="${lc}"/>
  <text x="${x + 18}" y="${y + 25}" font-family="${t.data}" font-weight="700" font-size="13.5" fill="${c.text}">${esc(fit(r.name, 'plexBold', 13.5, CW - 130))}</text>
  <text x="${x + CW - 16}" y="${y + 25}" text-anchor="end" font-family="${t.data}" font-size="11" fill="${c.accent4}">${esc(badge)}</text>
  <text x="${x + 18}" y="${y + 44}" font-family="${t.data}" font-size="10.5" fill="${c.dim}">${esc(fit(r.desc || 'Sans description', 'mono', 10.5, CW - 34))}</text>
  <rect x="${x + 18}" y="${y + 53}" width="7" height="7" rx="${t.label === 'CHUNK' ? 1 : 3.5}" fill="${lc}"/>
  <text x="${x + 31}" y="${y + 60}" font-family="${t.data}" font-size="10" fill="${c.faint}">${esc(fit(meta, 'mono', 10, CW - 60))}</text>
</g>`
  }).join('')

  return svg({
    t, w: W, h: H,
    css: `
.lead{animation:beat 2.8s ease-in-out infinite}
@keyframes beat{0%,100%{opacity:1}50%{opacity:.45}}`,
    body: `
<text x="42" y="52" font-family="${t.data}" font-size="10.5" fill="${c.dim}" letter-spacing="3">PROJETS · LES PLUS ÉTOILÉS</text>
<text x="958" y="52" text-anchor="end" font-family="${t.data}" font-size="10.5" fill="${c.faint}">${d.totals.repos} dépôts publics · ${d.totals.stars} étoiles cumulées</text>
${cards}`,
  })
}
