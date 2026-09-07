import * as THREE from 'three';
import {
  connectNetworking,
  onNetworkMessage,
  sendNetworkMessage
} from './networking.js';

// ============================================================
// LAST ONE STANDING
// RED LIGHT / GREEN LIGHT - MULTIPLAYER BUILD
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87cbed);

scene.fog = new THREE.Fog(0x87cbed, 65, 220);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);

camera.position.set(0, 6, 14);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

document.body.appendChild(renderer.domElement);


// ============================================================
// LIGHTING
// ============================================================

const hemisphere = new THREE.HemisphereLight(0xbfeaff, 0x49362a, 1.7);
scene.add(hemisphere);

const sun = new THREE.DirectionalLight(0xfff2d0, 3.5);
sun.position.set(-50, 80, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 250;
scene.add(sun);


// ============================================================
// MATERIALS
// ============================================================

const grassMat = new THREE.MeshStandardMaterial({ color: 0x4e8a43, roughness: 1 });
const grassDarkMat = new THREE.MeshStandardMaterial({ color: 0x315e32, roughness: 1 });
const dirtMat = new THREE.MeshStandardMaterial({ color: 0x705039, roughness: 1 });
const rockMat = new THREE.MeshStandardMaterial({ color: 0x686b68, roughness: 0.95 });
const rockDarkMat = new THREE.MeshStandardMaterial({ color: 0x4e514f, roughness: 1 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x714322, roughness: 0.9 });
const woodEndMat = new THREE.MeshStandardMaterial({ color: 0x3a2415, roughness: 1 });
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1eee7, roughness: 0.75 });
const skinMat = new THREE.MeshStandardMaterial({ color: 0xdca17c, roughness: 0.8 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.65 });


// ============================================================
// ARENA
// ============================================================

const ARENA_WIDTH = 110;
const START_Z = 10;
const FINISH_Z = -143;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(ARENA_WIDTH, 175, 50, 70),
  grassMat
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.1, -67);
ground.receiveShadow = true;
scene.add(ground);


// ============================================================
// DIRT BANKS
// ============================================================

for (const x of [-62, 62]) {
  const bank = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 175), dirtMat);
  bank.position.set(x, 2.8, -67);
  bank.receiveShadow = true;
  scene.add(bank);
}


// ============================================================
// FENCES
// ============================================================

function createFence(x) {
  const fence = new THREE.Group();

  for (let z = -150; z <= 15; z += 8) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.7, 0.35), woodEndMat);
    post.position.set(0, 1.35, z);
    post.castShadow = true;
    fence.add(post);
  }

  const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 168), woodMat);
  rail1.position.set(0, 2.1, -67);
  fence.add(rail1);

  const rail2 = rail1.clone();
  rail2.position.y = 1.0;
  fence.add(rail2);

  fence.position.x = x;
  scene.add(fence);
}

createFence(-53);
createFence(53);


// ============================================================
// GRASS
// ============================================================

function createGrass() {
  const bladeGeo = new THREE.ConeGeometry(0.045, 0.45, 3);

  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x326a32, roughness: 1 });

  const count = 5000;

  const grass = new THREE.InstancedMesh(bladeGeo, bladeMat, count);

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const x = THREE.MathUtils.randFloat(-50, 50);
    const z = THREE.MathUtils.randFloat(-150, 12);

    dummy.position.set(x, 0.18, z);

    const scale = THREE.MathUtils.randFloat(0.7, 1.8);
    dummy.scale.set(scale, scale, scale);

    dummy.rotation.y = Math.random() * Math.PI * 2;

    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  }

  grass.instanceMatrix.needsUpdate = true;

  scene.add(grass);
}

createGrass();


// ============================================================
// TREES
// ============================================================

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.75, 5, 12),
    woodMat
  );
  trunk.position.y = 2.5;
  trunk.castShadow = true;
  tree.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x285d30, roughness: 1 });

  const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(3.4, 6, 10), foliageMat);
  foliage1.position.y = 6;
  foliage1.castShadow = true;
  tree.add(foliage1);

  const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(2.7, 5, 10), foliageMat);
  foliage2.position.y = 9;
  foliage2.castShadow = true;
  tree.add(foliage2);

  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  scene.add(tree);
}

const trees = [
  [-47, -20, 1.1],
  [47, -25, 1.3],
  [-46, -48, 0.9],
  [46, -55, 1.2],
  [-48, -78, 1.3],
  [48, -88, 1.0],
  [-46, -112, 1.2],
  [47, -125, 1.4],
  [-44, -142, 1.0],
  [44, -145, 1.2]
];

for (const t of trees) {
  createTree(t[0], t[1], t[2]);
}


// ============================================================
// OBSTACLES
// ============================================================

const obstacles = [];

