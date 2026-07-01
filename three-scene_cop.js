// =============================================================================
//  BALADE 3D IMMERSIVE — « Le Studio » d'Axel Le Faucheur
//  Une architecture d'intérieur (appartement / atelier) traversée pièce par
//  pièce AU DÉFILEMENT de la page. La caméra se promène à la première personne
//  le long d'un couloir : chaque pièce raconte un chapitre du CV.
//
//    Hall d'entrée ......... #home       (accueil, néon au nom)
//    Bureau / atelier ...... #about      (poste de travail, écran, tableau)
//    Bibliothèque .......... #skills     (étagères de « livres-technos »)
//    Galerie ............... #projects   (cadres suspendus = projets)
//    Salle des trophées .... #experience (piédestaux = expériences/diplômes)
//    Terrasse .............. #contact    (baie vitrée, ciel, ville au loin)
//
//  Le défilement pilote un chemin de caméra (spline) : on avance de porte en
//  porte. Interactions : la souris regarde autour (parallaxe douce), le clic
//  fait pulser la pièce courante, la vitesse de défilement anime les lumières.
//  Three.js (modules ES).
// =============================================================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// --- Utilitaires -------------------------------------------------------------
const readCssColor = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
};
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;

// Fait monter les particules de poussière lumineuse dans une pièce (recyclage
// en boucle du sol au plafond). Placxe au scope module : aucune closure requise.
function updateMotes(pts, dt) {
  const arr = pts.geometry.attributes.position.array;
  const spd = pts.userData.spd;
  const h = pts.userData.height;
  for (let i = 0; i < spd.length; i++) {
    arr[i * 3 + 1] += spd[i] * dt;
    if (arr[i * 3 + 1] > h) arr[i * 3 + 1] = 0;
  }
  pts.geometry.attributes.position.needsUpdate = true;
}

