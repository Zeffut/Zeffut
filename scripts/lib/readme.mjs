// GitHub sert la variante qui correspond au thème du système d'exploitation.
// Le <img> final reste le repli pour tout contexte qui ignore <picture>.
const img = (base, stamps, alt) => {
  const dark = `assets/${base}.svg?v=${stamps[`${base}.svg`]}`
  const light = `assets/${base}-light.svg?v=${stamps[`${base}-light.svg`]}`
  return `<picture>
  <source media="(prefers-color-scheme: light)" srcset="${light}">
  <source media="(prefers-color-scheme: dark)" srcset="${dark}">
  <img src="${dark}" width="100%" alt="${alt}">
</picture>`
}

// Le README se réduit aux trois visuels : tout ce qu'ils disent est déjà de la
// donnée à jour, et la date de régénération vit dans le SVG d'en-tête.
export function buildReadme(d, stamps, keep) {
  const u = d.user
  const links = [
    u.website && `<a href="${u.website}"><b>Portfolio</b></a>`,
    `<a href="${u.url}?tab=repositories"><b>${d.totals.repos} dépôts</b></a>`,
    `<a href="${u.url}?tab=followers"><b>${u.followers} abonnés</b></a>`,
    u.location && `<span>${u.location}</span>`,
  ].filter(Boolean).join('&nbsp; · &nbsp;')

  return `<!--
  ⚠️  Fichier régénéré automatiquement par scripts/build.mjs
      (GitHub Actions, toutes les 6 h + à chaque push sur scripts/**).
      Pour écrire à la main, utilise uniquement la zone perso:start / perso:end.
      Pour changer de direction artistique : variable de dépôt README_THEME
      → chunk | replay | deepslate
-->

<div align="center">

${img('header', stamps, `${u.login} — ${d.totals.repos} dépôts, ${d.totals.stars} étoiles, ${d.totals.commits} commits sur 12 mois`)}

${links}

</div>

<!-- perso:start -->${keep || `

`}<!-- perso:end -->

${img('stats', stamps, `Activité sur 12 mois : ${d.totals.commits} commits, ${d.totals.prs} pull requests, ${d.totals.issues} issues, ${d.totals.reviews} revues. Langage principal : ${d.languages[0]?.name ?? '—'}.`)}

${img('activity', stamps, `Calendrier de contributions : ${d.calendar.total} contributions sur l’année, série en cours de ${d.streak.current} jours, record ${d.streak.longest} jours.`)}
`
}