function addRock(x, z, sx, sy, sz) {
  const geometry = new THREE.DodecahedronGeometry(1, 1);

  const material = Math.random() > 0.35 ? rockMat : rockDarkMat;

  const rock = new THREE.Mesh(geometry, material);

  rock.position.set(x, sy * 0.55, z);
  rock.scale.set(sx, sy, sz);

  rock.rotation.set(
    Math.random() * 0.5,
    Math.random() * Math.PI,
    Math.random() * 0.3
  );

  rock.castShadow = true;
  rock.receiveShadow = true;

  scene.add(rock);

  obstacles.push({
    mesh: rock,
    type: 'rock',
    radius: Math.max(sx, sz) * 0.9,
    removed: false
  });
}

function addLog(x, z, length = 8, rotation = 0) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.85, length, 16),
    woodMat
  );
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const end1 = new THREE.Mesh(new THREE.CircleGeometry(0.76, 16), woodEndMat);
  end1.rotation.y = Math.PI / 2;
  end1.position.x = length / 2 + 0.01;
  group.add(end1);

  const end2 = end1.clone();
  end2.position.x = -length / 2 - 0.01;
  group.add(end2);

  group.position.set(x, 0.82, z);
  group.rotation.y = rotation;

  scene.add(group);

  obstacles.push({
    mesh: group,
    type: 'log',
    length: length,
    width: 1.7,
    radius: length * 0.52,
    removed: false
  });
}


// ============================================================
// OBSTACLE FIELD
// ============================================================

addRock(-15, -19, 3.0, 2.0, 2.4);
addRock(13, -22, 2.2, 1.6, 2.8);
addLog(0, -30, 10, 0.10);

addRock(24, -41, 3.2, 2.1, 2.3);
addLog(-20, -43, 8, -0.35);
addRock(-2, -49, 2.1, 1.5, 2.0);

addLog(17, -61, 11, 0.55);
addRock(-20, -64, 3.0, 2.2, 2.5);
addRock(2, -69, 2.0, 1.7, 2.2);

addRock(25, -80, 3.1, 2.0, 2.6);
addLog(-17, -82, 9, -0.25);
addRock(4, -89, 2.6, 1.8, 2.0);

addLog(16, -99, 11, 0.40);
addRock(-23, -103, 3.2, 2.2, 2.7);
addRock(0, -108, 2.0, 1.5, 2.2);

addRock(23, -119, 3.0, 2.1, 2.5);
addLog(-15, -121, 10, -0.5);
addRock(5, -128, 2.5, 1.9, 2.4);

addLog(0, -136, 8, 0.15);


// ============================================================
// FINISH
// ============================================================

const finishMat = new THREE.MeshStandardMaterial({ color: 0xe9e2d4, roughness: 0.8 });

const finish = new THREE.Mesh(new THREE.BoxGeometry(100, 0.08, 1.5), finishMat);
finish.position.set(0, 0.05, FINISH_Z);
finish.receiveShadow = true;
scene.add(finish);


// ============================================================
// SAFE ZONE
// ============================================================

const safeZone = new THREE.Mesh(
  new THREE.BoxGeometry(100, 0.02, 12),
  new THREE.MeshStandardMaterial({
    color: 0x607f55,
    roughness: 1,
    transparent: true,
    opacity: 0.55
  })
);
safeZone.position.set(0, 0.02, FINISH_Z - 5);
scene.add(safeZone);


// ============================================================
// DOLL
// ============================================================

const doll = new THREE.Group();
doll.position.set(0, 0, FINISH_Z - 9);
scene.add(doll);

// Feet
for (const x of [-1.2, 1.2]) {
  const foot = new THREE.Mesh(new THREE.BoxGeometry(2, 0.65, 3.2), blackMat);
  foot.position.set(x, 0.35, 0.2);
  foot.castShadow = true;
  doll.add(foot);
}

// Legs
for (const x of [-1.05, 1.05]) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.72, 4.3, 20),
    whiteMat
  );
  leg.position.set(x, 2.5, 0);
  leg.castShadow = true;
  doll.add(leg);
}

// Dress
const dress = new THREE.Mesh(
  new THREE.CylinderGeometry(2.5, 5, 6.2, 32),
  new THREE.MeshStandardMaterial({ color: 0xd9a43b, roughness: 0.75 })
);
dress.position.y = 7;
dress.castShadow = true;
doll.add(dress);

// Waist
const waist = new THREE.Mesh(
  new THREE.CylinderGeometry(2.1, 2.3, 1, 24),
  whiteMat
);
waist.position.y = 10;
doll.add(waist);

// Neck
const neck = new THREE.Mesh(
  new THREE.CylinderGeometry(0.9, 1, 1.8, 20),
  skinMat
);
neck.position.y = 11.3;
doll.add(neck);

