// Page de comparaison des trois DA, avec les vrais SVG embarqués en data URI :
// chaque image reste son propre document (les identifiants ne se marchent pas
// dessus) et s'anime exactement comme sur GitHub.
import { readFile, writeFile } from 'node:fs/promises'
import { THEME_IDS } from './lib/themes.mjs'

const FILES = ['header.svg', 'stats.svg', 'projects.svg', 'activity.svg']
const LIVE = 'chunk'

const DA = {
  chunk: {
    n: '01', name: 'Chunk', sub: 'Écran de debug F3',
    concept: `L'overlay que tu ouvres avec F3 en jeu. Tout est en chasse fixe, tout est aligné à gauche, rien n'est décoratif : c'est un relevé. C'est la DA qui parle ta langue de tous les jours — douze de tes vingt-six dépôts sont du modding.`,
    data: [
      'La grille de droite : un bloc par dépôt, sa couleur est celle du langage, son opacité dit à quel point le dernier push est récent.',
      'Les emplacements en pointillés sont les chunks non chargés — ils bouchent la grille au lieu de laisser une rangée orpheline.',
      'La ligne <code>Seed</code> est ton véritable identifiant GitHub, la ligne <code>Biome</code> est ton domaine dominant, recalculé à chaque build.',
    ],
    motion: 'Le curseur clignote après ton nom, un balayage traverse la grille comme un re-rendu de chunks.',
  },
  replay: {
    n: '02', name: 'Replay', sub: 'Timeline de montage',
    concept: `Flashback est ton projet phare — quatre dépôts gravitent autour. Le README devient la station de montage : le profil se lit comme un rush qu'on scrute.`,
    data: [
      'Chaque dépôt est un clip posé sur sa période d’activité réelle, de sa création à son dernier push, empilé en trois sous-rangs pour rester lisible.',
      'Les losanges roses sur la règle sont tes releases, à leur date.',
      'La piste A2 est ta forme d’onde : les commits semaine par semaine sur douze mois.',
    ],
    motion: 'La tête de lecture ambre rejoue tes trois ans en boucle ; chaque clip s’allume au moment précis où elle le traverse.',
  },
  deepslate: {
    n: '03', name: 'Deepslate', sub: 'Table d’enchantement',
    concept: `L’angle artisan : celui qui fabrique des outils. Obsidienne, violet d’enchantement, orbes d’XP. C’est la plus décorative des trois — et la seule composition centrée.`,
    data: [
      'Les pastilles reprennent commits, série en cours, nombre de langages et de releases.',
      'Le calendrier de contributions passe dans la teinte violette du thème plutôt qu’un vert imposé.',
    ],
    motion: 'Le glint — ce balayage iridescent qui court sur les objets enchantés — traverse ton nom en boucle, pendant que les orbes d’XP montent.',
  },
}

const uri = async (theme, f) =>
  'data:image/svg+xml;base64,' +
  Buffer.from(await readFile(`.preview/${theme}/assets/${f}`)).toString('base64')

const sections = []
for (const id of THEME_IDS) {
  const da = DA[id]
  const imgs = []
  for (const f of FILES) imgs.push(`<img src="${await uri(id, f)}" alt="${da.name} — ${f.replace('.svg', '')}">`)
  sections.push(`<section class="da">
  <div class="label">
    <p class="cat">${da.n}</p>
    <h2>${da.name}${id === LIVE ? '<span class="live">en ligne</span>' : ''}</h2>
    <p class="sub">${da.sub}</p>
    <p class="concept">${da.concept}</p>
    <h3>Ce que tes données pilotent</h3>
    <ul>${da.data.map((d) => `<li>${d}</li>`).join('')}</ul>
    <h3>Le mouvement</h3>
    <p class="concept">${da.motion}</p>
    <p class="switch"><code>README_THEME=${id}</code></p>
  </div>
  <div class="plates">${imgs.join('')}</div>
</section>`)
}

