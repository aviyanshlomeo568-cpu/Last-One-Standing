import * as THREE from 'three';
import { Player } from './player.js';
import { connectNetworking, onNetworkMessage, sendNetworkMessage } from '../../src/networking.js';

// ============================================================
// KING OF THE HILL — Steps 1-6 (+ fall-off-platform death)
// Step 6: on win, show a full-screen "X WON" overlay, freeze all
// players in place, then auto-restart the round after a countdown.
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071012);
scene.fog = new THREE.Fog(0x071012, 48, 150);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 32, 34);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// Cool ambient fill so nothing goes fully black in shadow.
const hemisphere = new THREE.HemisphereLight(0x315d66, 0x050609, 1.05);
scene.add(hemisphere);

// Reliable main key light — directional (no distance falloff),
// so players stay lit wherever they stand on the platform.
const key = new THREE.DirectionalLight(0xdfefff, 3.0);
key.position.set(-20, 45, 25);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -25;
key.shadow.camera.right = 25;
key.shadow.camera.top = 25;
key.shadow.camera.bottom = -25;
key.shadow.camera.near = 1;
key.shadow.camera.far = 120;
scene.add(key);

// Pink rim/accent light from behind.
const rim = new THREE.DirectionalLight(0xff2d78, 2.2);
rim.position.set(30, 20, -35);
scene.add(rim);

// Additional colored point lights for cinematic depth.
// These are intentionally subtle so the players remain readable.
const pinkFill = new THREE.PointLight(0xff2d78, 8, 70, 2);
pinkFill.position.set(28, 10, -22);
scene.add(pinkFill);

const cyanFill = new THREE.PointLight(0x2de3ff, 7, 75, 2);
cyanFill.position.set(-30, 12, -28);
scene.add(cyanFill);

const cyanTop = new THREE.PointLight(0x2de3ff, 3, 45, 2);
cyanTop.position.set(0, 28, 5);
scene.add(cyanTop);

const platformMat = new THREE.MeshStandardMaterial({
  color: 0x121519,
  roughness: 0.78,
  metalness: 0.12
});

const platformEdgeMat = new THREE.MeshBasicMaterial({
  color: 0xff2d78
});

const hillMat = new THREE.MeshStandardMaterial({
  color: 0xff2d78,
  emissive: 0xff2d78,
  emissiveIntensity: 0.9,
  roughness: 0.5,
  transparent: true,
  opacity: 0.9
});

const floorMat = new THREE.MeshStandardMaterial({
  color: 0x040607,
  roughness: 1
});

const PLATFORM_RADIUS = 20;
const HILL_RADIUS = 7;

const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, 2, 48),
  platformMat
);
platform.position.y = -1;
platform.receiveShadow = true;
scene.add(platform);

// Neon pink trim ring around the platform edge.
const edgeRing = new THREE.Mesh(
  new THREE.RingGeometry(PLATFORM_RADIUS - 0.6, PLATFORM_RADIUS, 48),
  platformEdgeMat
);
edgeRing.rotation.x = -Math.PI / 2;
edgeRing.position.y = 0.01;
scene.add(edgeRing);

// ------------------------------------------------------------
// Hill zone — a modest raised mound instead of a flat circle.
// Profile goes from the base (radius = HILL_RADIUS, height 0) up
// to a rounded peak at the center (height ~1.0). Kept low on
// purpose: players' feet stay at a fixed y, so a taller mound
// would just mean more visible clipping near the center.
// ------------------------------------------------------------
const moundProfile = [
  new THREE.Vector2(HILL_RADIUS, 0),
  new THREE.Vector2(HILL_RADIUS * 0.91, 0.12),
  new THREE.Vector2(HILL_RADIUS * 0.77, 0.35),
  new THREE.Vector2(HILL_RADIUS * 0.57, 0.62),
  new THREE.Vector2(HILL_RADIUS * 0.34, 0.85),
  new THREE.Vector2(HILL_RADIUS * 0.14, 0.97),
  new THREE.Vector2(0, 1.0)
];

const hillMound = new THREE.Mesh(
  new THREE.LatheGeometry(moundProfile, 48),
  hillMat
);
hillMound.castShadow = true;
hillMound.receiveShadow = true;
scene.add(hillMound);

// Thin ring marking the exact scoring boundary at the mound's base.
const hillBoundary = new THREE.Mesh(
  new THREE.RingGeometry(HILL_RADIUS - 0.15, HILL_RADIUS, 48),
  platformEdgeMat
);
hillBoundary.rotation.x = -Math.PI / 2;
hillBoundary.position.y = 0.02;
scene.add(hillBoundary);