// Arms
for (const x of [-3, 3]) {
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.6, 5.5, 18),
    whiteMat
  );
  arm.position.set(x, 8.2, 0);
  arm.rotation.z = x < 0 ? 0.15 : -0.15;
  arm.castShadow = true;
  doll.add(arm);

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), skinMat);
  hand.position.set(x * 1.04, 5.5, 0);
  doll.add(hand);
}


// ============================================================
// DOLL HEAD
// ============================================================

const headPivot = new THREE.Group();
headPivot.position.y = 12.7;
doll.add(headPivot);

const dollHead = new THREE.Mesh(new THREE.SphereGeometry(2.35, 32, 24), skinMat);
dollHead.scale.set(0.88, 1.08, 0.88);
dollHead.castShadow = true;
headPivot.add(dollHead);

// Hair
const hair = new THREE.Mesh(
  new THREE.SphereGeometry(2.42, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.58),
  blackMat
);
hair.position.y = 0.55;
headPivot.add(hair);

// Eyes
const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
const eyeBlackMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.3 });
const laserEyeMat = new THREE.MeshStandardMaterial({
  color: 0xff2222,
  emissive: 0xff0000,
  emissiveIntensity: 0
});

for (const x of [-0.72, 0.72]) {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 12), eyeWhiteMat);
  eye.position.set(x, 0.25, -2.08);
  headPivot.add(eye);

  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), eyeBlackMat);
  pupil.position.set(x, 0.24, -2.38);
  headPivot.add(pupil);

  const laserEye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), laserEyeMat);
  laserEye.position.set(x, 0.25, -2.5);
  headPivot.add(laserEye);
}

// Mouth
const mouth = new THREE.Mesh(
  new THREE.TorusGeometry(0.55, 0.09, 8, 20, Math.PI),
  blackMat
);
mouth.position.set(0, -0.62, -2.18);
mouth.rotation.x = Math.PI / 2;
headPivot.add(mouth);


// ============================================================
// LIGHT ORBS
// ============================================================

const redLight = new THREE.PointLight(0xff2222, 0, 30);
redLight.position.set(-2.2, 17, 0);
doll.add(redLight);

const greenLight = new THREE.PointLight(0x35ff65, 0, 30);
greenLight.position.set(2.2, 17, 0);
doll.add(greenLight);

function createLightOrb(color) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 20, 16),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 })
  );
}

const redOrb = createLightOrb(0xff2020);
const greenOrb = createLightOrb(0x42ff72);

redOrb.position.set(-2.2, 17, 0);
greenOrb.position.set(2.2, 17, 0);

doll.add(redOrb, greenOrb);


// ============================================================
// PLAYER NAME TAG
// ============================================================

function makeTextSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(5,8,12,0.78)';
  ctx.beginPath();
  ctx.roundRect(20, 20, 472, 88, 22);
  ctx.fill();

  ctx.font = 'bold 46px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );

  sprite.scale.set(3.4, 0.85, 1);

  return sprite;
}


// ============================================================
// PLAYERS
//
// Every player — the local keyboard "host" player and every
// phone controller that joins — is represented as an entry in
// the `players` Map, keyed by a stable id. This replaces the
// old single hard-coded `player` object.
// ============================================================

const HOST_ID = 'host-local-player';

const PLAYER_COLORS = [
  0xb52020, 0x2060b5, 0x20b558, 0xb5a020,
  0x8020b5, 0x20b5ac, 0xb5206e, 0x6eb520
];

let colorIndex = 0;

function nextPlayerColor() {
  const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
  colorIndex++;
  return color;
}

let spawnCounter = 0;

function nextSpawnX() {
  const slot = spawnCounter % 12;
  spawnCounter++;
  // Spread players out along the start line, clamped to the arena.
  return THREE.MathUtils.clamp((slot - 5.5) * 3.4, -46, 46);
}

function createPlayerVisual(name, color) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.68, 1.35, 8, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.65 })
  );
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 20, 16), skinMat);
  head.position.y = 1.3;
  head.castShadow = true;
  group.add(head);

  const playerHair = new THREE.Mesh(
    new THREE.SphereGeometry(0.61, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    blackMat
  );
  playerHair.position.y = 1.55;
  group.add(playerHair);

  const nameSprite = makeTextSprite(name.slice(0, 16).toUpperCase());
  nameSprite.position.set(0, 3.1, 0);
  group.add(nameSprite);

  return { group, body, head, hair: playerHair, nameSprite };
}

const players = new Map();

