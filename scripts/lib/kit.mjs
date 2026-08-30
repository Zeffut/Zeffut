import { FONTS } from './fonts.mjs'

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const FACE = {
  mono:       { family: 'JetBrains Mono', weight: 400, adv: 0.60 },
  monoBold:   { family: 'JetBrains Mono', weight: 800, adv: 0.60 },
  plex:       { family: 'IBM Plex Mono',  weight: 500, adv: 0.60 },
  plexBold:   { family: 'IBM Plex Mono',  weight: 700, adv: 0.60 },
  archivo:    { family: 'Archivo Black',  weight: 400, adv: 0.66 },
  grotesk:    { family: 'Space Grotesk',  weight: 700, adv: 0.56 },
  groteskMed: { family: 'Space Grotesk',  weight: 500, adv: 0.54 },
}

// Les polices doivent voyager dans le fichier : un SVG rendu via <img> n'a pas
// le droit d'aller chercher une ressource externe.
export const fontFaces = (ids) =>
  ids.map((id) => {
    const f = FACE[id]
    return `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:normal;` +
      `src:url(data:font/woff2;base64,${FONTS[id]}) format('woff2')}`
  }).join('')

export const advance = (id) => FACE[id]?.adv ?? 0.6

// Tronque sur la largeur rendue, pas sur le nombre de caractères.
export function fit(text, faceId, size, maxWidth) {
  const per = advance(faceId) * size
  const max = Math.floor(maxWidth / per)
  const t = String(text ?? '')
  return t.length <= max ? t : t.slice(0, Math.max(1, max - 1)).trimEnd() + '…'
}

export const width = (text, faceId, size) => String(text ?? '').length * advance(faceId) * size

export const num = (n) =>
  n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.0', '') + 'k' : String(n)

export const pad = (n, w = 2) => String(n).padStart(w, '0')

// Découpe une phrase en lignes tenant dans une largeur donnée.
export function wrap(text, faceId, size, maxWidth, maxLines = 2) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w
    if (width(next, faceId, size) > maxWidth && cur) { lines.push(cur); cur = w }
    else cur = next
    if (lines.length === maxLines) break
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1]
    if (words.join(' ').length > lines.join(' ').length) lines[maxLines - 1] = fit(last + '…', faceId, size, maxWidth)
  }
  return lines
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const round = (n) => Math.round(n * 100) / 100

// Rectangle à coins arrondis en path : plus prévisible que <rect rx> quand on
// n'arrondit que certains coins.
export function rrect(x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2)
  return `M${round(x + k)},${round(y)}H${round(x + w - k)}a${k},${k} 0 0 1 ${k},${k}` +
    `V${round(y + h - k)}a${k},${k} 0 0 1 ${-k},${k}H${round(x + k)}` +
    `a${k},${k} 0 0 1 ${-k},${-k}V${round(y + k)}a${k},${k} 0 0 1 ${k},${-k}Z`
}

export const days = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000)

export function ago(iso) {
  const d = days(iso)
  if (d <= 0) return "aujourd'hui"
  if (d === 1) return 'hier'
  if (d < 30) return `il y a ${d} j`
  if (d < 365) return `il y a ${Math.round(d / 30)} mois`
  return `il y a ${Math.floor(d / 365)} an${d >= 730 ? 's' : ''}`
}

// Une couleur mélangée vers le noir/blanc, pour les faces de blocs.
export function shade(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    clamp(Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)), 0, 255))
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('')
}

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
export function mix(a, b, k) {
  const A = rgb(a), B = rgb(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
// Cinq paliers de contribution, dérivés de l'accent du thème.
export const ramp = (t) => {
  const to = t.c.ramp ?? t.c.accent2
  return [t.c.panelAlt, mix(t.c.panelAlt, to, 0.3), mix(t.c.panelAlt, to, 0.55), mix(t.c.panelAlt, to, 0.8), to]
}
