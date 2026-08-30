// Les trois directions artistiques. Chaque thème est un jeu de tokens fermé :
// couleurs, rôles typographiques, et le nom de la signature qui le rend
// reconnaissable. Changer de DA = changer THEME dans scripts/build.mjs.

export const THEMES = {
  // ── DA 1 ─────────────────────────────────────────────────────────────────
  // L'écran de debug F3 de Minecraft. Zeffut est d'abord moddeur : la DA parle
  // sa langue. Grille de chunks = ses repos colorés par langage, graphe TPS =
  // ses commits. La contrainte monospace intégrale EST la personnalité.
  chunk: {
    label: 'CHUNK',
    tagline: 'Écran de debug F3 — grille de chunks + graphe TPS',
    fonts: ['mono', 'monoBold'],
    display: "'JetBrains Mono'",
    body: "'JetBrains Mono'",
    data: "'JetBrains Mono'",
    displayWeight: 800,
    tracking: 14,
    radius: 6,
    c: {
      bg: '#0C0F14',
      panel: '#12161D',
      panelAlt: '#171C25',
      line: '#232A35',
      text: '#D7DEE8',
      dim: '#6B7688',
      faint: '#39424F',
      accent: '#4AEDD9',   // diamant
      accent2: '#7DD35F',  // herbe — la barre TPS
      accent3: '#FF5A4E',  // redstone — les pics de lag
      accent4: '#FCD34D',  // or
      ramp: '#7DD35F',
    },
  },

  // ── DA 2 ─────────────────────────────────────────────────────────────────
  // Flashback est son projet phare (4 repos autour). Le README devient une
  // timeline de montage : pistes, keyframes, tête de lecture qui balaye.
  replay: {
    label: 'REPLAY',
    tagline: 'Timeline de montage — tête de lecture + keyframes',
    fonts: ['archivo', 'plex', 'plexBold'],
    display: "'Archivo Black'",
    body: "'IBM Plex Mono'",
    data: "'IBM Plex Mono'",
    displayWeight: 400,
    tracking: -1,
    radius: 3,
    c: {
      bg: '#08090C',
      panel: '#101319',
      panelAlt: '#161B23',
      line: '#242B36',
      text: '#E9EDF4',
      dim: '#798394',
      faint: '#2A323E',
      accent: '#FFB020',   // tête de lecture ambre
      accent2: '#4DD9E8',  // piste vidéo
      accent3: '#FF5C8A',  // keyframes
      accent4: '#9EFF6E',  // audio
      ramp: '#4DD9E8',
    },
  },

  // ── DA 3 ─────────────────────────────────────────────────────────────────
  // Table d'enchantement : l'artisan qui fabrique des outils. Le glint — ce
  // balayage iridescent des objets enchantés — traverse le titre en boucle,
  // les orbes d'XP montent.
  deepslate: {
    label: 'DEEPSLATE',
    tagline: 'Table d’enchantement — glint iridescent + orbes d’XP',
    fonts: ['grotesk', 'groteskMed', 'mono'],
    display: "'Space Grotesk'",
    body: "'Space Grotesk'",
    data: "'JetBrains Mono'",
    displayWeight: 700,
    tracking: -2,
    radius: 14,
    c: {
      bg: '#0A0812',
      panel: '#130F20',
      panelAlt: '#1A1430',
      line: '#2B2145',
      text: '#E8E2F7',
      dim: '#8B7FB0',
      faint: '#3A2E5C',
      accent: '#A47CFF',   // glint violet
      accent2: '#7FFF3F',  // orbe d'XP
      accent3: '#FF7BD5',  // lapis-rose
      accent4: '#FFD166',  // or
      ramp: '#A47CFF',
    },
  },
}

export const THEME_IDS = Object.keys(THEMES)