function spawnPlayer(id, name) {
  if (players.has(id)) {
    return players.get(id);
  }

  const visual = createPlayerVisual(name, nextPlayerColor());

  visual.group.position.set(nextSpawnX(), 1.05, START_Z);

  scene.add(visual.group);

  const state = {
    id,
    name,
    isHost: id === HOST_ID,
    group: visual.group,
    body: visual.body,
    head: visual.head,
    hair: visual.hair,
    nameSprite: visual.nameSprite,
    moveX: 0,
    moveY: 0,
    running: false,
    velocityY: 0,
    onGround: true,
    eliminated: false,
    finished: false,
    safeZoneReached: false,
    abilityUsed: false,
    redFreezeGrace: 0.12,
    lastPosition: visual.group.position.clone()
  };

  players.set(id, state);

  updatePlayerListUI();
  updateStartButtonLabel();

  return state;
}


// ============================================================
// GAME STATE (shared / global)
// ============================================================

const clock = new THREE.Clock();

const keys = {};

let gameStarted = false;

let phase = 'GREEN';

let gameTime = 90;

let phaseTimer = 2.8;
let phaseDuration = 2.8;

let headTargetRotation = 0;
let headRotationSpeed = 7;

let laserLine = null;
let laserTimer = 0;


// ============================================================
// INPUT (keyboard controls the local "host" player, for testing
// without a phone — same as any phone-controlled player)
// ============================================================

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;

  const hostPlayer = players.get(HOST_ID);

  if (
    event.code === 'KeyQ' &&
    !event.repeat &&
    hostPlayer &&
    !hostPlayer.abilityUsed &&
    !hostPlayer.eliminated &&
    !hostPlayer.finished
  ) {
    useAbility(hostPlayer);
  }

  if (event.code === 'KeyE' && !event.repeat && hostPlayer) {
    pushNearestObstacle(hostPlayer);
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});


// ============================================================
// HUD
// ============================================================

const hud = document.createElement('div');
hud.style.cssText = `
position:fixed;
top:20px;
left:50%;
transform:translateX(-50%);
text-align:center;
font-family:Arial,sans-serif;
color:white;
pointer-events:none;
z-index:10;
text-shadow:0 3px 10px rgba(0,0,0,.85);
`;
document.body.appendChild(hud);

const stateEl = document.createElement('div');
stateEl.style.cssText = `
font-size:46px;
font-weight:900;
letter-spacing:4px;
`;
hud.appendChild(stateEl);

const timerEl = document.createElement('div');
timerEl.style.cssText = `
font-size:23px;
font-weight:800;
margin-top:3px;
`;
hud.appendChild(timerEl);

const hintEl = document.createElement('div');
hintEl.style.cssText = `
font-size:15px;
font-weight:700;
margin-top:6px;
`;
hud.appendChild(hintEl);

// Per-player status panel (new — needed now that there can be
// several players at once).
const playerListEl = document.createElement('div');
playerListEl.style.cssText = `
position:fixed;
top:20px;
right:18px;
padding:12px 16px;
border-radius:10px;
background:rgba(8,10,14,.72);
color:white;
font-family:Arial,sans-serif;
font-size:13px;
font-weight:700;
z-index:10;
min-width:150px;
line-height:1.6;
pointer-events:none;
text-shadow:0 2px 6px rgba(0,0,0,.85);
`;
document.body.appendChild(playerListEl);

function statusFor(p) {
  if (p.eliminated) return { text: 'OUT', color: '#ff5050' };
  if (p.finished) return { text: 'SAFE', color: '#6dff8a' };
  if (!gameStarted) return { text: 'LOBBY', color: '#ffd85a' };
  return { text: phase === 'GREEN' ? 'RUNNING' : 'FROZEN', color: '#ffffff' };
}

