#!/usr/bin/env node
// Régénère les SVG animés et le README à partir de l'état réel du profil.
//   node scripts/build.mjs [--theme chunk|replay|deepslate] [--out .]
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { THEMES, THEME_IDS } from './lib/themes.mjs'
import { collect } from './lib/data.mjs'
import { classify, tagline } from './lib/classify.mjs'
import { renderHeader } from './svg/header.mjs'
import { renderStats } from './svg/stats.mjs'
import { renderProjects } from './svg/projects.mjs'
import { renderActivity } from './svg/activity.mjs'
import { buildReadme } from './lib/readme.mjs'

const arg = (name, dflt) => {
  const i = process.argv.indexOf('--' + name)
  return i > -1 ? process.argv[i + 1] : dflt
}

const themeId = arg('theme', process.env.README_THEME || 'chunk')
if (!THEME_IDS.includes(themeId)) throw new Error(`Thème inconnu: ${themeId} (${THEME_IDS.join(', ')})`)
const t = THEMES[themeId]
const outDir = arg('out', new URL('..', import.meta.url).pathname)
const login = process.env.GH_LOGIN || 'Zeffut'

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try { return execSync('gh auth token', { encoding: 'utf8' }).trim() } catch {}
  throw new Error('Aucun token : définis GITHUB_TOKEN ou connecte-toi avec `gh auth login`.')
}

const fmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
})

export async function build({ themeId, outDir, login, data }) {
  const t = THEMES[themeId]
  const { lanes, focus } = classify(data.repos)
  const d = {
    ...data,
    lanes, focus,
    tagline: tagline(focus, data.user.bio),
    seed: data.user.databaseId ?? 0,
    stampFr: fmt.format(new Date(data.generatedAt)),
    weekMax: Math.max(1, ...data.calendar.weeks.map((w) => w.reduce((a, x) => a + x.contributionCount, 0))),
    theme: themeId,
  }

  const assets = {
    'header.svg': renderHeader(t, d),
    'stats.svg': renderStats(t, d),
    'projects.svg': renderProjects(t, d),
    'activity.svg': renderActivity(t, d),
  }

  await mkdir(`${outDir}/assets`, { recursive: true })
  const stamps = {}
  for (const [name, svg] of Object.entries(assets)) {
    await writeFile(`${outDir}/assets/${name}`, svg)
    // Le cache d'images de GitHub (camo) est indexé sur l'URL : on ne casse le
    // cache que lorsque le contenu change réellement.
    stamps[name] = createHash('sha1').update(svg).digest('hex').slice(0, 8)
  }
  return { d, assets, stamps, t }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = await collect({ token: token(), login })
  const { d, assets, stamps } = await build({ themeId, outDir, login, data })

  // Une zone d'écriture libre survit à chaque régénération.
  let keep = ''
  try {
    const prev = await readFile(`${outDir}/README.md`, 'utf8')
    keep = prev.match(/<!-- perso:start -->([\s\S]*?)<!-- perso:end -->/)?.[1] ?? ''
  } catch {}

  await writeFile(`${outDir}/README.md`, buildReadme(d, stamps, keep))
  const kb = Object.values(assets).reduce((a, s) => a + s.length, 0) / 1024
  console.log(`✓ DA « ${THEMES[themeId].label} » · ${d.totals.repos} dépôts · ${d.totals.stars} ★ · ${Math.round(kb)} KB de SVG`)
}
