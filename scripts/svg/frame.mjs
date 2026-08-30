import { fontFaces, rrect } from '../lib/kit.mjs'

// Chaque SVG est une carte opaque autonome : GitHub ne transmet pas son thème
// aux images, donc on ne parie pas dessus. Les trois DA sont sombres par
// nature du sujet (écran de debug, station de montage, table d'enchantement),
// pas par défaut.
export function card(t, w, h) {
  const { c } = t
  switch (t.label) {
    case 'CHUNK':
      return `
<defs>
  <pattern id="px" width="22" height="22" patternUnits="userSpaceOnUse">
    <path d="M22 0H0v22" fill="none" stroke="${c.line}" stroke-width=".6" opacity=".55"/>
  </pattern>
</defs>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="${c.bg}" stroke="${c.line}"/>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="url(#px)"/>`

    case 'REPLAY':
      return `
<defs>
  <pattern id="px" width="1" height="3" patternUnits="userSpaceOnUse">
    <rect width="1" height="1" fill="${c.line}" opacity=".35"/>
  </pattern>
  <linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${c.panel}"/><stop offset="1" stop-color="${c.bg}"/>
  </linearGradient>
</defs>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="url(#vig)" stroke="${c.line}"/>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="url(#px)"/>`

    default: // DEEPSLATE
      return `
<defs>
  <radialGradient id="glow" cx="50%" cy="42%" r="62%">
    <stop offset="0" stop-color="${c.accent}" stop-opacity=".20"/>
    <stop offset=".55" stop-color="${c.accent}" stop-opacity=".05"/>
    <stop offset="1" stop-color="${c.bg}" stop-opacity="0"/>
  </radialGradient>
  <pattern id="px" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="9" height="1" fill="${c.line}" opacity=".5"/>
  </pattern>
</defs>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="${c.bg}" stroke="${c.line}"/>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="url(#px)" opacity=".5"/>
<path d="${rrect(0.5, 0.5, w - 1, h - 1, t.radius)}" fill="url(#glow)"/>`
  }
}

export function svg({ t, w, h, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" fill="none">
<style>
${fontFaces(t.fonts)}
text{dominant-baseline:auto}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
${css}
</style>
${card(t, w, h)}
${body}
</svg>`
}