function updatePlayerListUI() {
  const rows = [];

  for (const p of players.values()) {
    const status = statusFor(p);
    rows.push(
      `<div style="display:flex;justify-content:space-between;gap:14px;">` +
      `<span>${escapeHtml(p.name)}${p.isHost ? ' (you)' : ''}</span>` +
      `<span style="color:${status.color}">${status.text}</span>` +
      `</div>`
    );
  }

  playerListEl.innerHTML = rows.join('') || '<div>Waiting for players…</div>';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


// ============================================================
// CONTROLS HINT
// ============================================================

const controls = document.createElement('div');
controls.style.cssText = `
position:fixed;
left:18px;
bottom:18px;
padding:11px 15px;
border-radius:10px;
background:rgba(8,10,14,.78);
color:white;
font:700 13px Arial;
z-index:10;
pointer-events:none;
`;
controls.textContent =
  'WASD MOVE   |   SHIFT RUN   |   SPACE JUMP   |   E PUSH   |   Q ABILITY';
document.body.appendChild(controls);


// ============================================================
// START BUTTON / LOBBY
//
// Nothing (timer, red/green, elimination) begins until the host
// clicks this. Players can join and walk around freely before
// that — nobody can be eliminated or run out of time in the lobby.
// ============================================================

const startOverlay = document.createElement('div');
startOverlay.style.cssText = `
position:fixed;
left:50%;
bottom:70px;
transform:translateX(-50%);
z-index:15;
display:flex;
flex-direction:column;
align-items:center;
gap:10px;
`;
document.body.appendChild(startOverlay);

const startButton = document.createElement('button');
startButton.style.cssText = `
padding:18px 42px;
font:900 22px Arial;
letter-spacing:2px;
color:white;
background:#22aa55;
border:none;
border-radius:14px;
cursor:pointer;
box-shadow:0 8px 24px rgba(0,0,0,.45);
`;
startOverlay.appendChild(startButton);

const startHintEl = document.createElement('div');
startHintEl.style.cssText = `
color:white;
font:700 13px Arial;
text-shadow:0 2px 6px rgba(0,0,0,.85);
`;
startOverlay.appendChild(startHintEl);

function updateStartButtonLabel() {
  const phoneCount = [...players.values()].filter((p) => !p.isHost).length;
  startButton.textContent = `▶ START GAME  (${phoneCount} phone${phoneCount === 1 ? '' : 's'} joined)`;
}

function startGame() {
  if (gameStarted) return;

  gameStarted = true;

  startOverlay.style.display = 'none';

  setPhase('GREEN');
  flashBanner('GET READY');
}

startButton.addEventListener('click', startGame);

updateStartButtonLabel();
startHintEl.textContent = 'Have everyone scan the QR code and join, then press start';


// ============================================================
// BANNER
// ============================================================

const banner = document.createElement('div');
banner.style.cssText = `
position:fixed;
left:50%;
top:52%;
transform:translate(-50%,-50%);
color:white;
font:900 64px Arial;
letter-spacing:5px;
text-shadow:0 5px 25px rgba(0,0,0,.9);
opacity:0;
pointer-events:none;
z-index:12;
transition:opacity .15s;
`;
document.body.appendChild(banner);

function flashBanner(text) {
  banner.textContent = text;
  banner.style.opacity = '1';

  setTimeout(() => {
    banner.style.opacity = '0';
  }, 800);
}


// ============================================================
// RED / GREEN
// ============================================================

function setPhase(next) {
  phase = next;

  if (phase === 'GREEN') {
    phaseDuration = THREE.MathUtils.randFloat(2.0, 4.6);
    phaseTimer = phaseDuration;

    headTargetRotation = 0;

    greenLight.intensity = 6;
    redLight.intensity = 0;

    greenOrb.material.emissiveIntensity = 4;
    redOrb.material.emissiveIntensity = 0.1;

    stateEl.textContent = 'GREEN';
    stateEl.style.color = '#52ff78';

    hintEl.textContent = 'RUN — GET TO THE FINISH';

    flashBanner('RUN!');
  } else {
    phaseDuration = THREE.MathUtils.randFloat(1.15, 2.8);
    phaseTimer = phaseDuration;

    headTargetRotation = Math.PI;

    greenLight.intensity = 0;
    redLight.intensity = 6;

    greenOrb.material.emissiveIntensity = 0.1;
    redOrb.material.emissiveIntensity = 4;

    stateEl.textContent = 'RED';
    stateEl.style.color = '#ff3030';

    hintEl.textContent = 'FREEZE';

    flashBanner('FREEZE!');
  }

  updatePlayerListUI();
}

// Show a neutral "waiting" HUD state until the host presses start.
stateEl.textContent = 'LOBBY';
stateEl.style.color = '#ffd85a';
hintEl.textContent = 'WAITING FOR PLAYERS TO JOIN';


// ============================================================
// LASER
// ============================================================

function fireLaser(target) {
  if (laserLine) {
    scene.remove(laserLine);
    laserLine.geometry.dispose();
    laserLine.material.dispose();
    laserLine = null;
  }

  const start = new THREE.Vector3();
  headPivot.getWorldPosition(start);
  start.y += 0.2;

  const end = target.clone();
  end.y += 1;

  const direction = end.clone().sub(start);
  const length = direction.length();

  const geometry = new THREE.CylinderGeometry(0.1, 0.23, length, 12);

  const material = new THREE.MeshBasicMaterial({
    color: 0xff1111,
    transparent: true,
    opacity: 0.95
  });

  laserLine = new THREE.Mesh(geometry, material);

  laserLine.position.copy(start).add(end).multiplyScalar(0.5);

  laserLine.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize()
  );

  scene.add(laserLine);

  laserTimer = 0.25;
}


// ============================================================
// ELIMINATION / WIN (per player)
// ============================================================

function eliminate(p, reason) {
  if (p.eliminated || p.finished) return;

  p.eliminated = true;

  fireLaser(p.group.position);
  flashBanner(`${p.name.toUpperCase()} ${reason}`);

  p.body.material.color.set(0x303030);
  p.head.visible = false;
  p.hair.visible = false;

  updatePlayerListUI();
}