await writeFile('.preview/da.html', `<title>Trois DA pour Zeffut</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Public+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
:root{
  --ground:#F6F5F3; --surface:#FFF; --ink:#17191D; --muted:#6B7078;
  --hair:#E3E2DE; --accent:#1F6152; --accent-soft:#E4EEEA;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#131417; --surface:#191B1F; --ink:#E9EAEC; --muted:#949AA4;
  --hair:#282B31; --accent:#5FBFA4; --accent-soft:#1B2C29;
}}
:root[data-theme="dark"]{
  --ground:#131417; --surface:#191B1F; --ink:#E9EAEC; --muted:#949AA4;
  --hair:#282B31; --accent:#5FBFA4; --accent-soft:#1B2C29;
}
*{box-sizing:border-box}
body{background:var(--ground);color:var(--ink);
  font:400 16px/1.65 "Public Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:72px 28px 120px;display:flex;flex-direction:column;gap:16px}

header.top{display:flex;flex-direction:column;gap:18px;padding-bottom:40px;border-bottom:1px solid var(--hair)}
.eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.22em;
  text-transform:uppercase;color:var(--accent);margin:0}
h1{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:clamp(34px,5vw,54px);line-height:1.05;
  letter-spacing:-.02em;margin:0;text-wrap:balance}
.lede{margin:0;max-width:62ch;color:var(--muted);font-size:17px}
.lede strong{color:var(--ink);font-weight:600}

.da{display:grid;grid-template-columns:300px 1fr;gap:44px;align-items:start;
  padding:56px 0;border-bottom:1px solid var(--hair)}
.label{position:sticky;top:28px;display:flex;flex-direction:column;gap:10px}
.cat{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.2em;
  color:var(--muted);margin:0}
.label h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:31px;line-height:1.1;
  letter-spacing:-.015em;margin:0;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.live{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;font-weight:400;
  letter-spacing:.1em;text-transform:uppercase;color:var(--accent);background:var(--accent-soft);
  border-radius:99px;padding:4px 9px;line-height:1}
.sub{margin:-4px 0 0;color:var(--muted);font-size:14px;font-style:italic}
.label h3{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10.5px;font-weight:600;
  letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:14px 0 -4px}
.concept{margin:0;font-size:14.5px;color:var(--ink);opacity:.86}
.label ul{margin:0;padding-left:17px;display:flex;flex-direction:column;gap:7px;
  font-size:14px;color:var(--ink);opacity:.86}
code{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:.86em;
  background:var(--accent-soft);color:var(--accent);border-radius:4px;padding:2px 5px}
.switch{margin:12px 0 0}
.switch code{font-size:12.5px;padding:6px 10px;display:inline-block}

.plates{display:flex;flex-direction:column;gap:12px;min-width:0}
.plates img{display:block;width:100%;height:auto;border-radius:8px;
  border:1px solid var(--hair);background:#0d1117}

footer{padding-top:36px;color:var(--muted);font-size:14px;max-width:64ch}
footer p{margin:0 0 10px}

@media (max-width:820px){
  .da{grid-template-columns:1fr;gap:26px}
  .label{position:static}
  .wrap{padding:48px 18px 80px}
}
</style>

<div class="wrap">
<header class="top">
  <p class="eyebrow">github.com/Zeffut · README de profil</p>
  <h1>Trois façons de te présenter</h1>
  <p class="lede">Trois directions artistiques pour ton README, construites sur <strong>tes vraies données</strong> :
  vingt-six dépôts, quatorze langages, ton calendrier de contributions. Les visuels ci-dessous
  ne sont pas des maquettes — ce sont les fichiers réellement générés, animés comme sur GitHub.
  <strong>Chunk est en ligne en ce moment.</strong> Changer de DA tient en une variable de dépôt.</p>
</header>

${sections.join('\n')}

<footer>
  <p><strong>Pour basculer :</strong> dépôt <code>Zeffut/Zeffut</code> → Settings → Secrets and variables →
  Actions → Variables → <code>README_THEME</code>. Ou onglet Actions → README → « Run workflow » et choisir
  la DA dans la liste. Tout se régénère seul ensuite, toutes les six heures.</p>
  <p>Aucun service tiers : les SVG sont générés par <code>scripts/build.mjs</code>, polices embarquées
  dans le fichier. Une zone <code>perso:start</code> / <code>perso:end</code> du README t'est réservée et
  survit à chaque régénération.</p>
</footer>
</div>
`)
console.log('→ .preview/da.html')