function boot() {
  const canvas = document.getElementById('webgl');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isSmall = window.matchMedia('(max-width: 768px)').matches;
  const tier = isSmall || isCoarse ? 'low' : 'high';

  // --- Renderer ---------------------------------------------------------------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier === 'high',
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.warn('WebGL indisponible — balade 3D désactivée.', err);
    return;
  }

  const DPR_CAP = tier === 'high' ? 2 : 1.5;
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = tier === 'high';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x05070f, 0.028);

  const camera = new THREE.PerspectiveCamera(
    62, window.innerWidth / window.innerHeight, 0.05, 200
  );

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

  // --- Palette ----------------------------------------------------------------
  const COL = {
    a: readCssColor('--env-a', '#6366f1'),   // indigo
    b: readCssColor('--env-b', '#8b5cf6'),   // violet
    c: readCssColor('--env-c', '#22d3ee'),   // cyan
    pink: new THREE.Color('#ec4899'),
    warm: new THREE.Color('#fbbf24'),        // ampoule chaude
    wall: new THREE.Color('#161a2b'),        // murs sombres
    wall2: new THREE.Color('#1d2236'),
    floor: new THREE.Color('#0c0f1c'),
  };
  const accents = [COL.a, COL.b, COL.c, COL.pink, COL.warm, COL.c];

  // ===========================================================================
  //  PLAN DES PIÈCES
  //  Le studio est une enfilade de pièces le long de l'axe -Z (on avance en
  //  regardant vers -Z). Chaque pièce = un chapitre. La caméra suit un chemin
  //  qui slalome légèrement de gauche à droite d'une pièce à l'autre.
  // ===========================================================================
  const ROOM_LEN = 26;         // profondeur d'une pièce (sur Z)
  const ROOM_W = 18;           // largeur d'une pièce (sur X)
  const ROOM_H = 9;            // hauteur
  const DOOR_W = 4.4;
  const DOOR_H = 5.2;

  const ROOMS = [
    { id: 'home',       name: 'HALL',       accent: COL.c,    sway: 0 },
    { id: 'about',      name: 'ATELIER',    accent: COL.a,    sway: -2.4 },
    { id: 'skills',     name: 'BIBLIO',     accent: COL.b,    sway: 2.4 },
    { id: 'projects',   name: 'GALERIE',    accent: COL.pink, sway: -2.2 },
    { id: 'experience', name: 'TROPHÉES',   accent: COL.warm, sway: 2.2 },
    { id: 'contact',    name: 'TERRASSE',   accent: COL.c,    sway: 0 },
  ];
  const roomCenterZ = (i) => -i * ROOM_LEN;           // centre de la pièce i
  const roomCenterX = (i) => ROOMS[i].sway;

  // ===========================================================================
  //  LUMIÈRES GLOBALES (ambiance nuit + soft key)
  // ===========================================================================
  scene.add(new THREE.AmbientLight(0x30407a, 0.55));
  const moon = new THREE.DirectionalLight(0x9bb4ff, 0.5);
  moon.position.set(6, 14, 8);
  scene.add(moon);

  // Chaque pièce reçoit sa propre lampe colorée (point light) : c'est ce qui
  // donne l'atmosphère et guide le regard vers le « chapitre » courant.
  const roomLights = ROOMS.map((r, i) => {
    const l = new THREE.PointLight(r.accent.getHex(), tier === 'high' ? 18 : 12, ROOM_LEN * 1.5, 2);
    l.position.set(roomCenterX(i), ROOM_H - 2.4, roomCenterZ(i));
    if (tier === 'high') { l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.radius = 6; }
    scene.add(l);
    return l;
  });

  // ===========================================================================
  //  MATÉRIAUX PARTAGÉS
  // ===========================================================================
  const matWall = new THREE.MeshStandardMaterial({
    color: COL.wall, roughness: 0.95, metalness: 0.0,
  });
  const matWall2 = new THREE.MeshStandardMaterial({
    color: COL.wall2, roughness: 0.9, metalness: 0.05,
  });
  const matFloor = new THREE.MeshStandardMaterial({
    color: COL.floor, roughness: 0.35, metalness: 0.4,
  });
  const matCeil = new THREE.MeshStandardMaterial({
    color: 0x0a0d18, roughness: 1, metalness: 0,
  });
  const matTrim = new THREE.MeshStandardMaterial({
    color: 0x2a3350, roughness: 0.5, metalness: 0.6,
  });

  // Petit néon émissif réutilisable (barre lumineuse).
  const makeNeonMat = (color) => new THREE.MeshBasicMaterial({ color });

  // ===========================================================================
  //  CONSTRUCTION DU BÂTI (sol, plafond, murs latéraux, cloisons + portes)
  // ===========================================================================
  const building = new THREE.Group();
  scene.add(building);

  const totalDepth = ROOMS.length * ROOM_LEN;
  const startZ = ROOM_LEN / 2;                 // avant de la 1re pièce
  const endZ = -totalDepth + ROOM_LEN / 2;     // fond de la dernière

  // --- Sol continu (une seule dalle qui court sous toutes les pièces) --------
  {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W + 6, totalDepth + 8), matFloor
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -totalDepth / 2 + ROOM_LEN / 2);
    floor.receiveShadow = tier === 'high';
    building.add(floor);

    // Reflet/tapis lumineux central le long du couloir (guide visuel).
    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, totalDepth + 4),
      new THREE.MeshBasicMaterial({
        color: COL.c, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending,
      })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.02, -totalDepth / 2 + ROOM_LEN / 2);
    building.add(runner);
  }

  // --- Plafond ---------------------------------------------------------------
  {
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W + 6, totalDepth + 8), matCeil
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, ROOM_H, -totalDepth / 2 + ROOM_LEN / 2);
    building.add(ceil);
  }

  // --- Murs latéraux gauche/droite (continus) --------------------------------
  const sideGeo = new THREE.PlaneGeometry(totalDepth + 8, ROOM_H);
  [-1, 1].forEach((s) => {
    const wall = new THREE.Mesh(sideGeo, matWall);
    wall.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    wall.position.set(s * (ROOM_W / 2), ROOM_H / 2, -totalDepth / 2 + ROOM_LEN / 2);
    wall.receiveShadow = tier === 'high';
    building.add(wall);

    // Corniche lumineuse le long du haut des murs (LED strip).
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, totalDepth + 8), makeNeonMat(COL.a)
    );
    strip.position.set(s * (ROOM_W / 2 - 0.2), ROOM_H - 0.6, -totalDepth / 2 + ROOM_LEN / 2);
    building.add(strip);
    strip.userData.isStrip = true;
  });

  // --- Mur du fond (derrière la dernière pièce) : grande baie ----------------
  {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), matWall2);
    back.position.set(0, ROOM_H / 2, endZ - ROOM_LEN / 2);
    building.add(back);
  }
  // --- Mur d'entrée (derrière la caméra au départ) ---------------------------
  {
    const front = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), matWall2);
    front.rotation.y = Math.PI;
    front.position.set(0, ROOM_H / 2, startZ);
    building.add(front);
  }

  // --- Cloisons entre pièces, percées d'une porte ----------------------------
  //     Chaque cloison = 4 panneaux (gauche, droite, linteau) autour d'une
  //     ouverture centrale, + un cadre lumineux (chambranle).
  function addPartition(z, accent) {
    const g = new THREE.Group();
    const halfDoor = DOOR_W / 2;
    const sideW = (ROOM_W - DOOR_W) / 2;

    // panneaux latéraux
    [-1, 1].forEach((s) => {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(sideW, ROOM_H), matWall2
      );
      panel.position.set(s * (halfDoor + sideW / 2), ROOM_H / 2, 0);
      panel.rotation.y = Math.PI; // face vers +Z (vers la caméra qui arrive)
      g.add(panel);
      const panelB = panel.clone(); panelB.rotation.y = 0; g.add(panelB);
    });
    // linteau au-dessus de la porte
    const lintel = new THREE.Mesh(
      new THREE.PlaneGeometry(DOOR_W, ROOM_H - DOOR_H), matWall2
    );
    lintel.position.set(0, DOOR_H + (ROOM_H - DOOR_H) / 2, 0);
    g.add(lintel);
    const lintelB = lintel.clone(); lintelB.rotation.y = Math.PI; g.add(lintelB);

    // chambranle lumineux (cadre néon autour de l'ouverture)
    const frameMat = makeNeonMat(accent);
    const barV = new THREE.BoxGeometry(0.16, DOOR_H, 0.16);
    const barH = new THREE.BoxGeometry(DOOR_W + 0.32, 0.16, 0.16);
    const lft = new THREE.Mesh(barV, frameMat); lft.position.set(-halfDoor - 0.08, DOOR_H / 2, 0); g.add(lft);
    const rgt = new THREE.Mesh(barV, frameMat); rgt.position.set(halfDoor + 0.08, DOOR_H / 2, 0); g.add(rgt);
    const top = new THREE.Mesh(barH, frameMat); top.position.set(0, DOOR_H + 0.08, 0); g.add(top);
    g.userData.frame = [lft, rgt, top];

    g.position.z = z;
    building.add(g);
    return g;
  }

  // Une cloison entre chaque paire de pièces consécutives.
  const partitions = [];
  for (let i = 0; i < ROOMS.length - 1; i++) {
    const z = roomCenterZ(i) - ROOM_LEN / 2;
    partitions.push(addPartition(z, ROOMS[i + 1].accent));
  }

  // ===========================================================================
  //  DÉCORS PAR PIÈCE (le « contenu » narratif du CV)
  // ===========================================================================
  const decorGroups = ROOMS.map(() => new THREE.Group());
  decorGroups.forEach((g, i) => { g.position.set(roomCenterX(i), 0, roomCenterZ(i)); scene.add(g); });

  // --- Fabrique de textes en canvas → sprite (pour titres/labels lisibles) ---
  const makeLabel = (text, { color = '#eaf2ff', size = 128, weight = 700, font = 'Manrope', pad = 0.32, glow = '#22d3ee' } = {}) => {
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    const fontStr = `${weight} ${size}px ${font}, sans-serif`;
    g.font = fontStr;
    const w = Math.ceil(g.measureText(text).width);
    c.width = w + size; c.height = Math.ceil(size * 1.6);
    g.font = fontStr;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = glow; g.shadowBlur = size * 0.5;
    g.fillStyle = color;
    g.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const spr = new THREE.Sprite(mat);
    const aspect = c.width / c.height;
    spr.scale.set(aspect * pad * size / 128 * 4, pad * size / 128 * 4, 1);
    return spr;
  };

  // Petit cube « objet déco » émissif réutilisable.
  const glassMat = (color, opacity = 0.5) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.15, metalness: 0.1, transmission: 0.6,
    transparent: true, opacity, thickness: 0.6, ior: 1.3,
    emissive: color, emissiveIntensity: 0.15,
  });

  // ---------------------------------------------------------------------------
  //  PIÈCE 0 — HALL D'ENTRÉE : nom en néon + logo AL flottant
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[0];
    const name = makeLabel('AXEL LE FAUCHEUR', { size: 150, weight: 800, font: 'Bricolage Grotesque', glow: '#22d3ee', color: '#ffffff' });
    name.position.set(0, ROOM_H * 0.62, -ROOM_LEN * 0.42);
    g.add(name);
    const role = makeLabel('DÉVELOPPEUR FULLSTACK', { size: 80, weight: 600, font: 'JetBrains Mono', glow: '#6366f1', color: '#a5b4fc' });
    role.position.set(0, ROOM_H * 0.62 - 1.7, -ROOM_LEN * 0.42);
    g.add(role);

    // Logo AL en cube de verre lumineux, en lévitation, qui tourne.
    const logo = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), glassMat(COL.c, 0.55));
    logo.position.set(0, ROOM_H * 0.34, -ROOM_LEN * 0.1);
    logo.userData.spin = 0.5;
    g.add(logo);
    const halo = new THREE.PointLight(COL.c.getHex(), 6, 12, 2);
    halo.position.copy(logo.position);
    g.add(halo);

    // « Tapis » de particules montantes (accueil vivant).
    g.userData.motes = addMotes(g, { color: COL.c, count: 60, spreadX: ROOM_W * 0.5, spreadZ: ROOM_LEN * 0.5 });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 1 — ATELIER : bureau, écran allumé, chaise, tableau (À propos)
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[1];
    // Bureau
    const desk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 2.6), matWall2);
    desk.position.set(0, 2.0, -2);
    desk.castShadow = tier === 'high'; desk.receiveShadow = tier === 'high';
    g.add(desk);
    // Pieds
    [[-2.7, -0.9], [2.7, -0.9], [-2.7, -3.1], [2.7, -3.1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2, 0.18), matTrim);
      leg.position.set(x, 1.0, z);
      g.add(leg);
    });
    // Écran (émissif, couleur du site)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.7), makeNeonMat(COL.a));
    screen.position.set(0, 3.1, -2.9);
    g.add(screen);
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.12), matTrim);
    bezel.position.set(0, 3.1, -3.0);
    g.add(bezel);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.1, 16), matTrim);
    foot.position.set(0, 2.15, -2.9);
    g.add(foot);
    g.userData.screen = screen;
    // Lueur bleutée de l'écran sur le bureau
    const screenLight = new THREE.PointLight(COL.a.getHex(), 4, 8, 2);
    screenLight.position.set(0, 3.0, -1.6);
    g.add(screenLight);

    // Panneau « À propos » lumineux au mur
    const title = makeLabel('À PROPOS', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#6366f1', color: '#ffffff' });
    title.position.set(-4.6, ROOM_H * 0.66, -ROOM_LEN * 0.42);
    g.add(title);
    const line1 = makeLabel('Master SIIA · IA & Systèmes distribués', { size: 60, weight: 500, glow: '#6366f1', color: '#c7d2fe' });
    line1.position.set(-3.4, ROOM_H * 0.66 - 1.4, -ROOM_LEN * 0.42);
    g.add(line1);
    const line2 = makeLabel('Crédit Agricole CIB · Backend Java', { size: 60, weight: 500, glow: '#22d3ee', color: '#c7d2fe' });
    line2.position.set(-3.4, ROOM_H * 0.66 - 2.5, -ROOM_LEN * 0.42);
    g.add(line2);
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 2 — BIBLIOTHÈQUE : étagères de « livres-technos » (Compétences)
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[2];
    const title = makeLabel('COMPÉTENCES', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#8b5cf6', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.7, -ROOM_LEN * 0.42);
    g.add(title);

    const techs = ['Java', 'Spring', 'Python', 'Angular', 'Spark', 'LLM', 'RAG', 'Docker', 'K8s', 'Oracle', 'GraphQL', 'MCP'];
    // Deux bibliothèques (gauche/droite) : rangées de livres colorés.
    [-1, 1].forEach((side) => {
      const shelfX = side * (ROOM_W / 2 - 1.4);
      // Caisson d'étagère
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.2, 6.5), matWall2);
      cab.position.set(shelfX, 3.2, -1);
      g.add(cab);
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        // planche
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 6.3), matTrim);
        plank.position.set(shelfX, 1.2 + r * 1.5, -1);
        g.add(plank);
        // livres sur la planche
        const perRow = 6;
        for (let k = 0; k < perRow; k++) {
          const col = accents[(r * perRow + k) % accents.length];
          const bh = 1.0 + Math.random() * 0.25;
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, bh, 0.28 + Math.random() * 0.14),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.1, emissive: col, emissiveIntensity: 0.12 })
          );
          book.position.set(shelfX, 1.2 + r * 1.5 + bh / 2 + 0.05, -3.9 + k * 1.05);
          book.rotation.x = (Math.random() - 0.5) * 0.05;
          g.add(book);
        }
      }
    });

    // « Livres-vedettes » qui flottent au centre avec le nom de la techno.
    g.userData.floatBooks = [];
    techs.slice(0, 6).forEach((t, i) => {
      const col = accents[i % accents.length];
      const spr = makeLabel(t, { size: 70, weight: 700, font: 'JetBrains Mono', glow: '#' + col.getHexString(), color: '#ffffff' });
      const angle = (i / 6) * Math.PI * 2;
      spr.position.set(Math.cos(angle) * 2.6, 3.4 + Math.sin(angle * 2) * 0.6, -1 + Math.sin(angle) * 2.0);
      spr.userData.base = spr.position.clone();
      spr.userData.phase = i;
      g.add(spr);
      g.userData.floatBooks.push(spr);
    });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 3 — GALERIE : cadres suspendus = projets (Travaux)
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[3];
    const title = makeLabel('MES TRAVAUX', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#ec4899', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.74, -ROOM_LEN * 0.42);
    g.add(title);

    // Récupère quelques vrais titres de projets si disponibles.
    const projTitles = (typeof projectsData !== 'undefined' && Array.isArray(projectsData))
      ? projectsData.slice(0, 6).map(p => p.title)
      : ['Comparateur de données IA', 'Explicabilité LLM', 'Jeu RPG Unity', 'Contrôleur Arduino', 'escapeW@b', 'ENT en Java'];

    g.userData.frames = [];
    // Cadres alignés sur les deux murs latéraux.
    projTitles.forEach((pt, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const col = accents[i % accents.length];
      const frame = new THREE.Group();
      // toile émissive
      const canvasArt = new THREE.Mesh(
        new THREE.PlaneGeometry(3.0, 2.0),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, metalness: 0.2, emissive: col, emissiveIntensity: 0.35 })
      );
      frame.add(canvasArt);
      // cadre
      const border = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.3, 0.14), matTrim);
      border.position.z = -0.08;
      frame.add(border);
      // titre du projet sous le cadre
      const cap = makeLabel(pt.length > 26 ? pt.slice(0, 24) + '…' : pt, { size: 46, weight: 600, glow: '#' + col.getHexString(), color: '#f5d0fe' });
      cap.position.set(0, -1.5, 0.1);
      frame.add(cap);

      frame.position.set(side * (ROOM_W / 2 - 0.6), 4.2, -6 + row * 5.2);
      frame.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      frame.userData.art = canvasArt;
      frame.userData.phase = i;
      g.add(frame);
      g.userData.frames.push(frame);

      // spot sur chaque tableau
      const spot = new THREE.PointLight(col.getHex(), 3, 6, 2);
      spot.position.set(side * (ROOM_W / 2 - 2), 6, -6 + row * 5.2);
      g.add(spot);
    });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 4 — SALLE DES TROPHÉES : piédestaux = expériences/diplômes
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[4];
    const title = makeLabel('EXPÉRIENCE & FORMATION', { size: 110, weight: 800, font: 'Bricolage Grotesque', glow: '#fbbf24', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.74, -ROOM_LEN * 0.42);
    g.add(title);

    const items = [
      { y: 'CA-CIB 2026', shape: 'ico', col: COL.c },
      { y: 'LAB-STICC 2025', shape: 'dodeca', col: COL.pink },
      { y: 'CA-CIB 2024', shape: 'octa', col: COL.a },
      { y: 'Master SIIA', shape: 'torus', col: COL.warm },
      { y: 'Licence IFA', shape: 'ico', col: COL.b },
    ];
    g.userData.trophies = [];
    const n = items.length;
    items.forEach((it, i) => {
      const t = i / (n - 1);
      const x = lerp(-ROOM_W * 0.32, ROOM_W * 0.32, t);
      const z = -1 + (i % 2 === 0 ? -1.6 : 1.6);
      // piédestal
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.2, 24), matWall2);
      ped.position.set(x, 1.1, z);
      ped.castShadow = tier === 'high';
      g.add(ped);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.16, 24), matTrim);
      cap.position.set(x, 2.28, z);
      g.add(cap);
      // trophée (forme géométrique lumineuse)
      let geo;
      if (it.shape === 'ico') geo = new THREE.IcosahedronGeometry(0.8, 0);
      else if (it.shape === 'dodeca') geo = new THREE.DodecahedronGeometry(0.8, 0);
      else if (it.shape === 'octa') geo = new THREE.OctahedronGeometry(0.85, 0);
      else geo = new THREE.TorusKnotGeometry(0.5, 0.18, 80, 12);
      const trophy = new THREE.Mesh(geo, glassMat(it.col, 0.6));
      trophy.position.set(x, 3.3, z);
      trophy.userData.spin = 0.6 + i * 0.1;
      g.add(trophy);
      const tl = new THREE.PointLight(it.col.getHex(), 3, 6, 2);
      tl.position.set(x, 3.3, z);
      g.add(tl);
      // label
      const lab = makeLabel(it.y, { size: 52, weight: 600, font: 'JetBrains Mono', glow: '#' + it.col.getHexString(), color: '#fde68a' });
      lab.position.set(x, 2.55, z + 0.9);
      g.add(lab);
      g.userData.trophies.push(trophy);
    });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 5 — TERRASSE : baie vitrée, ciel étoilé, ville au loin (Contact)
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[5];
    const title = makeLabel('ME CONTACTER', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#22d3ee', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.7, -ROOM_LEN * 0.32);
    g.add(title);
    const mail = makeLabel('lefaucheuraxel@gmail.com', { size: 62, weight: 600, font: 'JetBrains Mono', glow: '#22d3ee', color: '#a5f3fc' });
    mail.position.set(0, ROOM_H * 0.7 - 1.5, -ROOM_LEN * 0.32);
    g.add(mail);

    // Grande baie vitrée au fond (cadre + vitres légèrement teintées).
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W - 3, ROOM_H - 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x0a1830, roughness: 0.05, metalness: 0, transmission: 0.85,
        transparent: true, opacity: 0.35, thickness: 0.3, ior: 1.4,
      })
    );
    glass.position.set(0, ROOM_H / 2, -ROOM_LEN * 0.48);
    g.add(glass);
    // meneaux
    for (let k = -2; k <= 2; k++) {
      const mull = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H - 2, 0.12), matTrim);
      mull.position.set(k * (ROOM_W - 3) / 5, ROOM_H / 2, -ROOM_LEN * 0.48 + 0.05);
      g.add(mull);
    }

    // Skyline : silhouettes de tours au-delà de la vitre, avec fenêtres.
    const cityZ = -ROOM_LEN * 0.7;
    for (let b = 0; b < 16; b++) {
      const bw = 1.2 + Math.random() * 2.2;
      const bh = 3 + Math.random() * 9;
      const bx = lerp(-ROOM_W * 0.9, ROOM_W * 0.9, b / 15) + (Math.random() - 0.5);
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, 1.2 + Math.random()),
        new THREE.MeshStandardMaterial({ color: 0x0b1024, roughness: 1, emissive: accents[b % accents.length], emissiveIntensity: 0.06 })
      );
      tower.position.set(bx, bh / 2, cityZ - Math.random() * 6);
      g.add(tower);
    }
    // étoiles derrière la ville
    g.userData.motes = addMotes(g, { color: COL.c, count: 80, spreadX: ROOM_W * 0.95, spreadZ: ROOM_LEN * 0.5, zOffset: -ROOM_LEN * 0.8, opacity: 0.9, height: ROOM_H * 1.2 });
  }

  // --- Particules montantes (poussière lumineuse) dans une pièce -------------
  function addMotes(group, opts) {
    const { color, count, spreadX, spreadZ, zOffset = 0, opacity = 0.7, height = ROOM_H } = opts;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spreadX;
      pos[i * 3 + 1] = Math.random() * height;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spreadZ + zOffset;
      spd[i] = 0.2 + Math.random() * 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color, size: 0.07, transparent: true, opacity,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    group.add(pts);
    pts.userData.spd = spd;
    pts.userData.height = height;
    return pts;
  }

  // ===========================================================================
  //  CHEMIN DE LA CAMÉRA (spline) — on avance de pièce en pièce
  // ===========================================================================
  const eyeH = 3.1;                    // hauteur des yeux
  const camPoints = [];
  // Point de départ légèrement devant la 1re pièce.
  camPoints.push(new THREE.Vector3(0, eyeH, startZ - 2));
  ROOMS.forEach((r, i) => {
    // On passe près du centre de chaque pièce, en épousant son léger décalage.
    camPoints.push(new THREE.Vector3(roomCenterX(i) * 0.6, eyeH, roomCenterZ(i)));
  });
  // Point final : au fond de la terrasse, face à la baie.
  camPoints.push(new THREE.Vector3(0, eyeH, endZ - 2));
  const camPath = new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.5);

  // Cible du regard : toujours un peu en avant sur le chemin.
  const getLookAt = (u, out) => {
    const ahead = clamp(u + 0.04, 0, 1);
    camPath.getPointAt(ahead, out);
    return out;
  };

  // ===========================================================================
  //  POST-PROCESSING (bloom cinématique)
  // ===========================================================================
  let composer = null;
  if (tier === 'high') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.5, 0.7
    ));
    composer.addPass(new OutputPass());
    composer.setPixelRatio(dpr);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  // ===========================================================================
  //  INTERACTIONS
  // ===========================================================================
  const pointer = new THREE.Vector2(0, 0);
  const look = new THREE.Vector2(0, 0);
  let pulse = 0;            // impulsion au clic (fait « respirer » la pièce)
  let scrollBoost = 0;     // énergie liée à la vitesse de défilement

  window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });
  window.addEventListener('mouseout', () => { pointer.set(0, 0); });
  window.addEventListener('pointerdown', () => { pulse = Math.min(1.5, pulse + 0.9); }, { passive: true });

  // Défilement → position u le long du chemin.
  let scrollP = 0;
  let targetU = 0;
  let lastScrollY = window.scrollY;
  let lastScrollT = performance.now();
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    targetU = scrollP;
    const now = performance.now();
    const dt = Math.max(now - lastScrollT, 1);
    const speed = Math.abs(window.scrollY - lastScrollY) / dt;
    scrollBoost = Math.min(1.4, scrollBoost + Math.min(speed * 0.1, 0.3));
    lastScrollY = window.scrollY;
    lastScrollT = now;
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });

  // Quelle pièce est la plus proche (pour surligner la lampe courante) ?
  const activeRoom = () => clamp(Math.round(scrollP * (ROOMS.length - 1)), 0, ROOMS.length - 1);

  // ===========================================================================
  //  BOUCLE DE RENDU
  // ===========================================================================
  const clock = new THREE.Clock();
  let paused = false;
  let u = 0;                          // position lissée le long du chemin
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const render = () => (composer ? composer.render() : renderer.render(scene, camera));

  const frame = () => {
    if (paused) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    // Avance lissée le long du chemin (inertie douce).
    u += (targetU - u) * 0.06;
    pulse *= 0.92;
    scrollBoost *= 0.93;

    // --- Position & orientation caméra --------------------------------------
    camPath.getPointAt(clamp(u, 0, 1), camPos);
    getLookAt(clamp(u, 0, 1), lookAt);

    // Parallaxe souris : on décale légèrement la cible du regard.
    look.x += (pointer.x - look.x) * 0.05;
    look.y += (pointer.y - look.y) * 0.05;
    lookAt.x += look.x * 2.4;
    lookAt.y += look.y * 1.6 + Math.sin(t * 0.5) * 0.06; // léger balancement
    // Respiration verticale de la marche (pas feutrés).
    camPos.y += Math.sin(t * 1.6) * 0.045;
    camPos.x += Math.sin(t * 0.9) * 0.05;

    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    // --- Lumières des pièces : la pièce courante s'illumine davantage --------
    const act = activeRoom();
    roomLights.forEach((l, i) => {
      const near = 1 - clamp(Math.abs(scrollP * (ROOMS.length - 1) - i), 0, 1);
      const base = tier === 'high' ? 10 : 7;
      const targetI = base + near * 12 + pulse * 8 * near + scrollBoost * 4 * near;
      l.intensity += (targetI - l.intensity) * 0.08;
    });

    // --- Animations de décor -------------------------------------------------
    // Logo & trophées qui tournent, écran qui pulse, livres qui flottent.
    decorGroups.forEach((g, ri) => {
      const near = 1 - clamp(Math.abs(scrollP * (ROOMS.length - 1) - ri), 0, 1.4);
      g.traverse((o) => {
        if (o.userData.spin) o.rotation.y = t * o.userData.spin;
      });
      // écran atelier : léger battement de luminosité
      if (g.userData.screen) {
        const s = 0.6 + 0.2 * Math.sin(t * 2 + ri) + pulse * 0.4 * near;
        g.userData.screen.material.color.copy(COL.a).multiplyScalar(0.7 + s * 0.5);
      }
      // livres flottants (bibliothèque)
      if (g.userData.floatBooks) {
        g.userData.floatBooks.forEach((spr) => {
          const b = spr.userData.base;
          spr.position.y = b.y + Math.sin(t * 1.2 + spr.userData.phase) * 0.25;
        });
      }
      // tableaux (galerie) : pulsation d'émission
      if (g.userData.frames) {
        g.userData.frames.forEach((fr) => {
          const em = 0.3 + 0.15 * Math.sin(t * 1.5 + fr.userData.phase) + pulse * 0.5 * near;
          fr.userData.art.material.emissiveIntensity = em;
        });
      }
      // particules montantes
      const motes = g.userData.motes;
      if (motes) updateMotes(motes, dt);
    });

    // Corniche LED + chambranles : pulsent avec la vitesse de scroll.
    building.traverse((o) => {
      if (o.userData.isStrip) {
        const k = 0.6 + scrollBoost * 0.8 + Math.sin(t * 1.2) * 0.15;
        o.material.color.copy(ROOMS[act].accent).multiplyScalar(k);
      }
    });
    partitions.forEach((p, i) => {
      const near = 1 - clamp(Math.abs(scrollP * (ROOMS.length - 1) - (i + 0.5)) * 1.2, 0, 1);
      p.userData.frame.forEach((bar) => {
        bar.material.color.copy(ROOMS[i + 1].accent).multiplyScalar(0.7 + near * 0.8 + pulse * 0.5 * near);
      });
    });

    render();
  };

  renderer.setAnimationLoop(reduceMotion ? null : frame);

  // Mouvement réduit : on place la caméra dans le hall et on rend une image fixe.
  if (reduceMotion) {
    camPath.getPointAt(0, camPos);
    getLookAt(0, lookAt);
    camera.position.copy(camPos);
    camera.lookAt(lookAt);
    render();
  }

  requestAnimationFrame(() => canvas.classList.add('ready'));

  // ===========================================================================
  //  REDIMENSIONNEMENT & CYCLE DE VIE
  // ===========================================================================
  const onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const d = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(d);
    renderer.setSize(w, h);
    if (composer) { composer.setPixelRatio(d); composer.setSize(w, h); }
    if (reduceMotion) render();
  };
  window.addEventListener('resize', onResize, { passive: true });

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused && !reduceMotion) clock.getDelta();
  });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); paused = true; });
  canvas.addEventListener('webglcontextrestored', () => { paused = false; });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