function win(p) {
  if (p.finished || p.eliminated) return;

  p.finished = true;
  p.safeZoneReached = true;

  flashBanner(`${p.name.toUpperCase()} SURVIVED!`);

  updatePlayerListUI();
}


// ============================================================
// ABILITY (per player)
// ============================================================

function useAbility(p) {
  if (!gameStarted) return;
  if (!p || p.eliminated || p.finished || p.abilityUsed) return;

  p.abilityUsed = true;

  let closest = null;
  let closestDistance = Infinity;

  for (const o of obstacles) {
    if (o.removed) continue;

    const distance = p.group.position.distanceTo(o.mesh.position);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = o;
    }
  }

  if (closest && closestDistance < 14) {
    closest.removed = true;
    closest.mesh.visible = false;

    flashBanner(`${p.name.toUpperCase()} REMOVED AN OBSTACLE`);
  } else {
    flashBanner('NO OBSTACLE NEARBY');
  }
}


// ============================================================
// PUSH (per player)
// ============================================================

function pushNearestObstacle(p) {
  if (!gameStarted) return;
  if (!p || p.eliminated || p.finished) return;

  let closest = null;
  let closestDistance = Infinity;

  for (const o of obstacles) {
    if (o.removed) continue;

    const dx = p.group.position.x - o.mesh.position.x;
    const dz = p.group.position.z - o.mesh.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = o;
    }
  }

  if (closest && closestDistance < 4) {
    const pushDirection = new THREE.Vector3(
      p.group.position.x - closest.mesh.position.x,
      0,
      p.group.position.z - closest.mesh.position.z
    );

    if (pushDirection.lengthSq() > 0.001) {
      pushDirection.normalize();

      closest.mesh.position.x += pushDirection.x * 2;
      closest.mesh.position.z += pushDirection.z * 2;
    }

    flashBanner(`${p.name.toUpperCase()} PUSH!`);
  }
}


// ============================================================
// OBSTACLE COLLISION (position-based, shared by every player)
// ============================================================

function checkObstacleCollision(nextPos) {
  const playerRadius = 0.72;

  const airborne = nextPos.y > 2.0;

  for (const o of obstacles) {
    if (o.removed) continue;

    if (o.type === 'log') {
      if (airborne) continue;

      const dx = nextPos.x - o.mesh.position.x;
      const dz = nextPos.z - o.mesh.position.z;

      const angle = -o.mesh.rotation.y;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const localX = dx * cos - dz * sin;
      const localZ = dx * sin + dz * cos;

      const halfLength = o.length * 0.5;
      const halfWidth = 0.86;

      const closestX = THREE.MathUtils.clamp(localX, -halfLength, halfLength);
      const closestZ = THREE.MathUtils.clamp(localZ, -halfWidth, halfWidth);

      const distanceX = localX - closestX;
      const distanceZ = localZ - closestZ;

      const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;

      if (distanceSquared < playerRadius * playerRadius) {
        return true;
      }

      continue;
    }

    if (o.type === 'rock') {
      if (airborne) continue;

      const dx = nextPos.x - o.mesh.position.x;
      const dz = nextPos.z - o.mesh.position.z;

      const distance = Math.hypot(dx, dz);

      const collisionRadius = playerRadius + o.radius * 0.78;

      if (distance < collisionRadius) {
        return true;
      }
    }
  }

  return false;
}


// ============================================================
// MOVEMENT (per player)
// ============================================================

