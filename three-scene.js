// =============================================================================
//  BALADE 3D IMMERSIVE — « Le Studio » d'Axel Le Faucheur
//  Une architecture d'intérieur (appartement / atelier) traversée pièce par
//  pièce AU DÉFILEMENT de la page. La caméra se promène à la première personne
//  le long d'un couloir : chaque pièce raconte un chapitre du CV.
//
//    Hall d'entrée ......... #home       (accueil, néon au nom)
//    Bureau / atelier ...... #about      (poste de travail réaliste)
//    Bibliothèque .......... #skills     (étagères de livres-technos)
//    Galerie ............... #projects   (cadres photo = projets)
//    Salle des trophées .... #experience (trophées métal sur marbre)
//    Terrasse .............. #contact    (baie vitrée, ville de nuit)
//
//  Réalisme : textures PBR procédurales (plâtre, béton ciré, marbre, écran
//  d'IDE), sol RÉFLÉCHISSANT (Reflector), mobilier détaillé, matériaux
//  métalliques et verre physiques, ombres douces, bloom cinématique.
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

// =============================================================================
//  FABRIQUES DE TEXTURES PROCÉDURALES (canvas → THREE.CanvasTexture)
//  Toutes au scope module : elles ne dépendent que de THREE et du DOM.
// =============================================================================
const c2d = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
};
const mkTex = (canvas, { srgb = true, rep = [1, 1] } = {}) => {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 8;
  return t;
};

// Plâtre mural : base sombre + micro-grain + taches douces + rayures.
function makeWallCanvas(base) {
  const [c, g] = c2d(512, 512);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const l = (Math.random() - 0.5) * 26;
    g.fillStyle = `rgba(${170 + l},${180 + l},${210 + l},0.018)`;
    g.beginPath(); g.arc(Math.random() * 512, Math.random() * 512, Math.random() * 2.4 + 0.4, 0, 7); g.fill();
  }
  for (let i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(0,0,0,0.028)';
    g.fillRect(Math.random() * 512, 0, 1 + Math.random() * 2, 512);
  }
  // taches d'ombre douces
  for (let i = 0; i < 16; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, r = 60 + Math.random() * 120;
    const rad = g.createRadialGradient(x, y, 0, x, y, r);
    rad.addColorStop(0, 'rgba(0,0,0,0.05)'); rad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rad; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  return c;
}

// Béton ciré : albédo tacheté + speckle fin.
function makeFloorAlbedo() {
  const [c, g] = c2d(512, 512);
  const grd = g.createLinearGradient(0, 0, 512, 512);
  grd.addColorStop(0, '#0b0e1a'); grd.addColorStop(1, '#0c1120');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const l = Math.random() * 34;
    g.fillStyle = `rgba(${l + 18},${l + 24},${l + 40},0.05)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
  }
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, r = 40 + Math.random() * 100;
    const rad = g.createRadialGradient(x, y, 0, x, y, r);
    rad.addColorStop(0, 'rgba(50,60,95,0.06)'); rad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rad; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  return c;
}
// Carte de rugosité du sol : flaques polies (sombre = brillant).
function makeFloorRough() {
  const [c, g] = c2d(512, 512);
  g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 34; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, r = 30 + Math.random() * 90;
    const rad = g.createRadialGradient(x, y, 0, x, y, r);
    rad.addColorStop(0, 'rgba(20,20,20,0.9)'); rad.addColorStop(1, 'rgba(154,154,154,0)');
    g.fillStyle = rad; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  return c;
}

// Plafond : panneaux sombres avec joints.
function makeCeilCanvas() {
  const [c, g] = c2d(256, 256);
  g.fillStyle = '#0a0d18'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(255,255,255,0.04)'; g.lineWidth = 2;
  for (let k = 0; k <= 256; k += 64) {
    g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 256); g.stroke();
    g.beginPath(); g.moveTo(0, k); g.lineTo(256, k); g.stroke();
  }
  return c;
}

// Écran d'IDE : barre de titre + lignes de code colorées.
function makeScreenCanvas() {
  const [c, g] = c2d(512, 320);
  g.fillStyle = '#0b1120'; g.fillRect(0, 0, 512, 320);
  g.fillStyle = '#141c31'; g.fillRect(0, 0, 512, 26);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    g.fillStyle = col; g.beginPath(); g.arc(16 + i * 18, 13, 5, 0, 7); g.fill();
  });
  // gouttière de numéros de ligne
  g.fillStyle = '#0e1526'; g.fillRect(0, 26, 34, 294);
  const cols = ['#7dd3fc', '#c4b5fd', '#f9a8d4', '#86efac', '#fde68a', '#93c5fd', '#fca5a5'];
  let y = 40;
  for (let ln = 0; ln < 19; ln++) {
    g.fillStyle = 'rgba(148,163,184,0.5)';
    g.fillRect(8, y + 1, 18, 5);
    let x = 44 + ((Math.random() * 3) | 0) * 16;
    const segs = 2 + ((Math.random() * 4) | 0);
    for (let s = 0; s < segs; s++) {
      const w = 22 + Math.random() * 74;
      g.fillStyle = cols[(ln + s) % cols.length];
      g.globalAlpha = 0.9; g.fillRect(x, y, w, 7); g.globalAlpha = 1;
      x += w + 9; if (x > 486) break;
    }
    y += 14;
  }
  return c;
}

// Dos de livre : bandes de titre + ombrage de tranche (sera teinté).
function makeSpineCanvas() {
  const [c, g] = c2d(64, 256);
  g.fillStyle = '#ededed'; g.fillRect(0, 0, 64, 256);
  g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, 18, 64, 4); g.fillRect(0, 234, 64, 4);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(10, 92, 44, 74);
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(16, 102 + i * 15, 32, 4); }
  const grd = g.createLinearGradient(0, 0, 64, 0);
  grd.addColorStop(0, 'rgba(0,0,0,0.4)'); grd.addColorStop(0.5, 'rgba(255,255,255,0.18)'); grd.addColorStop(1, 'rgba(0,0,0,0.4)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 256);
  return c;
}

// Marbre sombre veiné (piédestaux).
function makeMarbleCanvas() {
  const [c, g] = c2d(256, 256);
  g.fillStyle = '#12151f'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) {
    g.strokeStyle = `rgba(${140 + Math.random() * 60},${150 + Math.random() * 60},${180 + Math.random() * 60},${0.06 + Math.random() * 0.08})`;
    g.lineWidth = 0.6 + Math.random() * 1.4;
    g.beginPath();
    let x = Math.random() * 256, y = 0;
    g.moveTo(x, y);
    while (y < 256) { x += (Math.random() - 0.5) * 40; y += 12 + Math.random() * 20; g.lineTo(x, y); }
    g.stroke();
  }
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(200,210,235,${Math.random() * 0.03})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  return c;
}

// Pavé de touches (dessus du clavier).
function makeKeysCanvas() {
  const [c, g] = c2d(256, 96);
  g.fillStyle = '#0e1220'; g.fillRect(0, 0, 256, 96);
  for (let r = 0; r < 4; r++) {
    for (let k = 0; k < 12; k++) {
      g.fillStyle = '#1b2138';
      const x = 6 + k * 20.5, y = 6 + r * 22;
      g.fillRect(x, y, 17, 18);
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x, y, 17, 3);
    }
  }
  return c;
}

// Ville de nuit derrière la baie vitrée.
function makeCityCanvas() {
  const [c, g] = c2d(1024, 512);
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#05070f'); sky.addColorStop(0.55, '#0a1024'); sky.addColorStop(1, '#141d3a');
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 240; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.7})`;
    g.fillRect(Math.random() * 1024, Math.random() * 260, 1, 1);
  }
  const mg = g.createRadialGradient(830, 88, 0, 830, 88, 70);
  mg.addColorStop(0, 'rgba(226,232,255,0.95)'); mg.addColorStop(0.6, 'rgba(180,200,255,0.25)'); mg.addColorStop(1, 'rgba(180,200,255,0)');
  g.fillStyle = mg; g.beginPath(); g.arc(830, 88, 70, 0, 7); g.fill();
  const winCols = ['#fde68a', '#fcd34d', '#a5f3fc', '#93c5fd', '#f9a8d4'];
  const layers = [{ col: '#0a1024', max: 150 }, { col: '#0b1328', max: 210 }, { col: '#0d1836', max: 280 }];
  layers.forEach((layer, li) => {
    let x = -20;
    while (x < 1044) {
      const w = 34 + Math.random() * 74;
      const h = 60 + Math.random() * layer.max;
      const y = 512 - h;
      g.fillStyle = layer.col; g.fillRect(x, y, w, h);
      // fenêtres allumées
      for (let wy = y + 8; wy < 512 - 6; wy += 12) {
        for (let wx = x + 6; wx < x + w - 6; wx += 11) {
          if (Math.random() < 0.34 - li * 0.06) {
            g.fillStyle = winCols[(Math.random() * winCols.length) | 0];
            g.globalAlpha = 0.5 + Math.random() * 0.5;
            g.fillRect(wx, wy, 5, 6); g.globalAlpha = 1;
          }
        }
      }
      x += w + 6;
    }
  });
  return c;
}