const groundFar = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  floorMat
);
groundFar.rotation.x = -Math.PI / 2;
groundFar.position.y = -18;
groundFar.receiveShadow = true;
scene.add(groundFar);

// Glowing sci-fi grid on the far floor, beyond the platform.
const grid = new THREE.GridHelper(300, 60, 0xff2d78, 0x0f5a66);
grid.position.y = -17.9;
grid.material.transparent = true;
grid.material.opacity = 0.32;
scene.add(grid);

// ------------------------------------------------------------
// CINEMATIC BACKDROP
// Large, subtle geometric structures behind the arena.
// These add depth without changing the playable area.
// ------------------------------------------------------------

const backdropPinkMat = new THREE.MeshBasicMaterial({
  color: 0xff2d78,
  transparent: true,
  opacity: 0.13,
  side: THREE.DoubleSide,
  depthWrite: false
});

const backdropCyanMat = new THREE.MeshBasicMaterial({
  color: 0x2de3ff,
  transparent: true,
  opacity: 0.10,
  side: THREE.DoubleSide,
  depthWrite: false
});

const backdropDarkMat = new THREE.MeshStandardMaterial({
  color: 0x071214,
  emissive: 0x061417,
  emissiveIntensity: 0.35,
  roughness: 0.95,
  metalness: 0.05
});

// Giant vertical neon rings in the distance.
const backdropRing1 = new THREE.Mesh(
  new THREE.TorusGeometry(20, 0.18, 12, 96),
  backdropPinkMat
);
backdropRing1.position.set(0, 21, -62);
scene.add(backdropRing1);

const backdropRing2 = new THREE.Mesh(
  new THREE.TorusGeometry(15.5, 0.10, 10, 96),
  backdropCyanMat
);
backdropRing2.position.set(0, 21, -61.5);
scene.add(backdropRing2);

const backdropRing3 = new THREE.Mesh(
  new THREE.TorusGeometry(26, 0.08, 10, 96),
  backdropCyanMat
);
backdropRing3.position.set(0, 21, -62.5);
scene.add(backdropRing3);

// Tall architectural light pillars.
const pillarPositions = [
  [-28, 13, -48],
  [-20, 9, -58],
  [20, 9, -58],
  [28, 13, -48]
];

pillarPositions.forEach(([x, height, z], index) => {
  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, height * 2, 1.1),
    index % 2 === 0 ? backdropPinkMat : backdropCyanMat
  );

  pillar.position.set(x, height, z);
  scene.add(pillar);

  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, height * 2.1, 0.18),
    index % 2 === 0 ? backdropCyanMat : backdropPinkMat
  );

  inner.position.set(x, height, z + 0.04);
  scene.add(inner);
});

// Dark distant wall to give the lighting something to fall onto.
const backdropWall = new THREE.Mesh(
  new THREE.PlaneGeometry(110, 70),
  backdropDarkMat
);
backdropWall.position.set(0, 25, -70);
scene.add(backdropWall);

// Thin horizontal neon bars across the distant wall.
for (let i = 0; i < 5; i++) {
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(90, 0.08, 0.08),
    i % 2 === 0 ? backdropPinkMat : backdropCyanMat
  );

  bar.position.set(0, 8 + i * 8, -69.5);
  scene.add(bar);
}

// ------------------------------------------------------------
// Squid Game shape motifs (○ △ □) laid flat around the platform
// edge, evenly spaced. Pure geometry, no textures.
// ------------------------------------------------------------
const motifMat = new THREE.MeshBasicMaterial({
  color: 0xff2d78,
  transparent: true,
  opacity: 0.55
});

function makeTriangleShape(size) {
  const shape = new THREE.Shape();
  shape.moveTo(0, size);
  shape.lineTo(-size * 0.87, -size * 0.5);
  shape.lineTo(size * 0.87, -size * 0.5);
  shape.closePath();
  return shape;
}

const motifGeometries = [
  new THREE.RingGeometry(0.55, 0.75, 32),
  new THREE.ShapeGeometry(makeTriangleShape(0.85)),
  new THREE.PlaneGeometry(1.2, 1.2)
];

const MOTIF_COUNT = 9;
for (let i = 0; i < MOTIF_COUNT; i++) {
  const geo = motifGeometries[i % motifGeometries.length];
  const motif = new THREE.Mesh(geo, motifMat);
  const angle = (i / MOTIF_COUNT) * Math.PI * 2;
  const radius = PLATFORM_RADIUS - 2.2;
  motif.position.set(
    Math.cos(angle) * radius,
    0.03,
    Math.sin(angle) * radius
  );
  motif.rotation.x = -Math.PI / 2;
  motif.rotation.z = angle;
  scene.add(motif);
}

