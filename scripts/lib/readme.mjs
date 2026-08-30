import { ago } from './kit.mjs'

const dfmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
const date = (iso) => dfmt.format(new Date(iso))
const img = (name, stamp, alt) =>
  `<img src="assets/${name}?v=${stamp}" width="100%" alt="${alt}">`

export function buildReadme(d, stamps, keep) {
  const u = d.user
  const links = [
    u.website && `<a href="${u.website}"><b>Portfolio</b></a>`,
    `<a href="${u.url}?tab=repositories"><b>${d.totals.repos} dépôts</b></a>`,
    `<a href="${u.url}?tab=followers"><b>${u.followers} abonnés</b></a>`,
    u.location && `<span>${u.location}</span>`,
  ].filter(Boolean).join('&nbsp; · &nbsp;')

  const index = d.top.slice(0, 6)
    .map((r) => `<a href="${r.url}"><b>${r.name}</b></a>`)
    .join('&nbsp; · &nbsp;')

  const releases = d.releases.slice(0, 6).map((r) =>
    `| [**${r.repo}**](${r.repoUrl}) | [\`${r.tag}\`](${r.url}) | ${date(r.at)} | ${ago(r.at)} |`).join('\n')

  const lanes = d.lanes.filter((l) => l.repos.length).map((l) => {
    const rows = l.repos.slice(0, 12).map((r) =>
      `| [**${r.name}**](${r.url}) | ${r.desc ? r.desc.replace(/\|/g, '\\|').slice(0, 110) : '—'} | ${r.lang ?? '—'} | ${r.stars ? '★ ' + r.stars : ''} |`).join('\n')
    return `<details>
<summary><b>${l.label}</b> — ${l.repos.length} dépôt${l.repos.length > 1 ? 's' : ''}</summary>

| Projet | Description | Langage | |
| :-- | :-- | :-- | --: |
${rows}

</details>`
  }).join('\n\n')

  const fresh = d.fresh.slice(0, 5)
    .map((r) => `- [**${r.name}**](${r.url}) — ${r.desc || 'sans description'} <sub>· ${ago(r.pushedAt)}</sub>`)
    .join('\n')

  return `<!--
  ⚠️  Fichier régénéré automatiquement par scripts/build.mjs
      (GitHub Actions, toutes les 6 h + à chaque push).
      Pour écrire à la main, utilise uniquement la zone perso:start / perso:end.
      Pour changer de direction artistique : README_THEME dans
      .github/workflows/readme.yml → chunk | replay | deepslate
-->

<div align="center">

${img('header.svg', stamps['header.svg'], `${u.login} — ${d.totals.repos} dépôts, ${d.totals.stars} étoiles, ${d.totals.commits} commits sur 12 mois`)}

${links}

</div>

<!-- perso:start -->${keep || `

`}<!-- perso:end -->

${img('stats.svg', stamps['stats.svg'], `Activité sur 12 mois : ${d.totals.commits} commits, ${d.totals.prs} pull requests, ${d.totals.issues} issues, ${d.totals.reviews} revues. Langage principal : ${d.languages[0]?.name ?? '—'}.`)}

${img('projects.svg', stamps['projects.svg'], `Projets les plus étoilés : ${d.top.slice(0, 6).map((r) => `${r.name} (★${r.stars})`).join(', ')}`)}

<div align="center">${index}</div>

${img('activity.svg', stamps['activity.svg'], `Calendrier de contributions : ${d.calendar.total} contributions sur l’année, série en cours de ${d.streak.current} jours, record ${d.streak.longest} jours.`)}

## Dernières releases

| Projet | Version | Date | |
| :-- | :-- | :-- | --: |
${releases}

## Par domaine

${lanes}

## Derniers dépôts touchés

${fresh}

---

<div align="center">
<sub>README généré par <a href="scripts/build.mjs"><code>scripts/build.mjs</code></a> — DA « ${d.theme} », SVG animés faits maison, données GitHub GraphQL.<br>
Dernière régénération : ${d.stampFr} (Europe/Paris).</sub>
</div>
`
}