// Affiche de projet (fond de secours avant chargement de la vraie image).
function makePosterCanvas(title, hex) {
  const [c, g] = c2d(512, 342);
  const grd = g.createLinearGradient(0, 0, 512, 342);
  grd.addColorStop(0, hex); grd.addColorStop(1, '#0b1020');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 342);
  g.globalAlpha = 0.16; g.strokeStyle = '#fff'; g.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    g.beginPath(); g.arc(Math.random() * 512, Math.random() * 300, 24 + Math.random() * 90, 0, 7); g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(0, 252, 512, 90);
  g.fillStyle = '#fff'; g.font = '700 30px Manrope, sans-serif'; g.textBaseline = 'middle';
  const t = title.length > 26 ? title.slice(0, 25) + '…' : title;
  g.fillText(t, 22, 298);
  return c;
}

// Halo/ombre de contact douce (posée à plat sous un objet).
function makeBlobCanvas() {
  const [c, g] = c2d(128, 128);
  const rad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rad.addColorStop(0, 'rgba(0,0,0,0.55)'); rad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rad; g.fillRect(0, 0, 128, 128);
  return c;
}

// Fait monter les particules de poussière lumineuse dans une pièce.
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
      // En tier 'high' le bloom passe par un EffectComposer (rendu dans ses
      // propres cibles) → le MSAA du renderer serait ignoré. On l'active donc
      // uniquement en tier 'low' (pas de composer).
      antialias: tier !== 'high',
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.warn('WebGL indisponible — balade 3D désactivée.', err);
    return;
  }

  // Plafond de densité de pixels abaissé (2 → 1.6) : gros gain de « fill rate »
  // sur écrans haute résolution, sans perte de netteté notable.
  const DPR_CAP = tier === 'high' ? 1.6 : 1.25;
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Ombres temps réel DÉSACTIVÉES : chaque PointLight génère une shadow-cubemap
  // (6 faces) → des dizaines de passes de rendu par frame = cause majeure de
  // saccade. On garde des ombres de contact texturées (quasi gratuites).
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x05070f, 0.026);

  const camera = new THREE.PerspectiveCamera(
    62, window.innerWidth / window.innerHeight, 0.05, 200
  );

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

  // --- Palette ----------------------------------------------------------------
  const COL = {
    a: readCssColor('--env-a', '#6366f1'),
    b: readCssColor('--env-b', '#8b5cf6'),
    c: readCssColor('--env-c', '#22d3ee'),
    pink: new THREE.Color('#ec4899'),
    warm: new THREE.Color('#fbbf24'),
    wall: new THREE.Color('#161a2b'),
    wall2: new THREE.Color('#1d2236'),
  };
  const accents = [COL.a, COL.b, COL.c, COL.pink, COL.warm, COL.c];

  // --- Textures partagées -----------------------------------------------------
  const texWall = mkTex(makeWallCanvas('#161a2b'), { rep: [16, 3] });
  const texWall2 = mkTex(makeWallCanvas('#1d2236'), { rep: [4, 3] });
  const texFloorAlb = mkTex(makeFloorAlbedo(), { rep: [6, 34] });
  const texFloorRough = mkTex(makeFloorRough(), { srgb: false, rep: [6, 34] });
  const texCeil = mkTex(makeCeilCanvas(), { rep: [6, 34] });
  const texScreen = mkTex(makeScreenCanvas());
  const texSpine = mkTex(makeSpineCanvas());
  const texMarble = mkTex(makeMarbleCanvas(), { rep: [1, 2] });
  const texKeys = mkTex(makeKeysCanvas());
  const texBlob = mkTex(makeBlobCanvas());

  // ===========================================================================
  //  PLAN DES PIÈCES
  // ===========================================================================
  const ROOM_LEN = 26;
  const ROOM_W = 18;
  const ROOM_H = 9;
  const DOOR_W = 4.4;
  const DOOR_H = 5.2;

  const ROOMS = [
    { id: 'home',       name: 'HALL',     accent: COL.c,    sway: 0 },
    { id: 'about',      name: 'ATELIER',  accent: COL.a,    sway: -2.4 },
    { id: 'skills',     name: 'BIBLIO',   accent: COL.b,    sway: 2.4 },
    { id: 'projects',   name: 'GALERIE',  accent: COL.pink, sway: -2.2 },
    { id: 'experience', name: 'TROPHÉES', accent: COL.warm, sway: 2.2 },
    { id: 'contact',    name: 'TERRASSE', accent: COL.c,    sway: 0 },
  ];
  const roomCenterZ = (i) => -i * ROOM_LEN;
  const roomCenterX = (i) => ROOMS[i].sway;

  // ===========================================================================
  //  LUMIÈRES GLOBALES
  // ===========================================================================
  scene.add(new THREE.AmbientLight(0x30407a, 0.5));
  const moon = new THREE.DirectionalLight(0x9bb4ff, 0.5);
  moon.position.set(6, 14, 8);
  scene.add(moon);

  const roomLights = ROOMS.map((r, i) => {
    const l = new THREE.PointLight(r.accent.getHex(), tier === 'high' ? 16 : 11, ROOM_LEN * 1.4, 2);
    l.position.set(roomCenterX(i), ROOM_H - 2.4, roomCenterZ(i));
    scene.add(l);
    return l;
  });

  // ===========================================================================
  //  MATÉRIAUX PARTAGÉS (PBR texturés)
  // ===========================================================================
  const matWall = new THREE.MeshStandardMaterial({ map: texWall, color: 0xbfc6e0, roughness: 0.96, metalness: 0.02 });
  const matWall2 = new THREE.MeshStandardMaterial({ map: texWall2, color: 0xc3c9e2, roughness: 0.9, metalness: 0.04 });
  const matCeil = new THREE.MeshStandardMaterial({ map: texCeil, color: 0x8890b0, roughness: 1, metalness: 0 });
  const matTrim = new THREE.MeshStandardMaterial({ color: 0x2a3350, roughness: 0.35, metalness: 0.75, envMapIntensity: 1.1 });
  const makeNeonMat = (color) => new THREE.MeshBasicMaterial({ color });
  const metalMat = (color, rough = 0.28) => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: rough, envMapIntensity: 1.3 });
  const mattMat = (color, rough = 0.8) => new THREE.MeshStandardMaterial({ color, metalness: 0, roughness: rough });
  // « Cristal » SANS transmission : la transmission (MeshPhysicalMaterial)
  // déclenche une passe de rendu supplémentaire de toute la scène (coûteuse,
  // comme un miroir). On simule le verre avec transparence + reflets
  // d'environnement (PMREM) + émissif → rendu quasi identique, bien moins cher.
  const glassMat = (color, opacity = 0.5) => new THREE.MeshStandardMaterial({
    color, roughness: 0.1, metalness: 0.2,
    transparent: true, opacity: clamp(opacity + 0.15, 0, 1),
    emissive: color, emissiveIntensity: 0.2, envMapIntensity: 1.4,
  });

  // Ombre de contact réutilisable.
  const addContactShadow = (parent, x, z, w, d) => {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: texBlob, transparent: true, opacity: 0.6, depthWrite: false })
    );
    s.rotation.x = -Math.PI / 2;
    s.position.set(x, 0.02, z);
    parent.add(s);
  };

  // ===========================================================================
  //  CONSTRUCTION DU BÂTI
  // ===========================================================================
  const building = new THREE.Group();
  scene.add(building);

  const totalDepth = ROOMS.length * ROOM_LEN;
  const startZ = ROOM_LEN / 2;
  const endZ = -totalDepth + ROOM_LEN / 2;
  const floorCenterZ = -totalDepth / 2 + ROOM_LEN / 2;

  // --- Sol : béton ciré brillant. On a RETIRÉ le Reflector : il re-rendait
  //     toute la scène via une caméra miroir à chaque frame (coût ~×2). Un
  //     matériau métallique lisse capte l'environnement PMREM → reflets
  //     crédibles pour une fraction du coût.
  const floorGeo = new THREE.PlaneGeometry(ROOM_W + 6, totalDepth + 8);
  const floorMat = new THREE.MeshStandardMaterial({
    map: texFloorAlb, roughnessMap: texFloorRough,
    color: 0xdfe6ff, roughness: 0.42, metalness: 0.7, envMapIntensity: 1.25,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, floorCenterZ);
  building.add(floor);

  // Tapis lumineux central (guide visuel).
  {
    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, totalDepth + 4),
      new THREE.MeshBasicMaterial({ color: COL.c, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.03, floorCenterZ);
    building.add(runner);
  }

  // --- Plafond ---------------------------------------------------------------
  {
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W + 6, totalDepth + 8), matCeil);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, ROOM_H, floorCenterZ);
    building.add(ceil);
  }

  // --- Murs latéraux + plinthes + corniche LED -------------------------------
  const strips = [];   // corniches LED animées, mises en cache (pas de traverse)
  const sideGeo = new THREE.PlaneGeometry(totalDepth + 8, ROOM_H);
  [-1, 1].forEach((s) => {
    const wall = new THREE.Mesh(sideGeo, matWall);
    wall.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    wall.position.set(s * (ROOM_W / 2), ROOM_H / 2, floorCenterZ);
    building.add(wall);

    // plinthe basse
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, totalDepth + 8), matTrim);
    skirt.position.set(s * (ROOM_W / 2 - 0.08), 0.2, floorCenterZ);
    building.add(skirt);

    // corniche LED en haut
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, totalDepth + 8), makeNeonMat(COL.a));
    strip.position.set(s * (ROOM_W / 2 - 0.2), ROOM_H - 0.6, floorCenterZ);
    building.add(strip);
    strips.push(strip);
  });

  // --- Murs d'extrémité ------------------------------------------------------
  {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), matWall2);
    back.position.set(0, ROOM_H / 2, endZ - ROOM_LEN / 2);
    building.add(back);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), matWall2);
    front.rotation.y = Math.PI;
    front.position.set(0, ROOM_H / 2, startZ);
    building.add(front);
  }

  // --- Cloisons + portes -----------------------------------------------------
  function addPartition(z, accent) {
    const g = new THREE.Group();
    const halfDoor = DOOR_W / 2;
    const sideW = (ROOM_W - DOOR_W) / 2;
    [-1, 1].forEach((s) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(sideW, ROOM_H), matWall2);
      panel.position.set(s * (halfDoor + sideW / 2), ROOM_H / 2, 0);
      panel.rotation.y = Math.PI;
      g.add(panel);
      const panelB = panel.clone(); panelB.rotation.y = 0; g.add(panelB);
    });
    const lintel = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, ROOM_H - DOOR_H), matWall2);
    lintel.position.set(0, DOOR_H + (ROOM_H - DOOR_H) / 2, 0);
    g.add(lintel);
    const lintelB = lintel.clone(); lintelB.rotation.y = Math.PI; g.add(lintelB);

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
  const partitions = [];
  for (let i = 0; i < ROOMS.length - 1; i++) {
    partitions.push(addPartition(roomCenterZ(i) - ROOM_LEN / 2, ROOMS[i + 1].accent));
  }

  // ===========================================================================
  //  DÉCORS PAR PIÈCE
  // ===========================================================================
  const decorGroups = ROOMS.map(() => new THREE.Group());
  decorGroups.forEach((g, i) => { g.position.set(roomCenterX(i), 0, roomCenterZ(i)); scene.add(g); });

  // Ombres temps réel désactivées (cf. renderer.shadowMap) → no-op. Conservé
  // pour ne pas toucher tous les appels ; l'ancrage au sol est assuré par les
  // ombres de contact texturées (addContactShadow), quasi gratuites.
  const setShadow = () => {};

  const makeLabel = (text, { color = '#eaf2ff', size = 128, weight = 700, font = 'Manrope', pad = 0.32, glow = '#22d3ee' } = {}) => {
    const [c, g] = c2d(2, 2);
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

  // ---------------------------------------------------------------------------
  //  PIÈCE 0 — HALL D'ENTRÉE
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[0];
    const name = makeLabel('AXEL LE FAUCHEUR', { size: 150, weight: 800, font: 'Bricolage Grotesque', glow: '#22d3ee', color: '#ffffff' });
    name.position.set(0, ROOM_H * 0.62, -ROOM_LEN * 0.42);
    g.add(name);
    const role = makeLabel('DÉVELOPPEUR FULLSTACK', { size: 80, weight: 600, font: 'JetBrains Mono', glow: '#6366f1', color: '#a5b4fc' });
    role.position.set(0, ROOM_H * 0.62 - 1.7, -ROOM_LEN * 0.42);
    g.add(role);

    // Socle en marbre + logo cristal en lévitation.
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.5, 48), new THREE.MeshStandardMaterial({ map: texMarble, roughness: 0.3, metalness: 0.2 }));
    plinth.position.set(0, 0.25, -ROOM_LEN * 0.08);
    setShadow(plinth); g.add(plinth);
    addContactShadow(g, 0, -ROOM_LEN * 0.08, 5, 5);

    const logo = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), glassMat(COL.c, 0.55));
    logo.position.set(0, ROOM_H * 0.34, -ROOM_LEN * 0.08);
    logo.userData.spin = 0.5;
    g.add(logo);
    const halo = new THREE.PointLight(COL.c.getHex(), 6, 12, 2);
    halo.position.copy(logo.position);
    g.add(halo);

    g.userData.motes = addMotes(g, { color: COL.c, count: 60, spreadX: ROOM_W * 0.5, spreadZ: ROOM_LEN * 0.5 });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 1 — ATELIER : poste de travail réaliste
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[1];
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a2f28, roughness: 0.5, metalness: 0.15, envMapIntensity: 0.8 });

    // Plateau + piètement métal.
    const desk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.22, 2.6), woodMat);
    desk.position.set(0, 2.0, -2);
    setShadow(desk); g.add(desk);
    [[-2.8, -0.95], [2.8, -0.95], [-2.8, -3.05], [2.8, -3.05]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2, 0.14), metalMat(0x8a92a6, 0.35));
      leg.position.set(x, 0.99, z); setShadow(leg); g.add(leg);
    });
    addContactShadow(g, 0, -2, 8, 4.6);

    // Moniteur : dalle IDE + coque fine + pied.
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.7), new THREE.MeshBasicMaterial({ map: texScreen }));
    screen.position.set(0, 3.15, -2.82);
    g.add(screen);
    const shell = new THREE.Mesh(new THREE.BoxGeometry(3.16, 1.86, 0.1), mattMat(0x0b0e18, 0.5));
    shell.position.set(0, 3.15, -2.9); setShadow(shell); g.add(shell);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.1), metalMat(0x9098a8, 0.4));
    neck.position.set(0, 2.5, -2.9); g.add(neck);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.08, 24), metalMat(0x9098a8, 0.4));
    stand.position.set(0, 2.15, -2.9); g.add(stand);
    g.userData.screen = screen;
    const screenLight = new THREE.PointLight(0x8ab4ff, 3.4, 7, 2);
    screenLight.position.set(0, 3.0, -1.7);
    g.add(screenLight);

    // Clavier + souris.
    const kb = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.66), mattMat(0x0e1220, 0.6));
    kb.position.set(-0.3, 2.16, -1.15); kb.rotation.x = -0.04; setShadow(kb); g.add(kb);
    const kbTop = new THREE.Mesh(new THREE.PlaneGeometry(1.82, 0.6), new THREE.MeshStandardMaterial({ map: texKeys, roughness: 0.7 }));
    kbTop.rotation.x = -Math.PI / 2 - 0.04; kbTop.position.set(-0.3, 2.215, -1.15); g.add(kbTop);
    const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), mattMat(0x11162a, 0.5));
    mouse.scale.set(1, 0.55, 1.5); mouse.position.set(1.15, 2.14, -1.1); setShadow(mouse); g.add(mouse);

    // Lampe de bureau articulée + lueur chaude.
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 20), metalMat(0x2a3350, 0.4));
    lampBase.position.set(-2.4, 2.16, -2.4); g.add(lampBase);
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.2, 0.07), metalMat(0x30395a, 0.4));
    arm1.position.set(-2.4, 2.8, -2.4); arm1.rotation.z = 0.5; g.add(arm1);
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.1, 0.07), metalMat(0x30395a, 0.4));
    arm2.position.set(-1.9, 3.35, -2.4); arm2.rotation.z = -0.8; g.add(arm2);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, 0.34, 18, 1, true), metalMat(0x39425f, 0.35));
    head.position.set(-1.4, 3.5, -2.4); head.rotation.z = -1.6; g.add(head);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), makeNeonMat(0xfff2cc));
    bulb.position.set(-1.28, 3.48, -2.4); g.add(bulb);
    const lampLight = new THREE.PointLight(0xffd59a, 5, 6, 2);
    lampLight.position.set(-1.2, 3.3, -2.1); g.add(lampLight);

    // Mug + plante en pot.
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.34, 20), mattMat(0xdedede, 0.4));
    mug.position.set(1.5, 2.28, -2.2); setShadow(mug); g.add(mug);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 10, 18), mattMat(0xdedede, 0.4));
    handle.position.set(1.72, 2.28, -2.2); handle.rotation.y = Math.PI / 2; g.add(handle);

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.36, 0.8, 20), new THREE.MeshStandardMaterial({ color: 0x9a5a3a, roughness: 0.8 }));
    pot.position.set(-3.9, 0.4, -2.2); setShadow(pot); g.add(pot);
    addContactShadow(g, -3.9, -2.2, 2, 2);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2f7d4f, roughness: 0.8 });
    for (let f = 0; f < 5; f++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.3, 8), foliageMat);
      leaf.position.set(-3.9 + (Math.random() - 0.5) * 0.4, 1.2 + Math.random() * 0.5, -2.2 + (Math.random() - 0.5) * 0.4);
      leaf.rotation.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
      setShadow(leaf); g.add(leaf);
    }

    // Chaise de bureau.
    const chair = new THREE.Group();
    const chairMat = mattMat(0x14192b, 0.6);
    const frameMat = metalMat(0x8a92a6, 0.4);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.24, 1.5), chairMat); seat.position.y = 1.9;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.9, 0.24), chairMat); back.position.set(0, 2.95, -0.72); back.rotation.x = -0.12;
    const coln = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 12), frameMat); coln.position.y = 1.28;
    chair.add(seat, back, coln);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.15), frameMat);
      leg.position.set(Math.cos(a) * 0.45, 0.78, Math.sin(a) * 0.45); leg.rotation.y = -a; chair.add(leg);
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10), mattMat(0x0a0d18, 0.5));
      wheel.rotation.z = Math.PI / 2; wheel.position.set(Math.cos(a) * 0.85, 0.7, Math.sin(a) * 0.85); chair.add(wheel);
    }
    chair.position.set(0.2, 0, 0.1); chair.rotation.y = Math.PI;
    setShadow(chair); g.add(chair);
    addContactShadow(g, 0.2, 0.2, 2.6, 2.6);

    // Panneau mural.
    const title = makeLabel('À PROPOS', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#6366f1', color: '#ffffff' });
    title.position.set(-4.7, ROOM_H * 0.66, -ROOM_LEN * 0.42); g.add(title);
    const line1 = makeLabel('Master SIIA · IA & Systèmes distribués', { size: 60, weight: 500, glow: '#6366f1', color: '#c7d2fe' });
    line1.position.set(-3.5, ROOM_H * 0.66 - 1.4, -ROOM_LEN * 0.42); g.add(line1);
    const line2 = makeLabel('Crédit Agricole CIB · Backend Java', { size: 60, weight: 500, glow: '#22d3ee', color: '#c7d2fe' });
    line2.position.set(-3.5, ROOM_H * 0.66 - 2.5, -ROOM_LEN * 0.42); g.add(line2);
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 2 — BIBLIOTHÈQUE : étagères de livres texturés
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[2];
    const title = makeLabel('COMPÉTENCES', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#8b5cf6', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.7, -ROOM_LEN * 0.42); g.add(title);

    const techs = ['Java', 'Spring', 'Python', 'Angular', 'Spark', 'LLM'];
    [-1, 1].forEach((side) => {
      const shelfX = side * (ROOM_W / 2 - 1.4);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.2, 6.5), new THREE.MeshStandardMaterial({ color: 0x241d17, roughness: 0.6, metalness: 0.1 }));
      cab.position.set(shelfX, 3.2, -1); setShadow(cab); g.add(cab);
      for (let r = 0; r < 4; r++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 6.3), new THREE.MeshStandardMaterial({ color: 0x2c241c, roughness: 0.55 }));
        plank.position.set(shelfX, 1.2 + r * 1.5, -1); g.add(plank);
        let z = -3.85;
        while (z < 1.7) {
          const col = accents[Math.floor(Math.random() * accents.length)].clone().lerp(new THREE.Color('#ffffff'), 0.15);
          const bh = 1.05 + Math.random() * 0.28;
          const bt = 0.26 + Math.random() * 0.18;
          const lean = Math.random() < 0.12;
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, bh, bt),
            new THREE.MeshStandardMaterial({ color: col, map: texSpine, roughness: 0.7, metalness: 0.04 })
          );
          book.position.set(shelfX, 1.2 + r * 1.5 + bh / 2 + 0.05, z + bt / 2);
          if (lean) book.rotation.x = 0.18;
          setShadow(book); g.add(book);
          z += bt + 0.04 + (lean ? 0.2 : 0);
        }
      }
    });

    g.userData.floatBooks = [];
    techs.forEach((tname, i) => {
      const col = accents[i % accents.length];
      const spr = makeLabel(tname, { size: 70, weight: 700, font: 'JetBrains Mono', glow: '#' + col.getHexString(), color: '#ffffff' });
      const angle = (i / 6) * Math.PI * 2;
      spr.position.set(Math.cos(angle) * 2.6, 3.4 + Math.sin(angle * 2) * 0.6, -1 + Math.sin(angle) * 2.0);
      spr.userData.base = spr.position.clone();
      spr.userData.phase = i;
      g.add(spr);
      g.userData.floatBooks.push(spr);
    });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 3 — GALERIE : cadres photo (projets)
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[3];
    const title = makeLabel('MES TRAVAUX', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#ec4899', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.74, -ROOM_LEN * 0.42); g.add(title);

    const projs = (typeof projectsData !== 'undefined' && Array.isArray(projectsData))
      ? projectsData.slice(0, 6)
      : [{ title: 'Comparateur IA' }, { title: 'Explicabilité LLM' }, { title: 'Jeu RPG Unity' }, { title: 'Arduino' }, { title: 'escapeW@b' }, { title: 'ENT Java' }];

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    g.userData.frames = [];
    projs.forEach((proj, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const col = accents[i % accents.length];
      const frame = new THREE.Group();

      // Toile = affiche procédurale (immédiate), remplacée par la vraie photo si dispo.
      const posterTex = mkTex(makePosterCanvas(proj.title || 'Projet', '#' + col.getHexString()));
      const artMat = new THREE.MeshStandardMaterial({
        map: posterTex, emissiveMap: posterTex, emissive: 0xffffff, emissiveIntensity: 0.35,
        roughness: 0.6, metalness: 0.0,
      });
      const art = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), artMat);
      art.position.z = 0.02;
      frame.add(art);
      if (proj.image) {
        loader.load(proj.image, (tx) => {
          tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
          artMat.map = tx; artMat.emissiveMap = tx; artMat.needsUpdate = true;
        }, undefined, () => {});
      }

      // Cadre : passe-partout sombre + moulure.
      const mat = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), mattMat(0x0c0f1c, 0.9));
      mat.position.z = 0.0; frame.add(mat);
      const border = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 0.16), matTrim);
      border.position.z = -0.08; setShadow(border); frame.add(border);
      // plaque « laiton » sous le cadre.
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), metalMat(0xd4af37, 0.35));
      plate.position.set(0, -1.6, 0.09); frame.add(plate);
      const cap = makeLabel((proj.title || '').length > 24 ? proj.title.slice(0, 22) + '…' : (proj.title || 'Projet'), { size: 44, weight: 600, glow: '#000000', color: '#1a1206' });
      cap.position.set(0, -1.6, 0.12); frame.add(cap);

      frame.position.set(side * (ROOM_W / 2 - 0.5), 4.2, -6 + row * 5.2);
      frame.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      frame.userData.art = art;
      frame.userData.phase = i;
      g.add(frame);
      g.userData.frames.push(frame);
      // (SpotLights retirés : les toiles sont émissives + bloom → elles
      //  s'éclairent elles-mêmes, sans 6 SpotLight coûteux dans la pièce.)
    });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 4 — SALLE DES TROPHÉES : métal sur marbre
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[4];
    const title = makeLabel('EXPÉRIENCE & FORMATION', { size: 110, weight: 800, font: 'Bricolage Grotesque', glow: '#fbbf24', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.74, -ROOM_LEN * 0.42); g.add(title);

    const items = [
      { y: 'CA-CIB 2026', shape: 'ico', metal: 0xd4af37 },
      { y: 'LAB-STICC 2025', shape: 'dodeca', metal: 0xcfd4dc },
      { y: 'CA-CIB 2024', shape: 'octa', metal: 0xcd7f32 },
      { y: 'Master SIIA', shape: 'torus', metal: 0xe6c757 },
      { y: 'Licence IFA', shape: 'ico', metal: 0xbfc4cc },
    ];
    const marbleMat = new THREE.MeshStandardMaterial({ map: texMarble, roughness: 0.28, metalness: 0.2, envMapIntensity: 1.0 });
    g.userData.trophies = [];
    const n = items.length;
    items.forEach((it, i) => {
      const t = i / (n - 1);
      const x = lerp(-ROOM_W * 0.32, ROOM_W * 0.32, t);
      const z = -1 + (i % 2 === 0 ? -1.7 : 1.7);
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.2, 32), marbleMat);
      ped.position.set(x, 1.1, z); setShadow(ped); g.add(ped);
      addContactShadow(g, x, z, 2.8, 2.8);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.16, 32), metalMat(0x2a3350, 0.3));
      cap.position.set(x, 2.28, z); g.add(cap);

      let geo;
      if (it.shape === 'ico') geo = new THREE.IcosahedronGeometry(0.8, 0);
      else if (it.shape === 'dodeca') geo = new THREE.DodecahedronGeometry(0.8, 0);
      else if (it.shape === 'octa') geo = new THREE.OctahedronGeometry(0.85, 0);
      else geo = new THREE.TorusKnotGeometry(0.5, 0.18, 72, 12);
      // Léger émissif → le trophée « brille » via le bloom SANS PointLight dédié.
      const trophyMat = metalMat(it.metal, 0.22);
      trophyMat.emissive = new THREE.Color(it.metal);
      trophyMat.emissiveIntensity = 0.18;
      const trophy = new THREE.Mesh(geo, trophyMat);
      trophy.position.set(x, 3.3, z);
      trophy.userData.spin = 0.6 + i * 0.1;
      g.add(trophy);
      const lab = makeLabel(it.y, { size: 52, weight: 600, font: 'JetBrains Mono', glow: '#fbbf24', color: '#fde68a' });
      lab.position.set(x, 2.6, z + 0.95); g.add(lab);
      g.userData.trophies.push(trophy);
    });
  }

  // ---------------------------------------------------------------------------
  //  PIÈCE 5 — TERRASSE : baie vitrée + ville de nuit
  // ---------------------------------------------------------------------------
  {
    const g = decorGroups[5];
    const title = makeLabel('ME CONTACTER', { size: 120, weight: 800, font: 'Bricolage Grotesque', glow: '#22d3ee', color: '#ffffff' });
    title.position.set(0, ROOM_H * 0.7, -ROOM_LEN * 0.32); g.add(title);
    const mail = makeLabel('lefaucheuraxel@gmail.com', { size: 62, weight: 600, font: 'JetBrains Mono', glow: '#22d3ee', color: '#a5f3fc' });
    mail.position.set(0, ROOM_H * 0.7 - 1.5, -ROOM_LEN * 0.32); g.add(mail);

    // Ville de nuit (panneau lumineux au loin) + tours de premier plan.
    const cityTex = mkTex(makeCityCanvas());
    const cityBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W * 2.4, ROOM_H * 1.7),
      new THREE.MeshBasicMaterial({ map: cityTex, fog: false })
    );
    cityBoard.position.set(0, ROOM_H * 0.5, -ROOM_LEN * 0.85);
    g.add(cityBoard);
    for (let b = 0; b < 8; b++) {
      const bw = 1.4 + Math.random() * 2.4;
      const bh = 4 + Math.random() * 8;
      const bx = lerp(-ROOM_W * 0.85, ROOM_W * 0.85, b / 7) + (Math.random() - 0.5);
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, 1.4 + Math.random()),
        new THREE.MeshStandardMaterial({ color: 0x0a0f20, roughness: 1, emissive: accents[b % accents.length], emissiveIntensity: 0.05 })
      );
      tower.position.set(bx, bh / 2, -ROOM_LEN * 0.72 - Math.random() * 4);
      g.add(tower);
    }

    // Baie vitrée (verre physique) + meneaux + garde-corps.
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W - 3, ROOM_H - 2),
      // Vitre : plan translucide réfléchissant (PAS de transmission → pas de
      // passe de rendu supplémentaire de la scène).
      new THREE.MeshStandardMaterial({ color: 0x0a1830, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.26, envMapIntensity: 1.2 })
    );
    glass.position.set(0, ROOM_H / 2, -ROOM_LEN * 0.48); g.add(glass);
    for (let k = -2; k <= 2; k++) {
      const mull = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H - 2, 0.12), matTrim);
      mull.position.set(k * (ROOM_W - 3) / 5, ROOM_H / 2, -ROOM_LEN * 0.48 + 0.05); g.add(mull);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W - 3, 0.12, 0.12), metalMat(0x9098a8, 0.35));
    rail.position.set(0, 1.6, -ROOM_LEN * 0.46); g.add(rail);

    g.userData.motes = addMotes(g, { color: COL.c, count: 70, spreadX: ROOM_W * 0.9, spreadZ: ROOM_LEN * 0.4, zOffset: -ROOM_LEN * 0.3, opacity: 0.8, height: ROOM_H });
  }

  // --- Particules montantes (poussière lumineuse) ----------------------------
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
  //  CHEMIN DE LA CAMÉRA (spline)
  // ===========================================================================
  const eyeH = 3.1;
  const camPoints = [];
  camPoints.push(new THREE.Vector3(0, eyeH, startZ - 2));
  ROOMS.forEach((r, i) => {
    camPoints.push(new THREE.Vector3(roomCenterX(i) * 0.6, eyeH, roomCenterZ(i)));
  });
  camPoints.push(new THREE.Vector3(0, eyeH, endZ - 2));
  const camPath = new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.5);

  const getLookAt = (uu, out) => {
    camPath.getPointAt(clamp(uu + 0.04, 0, 1), out);
    return out;
  };

  // ===========================================================================
  //  POST-PROCESSING (bloom)
  // ===========================================================================
  let composer = null;
  if (tier === 'high') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 0.65, 0.5, 0.72
    ));
    composer.addPass(new OutputPass());
    // Le bloom (flou séparable multi-passes) est très gourmand en fill rate :
    // on le rend à une densité de pixels plafonnée pour soulager le GPU.
    composer.setPixelRatio(Math.min(dpr, 1.25));
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  // ===========================================================================
  //  INTERACTIONS
  // ===========================================================================
  const pointer = new THREE.Vector2(0, 0);
  const look = new THREE.Vector2(0, 0);
  let pulse = 0;
  let scrollBoost = 0;

  window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });
  window.addEventListener('mouseout', () => { pointer.set(0, 0); });
  window.addEventListener('pointerdown', () => { pulse = Math.min(1.5, pulse + 0.9); }, { passive: true });

  let scrollP = 0;
  let targetU = 0;
  let lastScrollY = window.scrollY;
  let lastScrollT = performance.now();
  // Hauteur scrollable mise en CACHE : lire scrollHeight dans le handler de
  // scroll force un recalcul de layout (reflow) à chaque event → saccades.
  let scrollMax = 1;
  const recomputeScrollMax = () => {
    scrollMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  };
  const updateScroll = () => {
    scrollP = clamp(window.scrollY / scrollMax, 0, 1);
    targetU = scrollP;
    const now = performance.now();
    const dt = Math.max(now - lastScrollT, 1);
    const speed = Math.abs(window.scrollY - lastScrollY) / dt;
    scrollBoost = Math.min(1.4, scrollBoost + Math.min(speed * 0.1, 0.3));
    lastScrollY = window.scrollY;
    lastScrollT = now;
  };
  recomputeScrollMax();
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('load', recomputeScrollMax);
  setTimeout(recomputeScrollMax, 1200);
  setTimeout(recomputeScrollMax, 3200);

  const activeRoom = () => clamp(Math.round(scrollP * (ROOMS.length - 1)), 0, ROOMS.length - 1);

  // ===========================================================================
  //  BOUCLE DE RENDU
  // ===========================================================================
  const clock = new THREE.Clock();
  let paused = false;
  let u = 0;
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const render = () => (composer ? composer.render() : renderer.render(scene, camera));

  const frame = () => {
    if (paused) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    u += (targetU - u) * 0.06;
    pulse *= 0.92;
    scrollBoost *= 0.93;

    camPath.getPointAt(clamp(u, 0, 1), camPos);
    getLookAt(clamp(u, 0, 1), lookAt);

    look.x += (pointer.x - look.x) * 0.05;
    look.y += (pointer.y - look.y) * 0.05;
    lookAt.x += look.x * 2.4;
    lookAt.y += look.y * 1.6 + Math.sin(t * 0.5) * 0.06;
    camPos.y += Math.sin(t * 1.6) * 0.045;
    camPos.x += Math.sin(t * 0.9) * 0.05;

    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    // Position continue dans l'enfilade (0 = hall … n-1 = terrasse).
    const roomFloat = scrollP * (ROOMS.length - 1);
    const act = activeRoom();

    // CULLING PAR PIÈCE : on n'allume et on ne dessine QUE les pièces proches.
    // → nombre de lumières actives et d'objets dessinés fortement réduits.
    roomLights.forEach((l, i) => {
      const d = Math.abs(roomFloat - i);
      l.visible = d < 1.7;
      if (!l.visible) return;
      const near = 1 - clamp(d, 0, 1);
      const base = tier === 'high' ? 9 : 6;
      const targetI = base + near * 12 + pulse * 8 * near + scrollBoost * 4 * near;
      l.intensity += (targetI - l.intensity) * 0.1;
    });

    decorGroups.forEach((g, ri) => {
      const d = Math.abs(roomFloat - ri);
      g.visible = d < 1.7;          // pièces lointaines : ni dessin ni animation
      if (!g.visible) return;
      const near = 1 - clamp(d, 0, 1.4);
      g.traverse((o) => {
        if (o.userData.spin) o.rotation.y = t * o.userData.spin;
      });
      // écran d'IDE : léger scintillement de luminosité (garde les couleurs).
      if (g.userData.screen) {
        const s = 0.78 + 0.1 * Math.sin(t * 3 + ri) + pulse * 0.3 * near;
        g.userData.screen.material.color.setScalar(clamp(s, 0, 1.4));
      }
      if (g.userData.floatBooks) {
        g.userData.floatBooks.forEach((spr) => {
          spr.position.y = spr.userData.base.y + Math.sin(t * 1.2 + spr.userData.phase) * 0.25;
        });
      }
      if (g.userData.frames) {
        g.userData.frames.forEach((fr) => {
          fr.userData.art.material.emissiveIntensity = 0.3 + 0.14 * Math.sin(t * 1.5 + fr.userData.phase) + pulse * 0.4 * near;
        });
      }
      if (g.userData.motes) updateMotes(g.userData.motes, dt);
    });

    // Corniches LED : tableau mis en cache (plus de building.traverse par frame).
    const stripK = 0.6 + scrollBoost * 0.8 + Math.sin(t * 1.2) * 0.15;
    for (const strip of strips) strip.material.color.copy(ROOMS[act].accent).multiplyScalar(stripK);
    partitions.forEach((p, i) => {
      const near = 1 - clamp(Math.abs(scrollP * (ROOMS.length - 1) - (i + 0.5)) * 1.2, 0, 1);
      p.userData.frame.forEach((bar) => {
        bar.material.color.copy(ROOMS[i + 1].accent).multiplyScalar(0.7 + near * 0.8 + pulse * 0.5 * near);
      });
    });

    render();
  };

  renderer.setAnimationLoop(reduceMotion ? null : frame);

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
    if (composer) { composer.setPixelRatio(Math.min(d, 1.25)); composer.setSize(w, h); }
    recomputeScrollMax();
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