// ------------------------------------------------------------
// Drifting starfield / particle field for background atmosphere.
// ------------------------------------------------------------
const STAR_COUNT = 500;
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);
const pink = new THREE.Color(0xff2d78);
const cyan = new THREE.Color(0x2de3ff);

for (let i = 0; i < STAR_COUNT; i++) {
  const radius = 60 + Math.random() * 150;
  const angle = Math.random() * Math.PI * 2;
  const height = -10 + Math.random() * 120;

  starPositions[i * 3] = Math.cos(angle) * radius;
  starPositions[i * 3 + 1] = height;
  starPositions[i * 3 + 2] = Math.sin(angle) * radius;

  const c = Math.random() > 0.5 ? pink : cyan;
  starColors[i * 3] = c.r;
  starColors[i * 3 + 1] = c.g;
  starColors[i * 3 + 2] = c.b;
}

const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute(
  'position',
  new THREE.BufferAttribute(starPositions, 3)
);
starGeo.setAttribute(
  'color',
  new THREE.BufferAttribute(starColors, 3)
);

const starMat = new THREE.PointsMaterial({
  size: 1.4,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true
});

const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

const PLAYER_COLORS = [0xb52020, 0x2060b5, 0x20b555, 0xb5a220];
const players = {};
let nextPlayerNumber = 1;
let winner = null;

function nextSpawnPosition(index) {
  const ringRadius = 10;
  const angle = (index / PLAYER_COLORS.length) * Math.PI * 2;

  return new THREE.Vector3(
    Math.cos(angle) * ringRadius,
    1.05,
    Math.sin(angle) * ringRadius
  );
}

const PUSH_RADIUS = 5;
const PUSH_FORCE = 16;

function handlePush(pusherName) {
  const pusher = players[pusherName];
  if (!pusher || pusher.eliminated) return;

  pusher.swingBat();

  for (const otherName in players) {
    if (otherName === pusherName) continue;

    const other = players[otherName];
    if (other.eliminated) continue;

    const dx = other.mesh.position.x - pusher.mesh.position.x;
    const dz = other.mesh.position.z - pusher.mesh.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance > 0 && distance <= PUSH_RADIUS) {
      const strength = PUSH_FORCE * (1 - distance / PUSH_RADIUS);
      const dirX = dx / distance;
      const dirZ = dz / distance;

      other.applyKnockback(dirX, dirZ, strength);
    }
  }
}

// ============================================================
// STEP 6: WIN OVERLAY / AUTO-RESTART
// ============================================================
const RESTART_DELAY = 10;
let winnerElapsed = 0;

const winnerOverlay = document.getElementById('winner-overlay');
const winnerNameEl = document.getElementById('winner-name');
const winnerSubEl = document.getElementById('winner-sub');

function showWinnerOverlay(name) {
  winnerNameEl.textContent = `${name} WON`;
  winnerSubEl.textContent = `New round in ${RESTART_DELAY}s`;
  winnerOverlay.classList.add('visible');
}

function hideWinnerOverlay() {
  winnerOverlay.classList.remove('visible');
}

function resetRound() {
  const names = Object.keys(players);

  names.forEach((name, index) => {
    players[name].resetRound(nextSpawnPosition(index));
  });

  winner = null;
  winnerElapsed = 0;
  hideWinnerOverlay();
}

// ============================================================
// STEP 5: HILL SCORING / WIN LOGIC
// ============================================================
const HILL_WIN_SECONDS = 20;

function updateHillScoring(dt) {
  if (winner) return;

  // Find who's standing in the hill zone right now.
  const occupants = [];

  for (const name in players) {
    const p = players[name];

    if (p.eliminated) continue;

    const pos = p.mesh.position;
    const distanceFromCenter = Math.hypot(pos.x, pos.z);

    if (distanceFromCenter <= HILL_RADIUS) {
      occupants.push(p);
    }
  }

  // Only a SOLE occupant is "uncontested" and gains progress.
  // 0 occupants (empty) or 2+ occupants (contested) = nobody gains,
  // and nobody's progress resets - it just stops climbing.
  if (occupants.length === 1) {
    const holder = occupants[0];

    holder.score = Math.min(HILL_WIN_SECONDS, holder.score + dt);

    if (holder.score >= HILL_WIN_SECONDS) {
      winner = holder;

      console.log(`[game] ${holder.name} WINS!`);
      sendNetworkMessage({
        type: 'WIN',
        player: holder.name
      });

      // Freeze everyone in place the instant the round ends.
      for (const n in players) {
        players[n].setMove(0, 0);
      }

      showWinnerOverlay(holder.name);
    }
  }

  // Update every player's floating label with their progress.
  // Eliminated (fallen) players are skipped - they're hidden and
  // shouldn't have their countdown label kept alive underneath them.
  for (const name in players) {
    const p = players[name];
    if (p.eliminated) continue;

    if (winner === p) {
      p.setLabel('WINNER');
    } else {
      const secondsLeft = Math.max(
        0,
        HILL_WIN_SECONDS - p.score
      );

      p.setLabel(secondsLeft.toFixed(1) + 's');
    }
  }
}

