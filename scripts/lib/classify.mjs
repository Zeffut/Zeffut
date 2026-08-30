// Zeffut ne fait pas « du code » en général : il fait du modding Minecraft, des
// outils macOS natifs, et de l'automatisation Python. Le README doit le dire.
// Les règles sont ordonnées — le premier motif qui accroche gagne.
const RULES = [
  {
    key: 'minecraft', slot: 'V1', label: 'Minecraft', short: 'Minecraft',
    blurb: 'Mods & plugins Minecraft', biome: 'minecraft-modding', color: '#7DD35F',
    langs: ['Java', 'Kotlin'],
    re: /minecraft|flashback|fabric|neoforge|forge|paper|purpur|spigot|bukkit|\bmod\b|plugin|smp|resourcepack|resource-pack|chunk|potion|hitbox|structures|farplayers|multiview|potato/i,
  },
  {
    key: 'macos', slot: 'V2', label: 'macOS & natif', short: 'macOS',
    blurb: 'Outils macOS natifs', biome: 'macos-natif', color: '#F05138',
    langs: ['Swift', 'Objective-C'],
    re: /macos|swift|swiftui|notch|presse-papier|clipboard|whisper|menubar/i,
  },
  {
    key: 'automation', slot: 'A1', label: 'IA · automatisation · web', short: 'IA & web',
    blurb: 'Automatisations Python & IA', biome: 'ia-automatisation', color: '#3572A5',
    langs: ['Python', 'C++', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Vue'],
    re: /bot|scraper|scraping|\bia\b|\bai\b|genius|generator|auto|n8n|jarvis|portfolio|extension|telegram|notion/i,
  },
]

const FALLBACK = RULES[2]

const laneOf = (r) => {
  const hay = `${r.name} ${r.desc} ${r.topics.join(' ')}`
  return RULES.find((rule) => rule.langs.includes(r.lang) || rule.re.test(hay)) ?? FALLBACK
}

export function classify(repos) {
  const buckets = new Map(RULES.map((r) => [r.key, { ...r, repos: [] }]))
  for (const r of repos) buckets.get(laneOf(r).key).repos.push(r)
  const lanes = RULES.map((r) => buckets.get(r.key))
  const focus = [...lanes]
    .filter((l) => l.repos.length)
    .sort((a, b) => b.repos.length - a.repos.length)
    .map((l) => ({ key: l.key, label: l.biome, blurb: l.blurb, count: l.repos.length }))
  return { lanes, focus }
}

// Une phrase qui reste vraie quand le profil bouge : elle se réécrit à partir
// de ce que Zeffut publie réellement.
export function tagline(focus, bio) {
  if (bio) return bio
  const parts = focus.slice(0, 3).map((f) => f.blurb)
  return parts.length ? parts.join('  ·  ') : 'Développeur'
}
