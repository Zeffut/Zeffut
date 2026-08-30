// Télécharge les woff2 sous-ensemblés chez Google Fonts et les encode en base64
// dans scripts/lib/fonts.mjs. Les SVG servis via <img> ne peuvent pas charger de
// ressource externe : la police doit être inline.
import { writeFile } from 'node:fs/promises'

const CHARSET =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
  'abcdefghijklmnopqrstuvwxyz{|}~' +
  'ÀÂÄÇÈÉÊËÎÏÔÖÙÛÜŸàâäçèéêëîïôöùûüÿŒœ' +
  '×·•★☆▲▼◆◇●○■□→←↑↓⌘⏻±°«»…—–‹›⟨⟩⑂✦✧▸◂▪▫│┃'

const FACES = [
  { id: 'mono',       family: 'JetBrains Mono', weight: 400 },
  { id: 'monoBold',   family: 'JetBrains Mono', weight: 800 },
  { id: 'plex',       family: 'IBM Plex Mono',  weight: 500 },
  { id: 'plexBold',   family: 'IBM Plex Mono',  weight: 700 },
  { id: 'archivo',    family: 'Archivo Black',  weight: 400 },
  { id: 'grotesk',    family: 'Space Grotesk',  weight: 700 },
  { id: 'groteskMed', family: 'Space Grotesk',  weight: 500 },
]

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

async function grab({ family, weight }) {
  const url =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
    `&text=${encodeURIComponent(CHARSET)}&display=swap`
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text()
  const woff2 = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/)?.[1]
  if (!woff2) throw new Error(`woff2 introuvable pour ${family} ${weight}\n${css.slice(0, 400)}`)
  const buf = Buffer.from(await (await fetch(woff2)).arrayBuffer())
  return buf.toString('base64')
}

const out = {}
for (const face of FACES) {
  out[face.id] = await grab(face)
  const kb = (out[face.id].length / 1365).toFixed(1)
  console.log(`  ${face.family} ${face.weight} → ${kb} KB (base64)`)
}

await writeFile(
  new URL('./lib/fonts.mjs', import.meta.url),
  '// Généré par scripts/fetch-fonts.mjs — ne pas éditer à la main.\n' +
    'export const FONTS = ' + JSON.stringify(out, null, 0) + '\n',
)
console.log('\n→ scripts/lib/fonts.mjs écrit')