// ============================================================
// NETWORKING
// ============================================================
onNetworkMessage('JOIN', (payload) => {
  const name = payload.player;
  if (!name) return;

  if (!players[name]) {
    const index = Object.keys(players).length;
    const colorHex = PLAYER_COLORS[index % PLAYER_COLORS.length];
    const spawnPos = nextSpawnPosition(index);

    const p = new Player(scene, {
      name,
      colorHex,
      spawnPos,
      // Ground only exists over the platform - once a player's
      // x/z crosses this radius, gravity is free to carry them
      // down past the platform edge and off into the void.
      groundRadius: PLATFORM_RADIUS
    });

    p.playerNumber = nextPlayerNumber;
    nextPlayerNumber += 1;
    players[name] = p;

    console.log(
      `[game] ${name} joined as Player ${p.playerNumber}`
    );
  }

  sendNetworkMessage({
    type: 'PLAYER_ASSIGNED',
    player: name,
    playerNumber: players[name].playerNumber
  });
});

onNetworkMessage('READY', (payload) => {
  const p = players[payload.player];

  if (p) {
    p.ready = true;
    console.log(`[game] ${payload.player} is ready`);
  }
});

onNetworkMessage('MOVE', (payload) => {
  if (winner) return;

  const p = players[payload.player];

  if (p) {
    p.setMove(
      payload.x ?? 0,
      payload.y ?? 0
    );
  }
});

onNetworkMessage('PUSH', (payload) => {
  if (winner) return;
  handlePush(payload.player);
});

onNetworkMessage('RUN', (payload) => {
  if (winner) return;

  const p = players[payload.player];

  if (p) {
    p.setRunning(true);
  }
});

onNetworkMessage('RUN_RELEASE', (payload) => {
  if (winner) return;

  const p = players[payload.player];

  if (p) {
    p.setRunning(false);
  }
});

onNetworkMessage('JUMP', (payload) => {
  if (winner) return;

  const p = players[payload.player];

  if (p) {
    p.jump();
  }
});

onNetworkMessage('ABILITY', (payload) => {
  if (winner) return;

  const p = players[payload.player];

  if (p) {
    p.tryDodge();
  }
});

connectNetworking();

// ============================================================
// LOOP
// ============================================================
const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  // Gentle pulse on the hill glow.
  const pulse =
    0.75 + Math.sin(elapsed * 2.2) * 0.15;

  hillMat.emissiveIntensity = pulse;

  // Very subtle breathing effect on the distant lights.
  pinkFill.intensity =
    7.5 + Math.sin(elapsed * 0.9) * 1.2;

  cyanFill.intensity =
    6.5 + Math.sin(elapsed * 0.75 + 1.5) * 1.0;

  // Slow drift on the background starfield.
  starField.rotation.y += dt * 0.015;

  // Barely perceptible motion on the giant backdrop rings.
  backdropRing1.rotation.z =
    Math.sin(elapsed * 0.18) * 0.025;

  backdropRing2.rotation.z =
    -Math.sin(elapsed * 0.22) * 0.035;

  backdropRing3.rotation.z =
    Math.sin(elapsed * 0.12) * 0.018;

  // Update every player (movement, gravity, falling/death, bat
  // swing animation). Falling off the platform edge and dying is
  // handled entirely inside Player.update() now - there is no
  // more "snap back to center" safety net here.
  for (const name in players) {
    players[name].update(dt);
  }

  updateHillScoring(dt);

  if (winner) {
    winnerElapsed += dt;

    const secondsLeft = Math.max(
      0,
      RESTART_DELAY - winnerElapsed
    );

    winnerSubEl.textContent =
      `New round in ${Math.ceil(secondsLeft)}s`;

    if (winnerElapsed >= RESTART_DELAY) {
      resetRound();
    }
  }

  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});