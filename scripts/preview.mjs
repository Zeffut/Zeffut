// Génère les trois DA côte à côte dans .preview/ pour les comparer en vrai.
import { writeFile, mkdir } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { collect } from './lib/data.mjs'
import { THEMES, THEME_IDS } from './lib/themes.mjs'
import { build } from './build.mjs'

const token = process.env.GITHUB_TOKEN || execSync('gh auth token', { encoding: 'utf8' }).trim()
const data = await collect({ token, login: process.env.GH_LOGIN || 'Zeffut' })
const root = new URL('../.preview/', import.meta.url).pathname
await mkdir(root, { recursive: true })

const blocks = []
for (const id of THEME_IDS) {
  const dir = root + id
  await mkdir(dir, { recursive: true })
  const { assets } = await build({ themeId: id, outDir: dir, login: 'Zeffut', data })
  const t = THEMES[id]
  blocks.push(`<section>
  <header><span class="n">${THEME_IDS.indexOf(id) + 1}</span><h2>${t.label}</h2><p>${t.tagline}</p>
  <code>README_THEME=${id}</code></header>
  ${Object.entries(assets).map(([f, svg]) => {
    const h = svg.match(/height="(\d+)"/)[1]
    return `<object type="image/svg+xml" data="${id}/assets/${f}" style="aspect-ratio:1000/${h}"></object>`
  }).join('\n  ')}
</section>`)
}

await writeFile(root + 'index.html', `<!doctype html><meta charset="utf-8">
<title>Zeffut — 3 directions artistiques</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#0d1117;color:#c9d1d9;font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;padding:48px 32px 96px}
.wrap{max-width:1040px;margin:0 auto}
h1{font-size:13px;letter-spacing:4px;color:#6e7681;font-weight:400;margin:0 0 48px}
section{margin:0 0 88px}
header{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin:0 0 18px;padding-bottom:14px;border-bottom:1px solid #21262d}
.n{font-size:11px;color:#0d1117;background:#4aedd9;width:20px;height:20px;border-radius:4px;display:grid;place-items:center;font-weight:700}
h2{font-size:20px;margin:0;letter-spacing:2px}
header p{margin:0;color:#6e7681;flex:1;min-width:240px}
code{background:#161b22;padding:3px 8px;border-radius:4px;color:#7dd35f;font-size:12px}
object{display:block;width:100%;margin:0 0 14px;border-radius:6px;pointer-events:none}
</style>
<div class="wrap"><h1>ZEFFUT · TROIS DIRECTIONS ARTISTIQUES</h1>
${blocks.join('\n')}
</div>`)
console.log('→ .preview/index.html')