function updatePlayerMovement(p, dt) {
  if (p.eliminated) return;

  const movement = new THREE.Vector3();
  let running = false;
  let jumpPressed = false;

  if (p.isHost) {
    if (keys.KeyW) movement.z -= 1;
    if (keys.KeyS) movement.z += 1;
    if (keys.KeyA) movement.x -= 1;
    if (keys.KeyD) movement.x += 1;

    running = keys.ShiftLeft || keys.ShiftRight;
    jumpPressed = !!keys.Space && p.onGround;
  } else {
    movement.x = p.moveX;
    movement.z = p.moveY;

    running = p.running;
  }

  if (movement.lengthSq() > 0) {
    // Only force-normalize the host's digital WASD input (always
    // length 1 or sqrt(2)). The phone joystick is analog — forcing
    // it to length 1 regardless of how far the stick was actually
    // pushed is what made every tilt feel maxed-out, and made tiny
    // near-center residue near release still count as full speed.
    if (p.isHost) {
      movement.normalize();
    } else if (movement.length() > 1) {
      movement.normalize();
    }
  }

  const speed = running ? 12 : 6.5;

  const dx = movement.x * speed * dt;
  const dz = movement.z * speed * dt;

  // Sub-steps: prevent sprinting from jumping through an obstacle
  // between two frames.
  const distance = Math.hypot(dx, dz);
  const steps = Math.max(1, Math.ceil(distance / 0.16));

  const stepX = dx / steps;
  const stepZ = dz / steps;

  for (let i = 0; i < steps; i++) {
    const next = p.group.position.clone();
    next.x += stepX;
    next.z += stepZ;

    if (!checkObstacleCollision(next)) {
      p.group.position.copy(next);
    } else {
      break;
    }
  }

  // JUMP (host only here — phone jump is applied instantly by the
  // JUMP network handler below, since it's a discrete button press
  // rather than a held key)
  if (jumpPressed) {
    p.velocityY = 8.5;
    p.onGround = false;
  }

  p.velocityY -= 22 * dt;
  p.group.position.y += p.velocityY * dt;

  if (p.group.position.y <= 1.05) {
    p.group.position.y = 1.05;
    p.velocityY = 0;
    p.onGround = true;
  }

  // Arena boundaries
  p.group.position.x = THREE.MathUtils.clamp(p.group.position.x, -49, 49);
  p.group.position.z = THREE.MathUtils.clamp(
    p.group.position.z,
    FINISH_Z - 8,
    START_Z + 3
  );

  // Face movement direction
  if (movement.lengthSq() > 0) {
    const desired = Math.atan2(movement.x, movement.z);

    p.group.rotation.y = THREE.MathUtils.lerp(
      p.group.rotation.y,
      desired,
      1 - Math.pow(0.0001, dt)
    );
  }

  // Red light detection — only once the round has actually started
  if (gameStarted && phase === 'RED' && !p.safeZoneReached && !p.finished) {
    const displacement = p.group.position.distanceTo(p.lastPosition);

    if (displacement > 0.012) {
      p.redFreezeGrace -= dt;

      if (p.redFreezeGrace <= 0) {
        eliminate(p, 'ELIMINATED');
        return;
      }
    } else {
      p.redFreezeGrace = Math.min(p.redFreezeGrace + dt * 0.5, 0.12);
    }
  } else {
    p.redFreezeGrace = 0.12;
  }

  p.lastPosition.copy(p.group.position);

  // Finish
  if (gameStarted && !p.finished && p.group.position.z <= FINISH_Z) {
    p.safeZoneReached = true;
    win(p);
  }

  // Leaving the safe zone during RED
  if (
    gameStarted &&
    p.safeZoneReached &&
    !p.finished &&
    phase === 'RED' &&
    p.group.position.z > FINISH_Z + 0.55
  ) {
    eliminate(p, 'LEFT THE SAFE ZONE');
  }
}

function updateAllPlayers(dt) {
  for (const p of players.values()) {
    updatePlayerMovement(p, dt);
  }
}


// ============================================================
// GAME UPDATE (shared / global)
// ============================================================

function updateGame(dt) {
  if (gameStarted) {
    gameTime -= dt;

    if (gameTime <= 0) {
      gameTime = 0;

      for (const p of players.values()) {
        if (!p.finished) {
          eliminate(p, 'TIME UP');
        }
      }
    }

    phaseTimer -= dt;

    if (phaseTimer <= 0) {
      setPhase(phase === 'GREEN' ? 'RED' : 'GREEN');
    }

    // Smooth doll rotation
    const current = headPivot.rotation.y;

    let difference = headTargetRotation - current;

    while (difference > Math.PI) difference -= Math.PI * 2;
    while (difference < -Math.PI) difference += Math.PI * 2;

    headPivot.rotation.y += difference * Math.min(1, headRotationSpeed * dt);
  }

  // Laser cleanup
  if (laserTimer > 0) {
    laserTimer -= dt;

    if (laserTimer <= 0 && laserLine) {
      scene.remove(laserLine);
      laserLine.geometry.dispose();
      laserLine.material.dispose();
      laserLine = null;
    }
  }

  // HUD
  if (gameStarted) {
    const mins = Math.floor(gameTime / 60);
    const secs = Math.floor(gameTime % 60);

    timerEl.textContent =
      `TIME ${mins}:${String(secs).padStart(2, '0')}   •   ${Math.max(0, phaseTimer).toFixed(1)}s`;

    hintEl.textContent = phase === 'GREEN' ? 'MOVE' : 'FREEZE';
  } else {
    timerEl.textContent = '';
  }

  updatePlayerListUI();
}


// ============================================================
// CAMERA
//
// Instead of a fixed-distance chase camera (which only really
// works for one player), this frames a box around every active
// player and pulls back / rises automatically as they spread out,
// so everyone stays visible whether there's 1 player or 12.
// ============================================================

