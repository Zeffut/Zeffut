import { svg } from './frame.mjs'
import { esc, ramp, num } from '../lib/kit.mjs'

const W = 1000, H = 214
const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc']
const DAYS = { 1: 'lun', 3: 'mer', 5: 'ven' }

// Le calendrier classique, mais qui se remplit en vague de gauche à droite —
// l'année se rejoue à chaque chargement de page.
export function renderActivity(t, d) {
  const { c } = t
  const R = ramp(t)
  const X0 = 104, Y0 = 80, weeks = d.calendar.weeks
  const pitch = (958 - X0) / weeks.length
  const cell = pitch - 3
  const rx = t.label === 'REPLAY' ? 1 : 2

  const level = (n) => (n === 0 ? 0 : n >= d.calendar.max * 0.75 ? 4 : n >= d.calendar.max * 0.45 ? 3 : n >= d.calendar.max * 0.2 ? 2 : 1)

  let cells = '', months = '', lastMonth = -1, lastLabelX = -99
  weeks.forEach((week, wi) => {
    const first = week[0]
    if (first) {
      const m = new Date(first.date).getUTCMonth()
      const mx = X0 + wi * pitch
      if (m !== lastMonth && wi < weeks.length - 1 && mx - lastLabelX > 30) {
        months += `<text x="${mx.toFixed(1)}" y="70" font-family="${t.data}" font-size="9.5" fill="${c.dim}">${MONTHS[m]}</text>`
        lastLabelX = mx
      }
      if (m !== lastMonth) lastMonth = m
    }
    const col = week.map((day) => {
      const x = X0 + wi * pitch
      const y = Y0 + day.weekday * pitch
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${rx}" fill="${R[level(day.contributionCount)]}"/>`
    }).join('')
    // Délai strictement positif et fill-mode « none » : l'état de base est le
    // rendu fini, donc l'image au repos est complète même sans animation.
    cells += `<g class="w" style="animation-delay:${(0.12 + wi * 0.016).toFixed(3)}s">${col}</g>`
  })

  const dayLabels = Object.entries(DAYS).map(([i, l]) =>
    `<text x="${X0 - 10}" y="${(Y0 + i * pitch + cell * 0.78).toFixed(1)}" text-anchor="end" font-family="${t.data}" font-size="9.5" fill="${c.faint}">${l}</text>`).join('')

  const scale = R.map((col, i) =>
    `<rect x="${820 + i * 15}" y="197" width="11" height="11" rx="${rx.toFixed(1)}" fill="${col}"/>`).join('')

  const best = d.calendar.days.reduce((a, b) => (b.contributionCount > a.contributionCount ? b : a), d.calendar.days[0])

  return svg({
    t, w: W, h: H,
    css: `
.w{animation:fill .55s cubic-bezier(.2,.9,.3,1)}
@keyframes fill{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}`,
    body: `
<text x="42" y="52" font-family="${t.data}" font-size="10.5" fill="${c.dim}" letter-spacing="3">CALENDRIER · ${weeks.length} SEMAINES</text>
<text x="958" y="52" text-anchor="end" font-family="${t.data}" font-size="10.5" fill="${c.text}">${num(d.calendar.total)}<tspan fill="${c.faint}"> contributions</tspan></text>
<path d="M42 62h916" stroke="${c.line}"/>
${months}${dayLabels}${cells}
<text x="42" y="206" font-family="${t.data}" font-size="9.5" fill="${c.faint}">plus gros jour : ${esc(best.date)} · ${best.contributionCount} contributions</text>
<text x="808" y="206" text-anchor="end" font-family="${t.data}" font-size="9.5" fill="${c.faint}">moins</text>
${scale}
<text x="958" y="206" text-anchor="end" font-family="${t.data}" font-size="9.5" fill="${c.faint}">plus</text>`,
  })
}
