// Une requête GraphQL, tout le profil. Les stats dérivées (streak, part de
// chaque langage, cadence) sont calculées ici pour que les rendus SVG ne
// fassent que dessiner.

const QUERY = `
query($login:String!) {
  user(login:$login) {
    login name bio avatarUrl url location createdAt websiteUrl databaseId
    followers { totalCount }
    following { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
    repositories(first:100, ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC,
                 orderBy:{field:PUSHED_AT, direction:DESC}) {
      totalCount
      nodes {
        name description url stargazerCount forkCount isArchived pushedAt createdAt
        primaryLanguage { name color }
        languages(first:12, orderBy:{field:SIZE, direction:DESC}) {
          edges { size node { name color } }
        }
        releases(first:1, orderBy:{field:CREATED_AT, direction:DESC}) {
          nodes { tagName name url publishedAt isDraft isPrerelease }
        }
        repositoryTopics(first:8) { nodes { topic { name } } }
      }
    }
  }
}`

async function gql(token, login) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'zeffut-readme',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  if (json.errors) throw new Error('GraphQL: ' + JSON.stringify(json.errors))
  return json.data.user
}

// Le streak se lit à rebours depuis aujourd'hui. Une journée vide qui est
// *aujourd'hui* ne casse pas la série : la journée n'est pas finie.
function streaks(days) {
  let current = 0
  let longest = 0
  let run = 0
  for (const d of days) {
    if (d.contributionCount > 0) { run++; longest = Math.max(longest, run) } else run = 0
  }
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++
    else if (i === days.length - 1) continue
    else break
  }
  return { current, longest }
}

export async function collect({ token, login }) {
  const u = await gql(token, login)
  const cc = u.contributionsCollection
  const repos = u.repositories.nodes.filter((r) => !r.isArchived)

  // Part de chaque langage, pondérée par les octets réellement écrits.
  const byLang = new Map()
  for (const r of repos) {
    for (const e of r.languages.edges) {
      const cur = byLang.get(e.node.name) ?? { name: e.node.name, color: e.node.color, bytes: 0, repos: 0 }
      cur.bytes += e.size
      byLang.set(e.node.name, cur)
    }
    if (r.primaryLanguage) {
      const cur = byLang.get(r.primaryLanguage.name)
      if (cur) cur.repos++
    }
  }
  const totalBytes = [...byLang.values()].reduce((a, l) => a + l.bytes, 0) || 1
  const languages = [...byLang.values()]
    .map((l) => ({ ...l, pct: (l.bytes / totalBytes) * 100 }))
    .sort((a, b) => b.bytes - a.bytes)

  const weeks = cc.contributionCalendar.weeks.map((w) => w.contributionDays)
  const days = weeks.flat()
  const maxDay = Math.max(1, ...days.map((d) => d.contributionCount))

  const stars = repos.reduce((a, r) => a + r.stargazerCount, 0)
  const forks = repos.reduce((a, r) => a + r.forkCount, 0)

  const releases = repos
    .flatMap((r) =>
      r.releases.nodes
        .filter((n) => !n.isDraft && n.publishedAt)
        .map((n) => ({ repo: r.name, repoUrl: r.url, tag: n.tagName, name: n.name, url: n.url, at: n.publishedAt, pre: n.isPrerelease })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))

  const shaped = repos.map((r) => ({
    name: r.name,
    desc: r.description ?? '',
    url: r.url,
    stars: r.stargazerCount,
    forks: r.forkCount,
    lang: r.primaryLanguage?.name ?? null,
    langColor: r.primaryLanguage?.color ?? '#6B7688',
    pushedAt: r.pushedAt,
    createdAt: r.createdAt,
    topics: r.repositoryTopics.nodes.map((t) => t.topic.name),
  }))

  return {
    user: {
      login: u.login,
      name: u.name ?? u.login,
      bio: u.bio ?? '',
      url: u.url,
      avatar: u.avatarUrl,
      location: u.location ?? '',
      website: u.websiteUrl ?? '',
      since: u.createdAt.slice(0, 4),
      databaseId: u.databaseId,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
    },
    totals: {
      repos: repos.length,
      stars,
      forks,
      commits: cc.totalCommitContributions + cc.restrictedContributionsCount,
      prs: cc.totalPullRequestContributions,
      issues: cc.totalIssueContributions,
      reviews: cc.totalPullRequestReviewContributions,
      contributions: cc.contributionCalendar.totalContributions,
      releases: releases.length,
    },
    languages,
    repos: shaped,
    top: [...shaped].sort((a, b) => b.stars - a.stars || new Date(b.pushedAt) - new Date(a.pushedAt)),
    fresh: [...shaped].sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt)),
    calendar: { weeks, days, max: maxDay, total: cc.contributionCalendar.totalContributions },
    streak: streaks(days),
    releases,
    generatedAt: new Date().toISOString(),
  }
}