function getCameraFrame() {
  const active = [...players.values()].filter((p) => !p.eliminated && !p.finished);
  const pool = active.length > 0 ? active : [...players.values()];

  if (pool.length === 0) {
    return { center: new THREE.Vector3(0, 1.05, START_Z), spread: 6 };
  }

  const center = new THREE.Vector3();
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const p of pool) {
    const pos = p.group.position;
    center.add(pos);
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minZ = Math.min(minZ, pos.z);
    maxZ = Math.max(maxZ, pos.z);
  }

  center.divideScalar(pool.length);

  const spread = Math.max(maxX - minX, maxZ - minZ, 6);

  return { center, spread };
}

function updateCamera(dt) {
  const { center, spread } = getCameraFrame();

  // As players spread further apart, back the camera up and raise
  // it, so the whole group stays in frame instead of just one player.
  const distance = THREE.MathUtils.clamp(11 + spread * 0.9, 12, 60);
  const height = THREE.MathUtils.clamp(5.5 + spread * 0.55, 5.5, 34);

  const desired = new THREE.Vector3(
    center.x * 0.35,
    center.y + height,
    center.z + distance
  );

  camera.position.lerp(desired, 1 - Math.pow(0.0006, dt));

  const lookAt = new THREE.Vector3(
    center.x,
    center.y + 1.2,
    center.z - Math.min(spread * 0.3, 20) - 14
  );

  camera.lookAt(lookAt);
}


// ============================================================
// PHONE CONTROLLER → PLAYERS
//
// Every phone that presses "Join" gets its own player, spawned
// with the name they typed. The first phone to join becomes
// "Player 1", the second "Player 2", and so on — the host
// (keyboard) player is separate and always present for testing.
// ============================================================

onNetworkMessage('JOIN', (message) => {

  if (!message.playerId || !message.player) {
    return;
  }

  // Don't create the same player twice
  if (players.has(message.playerId)) {
    return;
  }

  const player = spawnPlayer(
    message.playerId,
    message.player
  );

  console.log(
    `🎮 ${message.player} joined`
  );

  // Tell that phone which player number it received
  const phonePlayers = [
    ...players.values()
  ].filter((p) => !p.isHost);

  sendNetworkMessage({
    type: 'ASSIGNED',
    playerId: message.playerId,
    playerNumber: phonePlayers.length
  });

});


onNetworkMessage('READY', (message) => {

  console.log(
    `✅ ${message.player} is READY`
  );

});


onNetworkMessage('MOVE', (message) => {

  const player = players.get(
    message.playerId
  );

  if (!player) {
    console.warn(
      '[phone] MOVE received but player not found:',
      message.playerId
    );
    return;
  }

  player.moveX =
    Number(message.x) || 0;

  player.moveY =
    Number(message.y) || 0;

});


onNetworkMessage('RUN', (message) => {

  const player = players.get(
    message.playerId
  );

  if (!player) {
    return;
  }

  player.running = true;

  console.log(
    `🏃 ${player.name} RUN`
  );

});


onNetworkMessage('RUN_RELEASE', (message) => {

  const player = players.get(
    message.playerId
  );

  if (!player) {
    return;
  }

  player.running = false;

  console.log(
    `🛑 ${player.name} STOP RUN`
  );

});


onNetworkMessage('JUMP', (message) => {

  const player = players.get(
    message.playerId
  );

  if (
    !player ||
    player.eliminated ||
    player.finished
  ) {
    return;
  }

  // Only jump if standing on the ground
  if (player.onGround) {

    player.velocityY = 8.5;

    player.onGround = false;

    console.log(
      `🦘 ${player.name} JUMP`
    );

  }

});


onNetworkMessage('PUSH', (message) => {

  const player = players.get(
    message.playerId
  );

  if (
    !player ||
    player.eliminated ||
    player.finished
  ) {
    return;
  }

  console.log(
    `👊 ${player.name} PUSH`
  );

  pushNearestObstacle(
    player
  );

});


onNetworkMessage('ABILITY', (message) => {

  const player = players.get(
    message.playerId
  );

  if (
    !player ||
    player.eliminated ||
    player.finished
  ) {
    return;
  }

  console.log(
    `⚡ ${player.name} ABILITY`
  );

  useAbility(
    player
  );

});

// ============================================================
// START
// ============================================================

connectNetworking();

// The keyboard-controlled local player, always available for
// testing without a phone connected.
spawnPlayer(HOST_ID, 'YOU');

updatePlayerListUI();

// Note: setPhase('GREEN') and the round timer no longer start
// automatically here — they only begin once the host clicks the
// START GAME button (see startGame() above).


// ============================================================
// LOOP
// ============================================================

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  updateAllPlayers(dt);
  updateGame(dt);
  updateCamera(dt);

  renderer.render(scene, camera);
}

animate();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});