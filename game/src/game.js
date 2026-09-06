import * as THREE from 'three';

// ============================================================
// LAST ONE STANDING
// RED LIGHT / GREEN LIGHT - REVIEW BUILD
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87cbed);

scene.fog = new THREE.Fog(
  0x87cbed,
  65,
  220
);


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

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
  1.05;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

document.body.appendChild(
  renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

const hemisphere =
  new THREE.HemisphereLight(
    0xbfeaff,
    0x49362a,
    1.7
  );

scene.add(hemisphere);


const sun =
  new THREE.DirectionalLight(
    0xfff2d0,
    3.5
  );

sun.position.set(
  -50,
  80,
  30
);

sun.castShadow = true;

sun.shadow.mapSize.set(
  2048,
  2048
);

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

const grassMat =
  new THREE.MeshStandardMaterial({
    color: 0x4e8a43,
    roughness: 1
  });


const grassDarkMat =
  new THREE.MeshStandardMaterial({
    color: 0x315e32,
    roughness: 1
  });


const dirtMat =
  new THREE.MeshStandardMaterial({
    color: 0x705039,
    roughness: 1
  });


const rockMat =
  new THREE.MeshStandardMaterial({
    color: 0x686b68,
    roughness: 0.95
  });


const rockDarkMat =
  new THREE.MeshStandardMaterial({
    color: 0x4e514f,
    roughness: 1
  });


const woodMat =
  new THREE.MeshStandardMaterial({
    color: 0x714322,
    roughness: 0.9
  });


const woodEndMat =
  new THREE.MeshStandardMaterial({
    color: 0x3a2415,
    roughness: 1
  });


const whiteMat =
  new THREE.MeshStandardMaterial({
    color: 0xf1eee7,
    roughness: 0.75
  });


const skinMat =
  new THREE.MeshStandardMaterial({
    color: 0xdca17c,
    roughness: 0.8
  });


const blackMat =
  new THREE.MeshStandardMaterial({
    color: 0x111214,
    roughness: 0.65
  });


// ============================================================
// ARENA
// ============================================================

const ARENA_WIDTH = 110;

const START_Z = 10;

const FINISH_Z = -143;


const ground =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      ARENA_WIDTH,
      175,
      50,
      70
    ),
    grassMat
  );

ground.rotation.x =
  -Math.PI / 2;

ground.position.set(
  0,
  -0.1,
  -67
);

ground.receiveShadow = true;

scene.add(ground);


// ============================================================
// DIRT BANKS
// ============================================================

for (const x of [-62, 62]) {

  const bank =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        12,
        7,
        175
      ),
      dirtMat
    );

  bank.position.set(
    x,
    2.8,
    -67
  );

  bank.receiveShadow = true;

  scene.add(bank);
}


// ============================================================
// FENCES
// ============================================================

function createFence(x) {

  const fence =
    new THREE.Group();


  for (
    let z = -150;
    z <= 15;
    z += 8
  ) {

    const post =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.35,
          2.7,
          0.35
        ),
        woodEndMat
      );

    post.position.set(
      0,
      1.35,
      z
    );

    post.castShadow = true;

    fence.add(post);
  }


  const rail1 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.25,
        0.25,
        168
      ),
      woodMat
    );

  rail1.position.set(
    0,
    2.1,
    -67
  );

  fence.add(rail1);


  const rail2 =
    rail1.clone();

  rail2.position.y =
    1.0;

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

  const bladeGeo =
    new THREE.ConeGeometry(
      0.045,
      0.45,
      3
    );


  const bladeMat =
    new THREE.MeshStandardMaterial({
      color: 0x326a32,
      roughness: 1
    });


  const count = 5000;


  const grass =
    new THREE.InstancedMesh(
      bladeGeo,
      bladeMat,
      count
    );


  const dummy =
    new THREE.Object3D();


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const x =
      THREE.MathUtils.randFloat(
        -50,
        50
      );


    const z =
      THREE.MathUtils.randFloat(
        -150,
        12
      );


    dummy.position.set(
      x,
      0.18,
      z
    );


    const scale =
      THREE.MathUtils.randFloat(
        0.7,
        1.8
      );


    dummy.scale.set(
      scale,
      scale,
      scale
    );


    dummy.rotation.y =
      Math.random() *
      Math.PI *
      2;


    dummy.updateMatrix();

    grass.setMatrixAt(
      i,
      dummy.matrix
    );
  }


  grass.instanceMatrix
    .needsUpdate = true;


  scene.add(grass);
}


createGrass();


// ============================================================
// TREES
// ============================================================

function createTree(
  x,
  z,
  scale = 1
) {

  const tree =
    new THREE.Group();


  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.5,
        0.75,
        5,
        12
      ),
      woodMat
    );


  trunk.position.y =
    2.5;


  trunk.castShadow = true;


  tree.add(trunk);


  const foliageMat =
    new THREE.MeshStandardMaterial({
      color: 0x285d30,
      roughness: 1
    });


  const foliage1 =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        3.4,
        6,
        10
      ),
      foliageMat
    );


  foliage1.position.y =
    6;


  foliage1.castShadow = true;


  tree.add(foliage1);


  const foliage2 =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        2.7,
        5,
        10
      ),
      foliageMat
    );


  foliage2.position.y =
    9;


  foliage2.castShadow = true;


  tree.add(foliage2);


  tree.position.set(
    x,
    0,
    z
  );


  tree.scale.setScalar(
    scale
  );


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

  createTree(
    t[0],
    t[1],
    t[2]
  );
}


// ============================================================
// OBSTACLES
// ============================================================

const obstacles = [];


function addRock(
  x,
  z,
  sx,
  sy,
  sz
) {

  const geometry =
    new THREE.DodecahedronGeometry(
      1,
      1
    );


  const material =
    Math.random() > 0.35
      ? rockMat
      : rockDarkMat;


  const rock =
    new THREE.Mesh(
      geometry,
      material
    );


  rock.position.set(
    x,
    sy * 0.55,
    z
  );


  rock.scale.set(
    sx,
    sy,
    sz
  );


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

    radius:
      Math.max(
        sx,
        sz
      ) * 0.9,

    removed: false
  });
}


function addLog(
  x,
  z,
  length = 8,
  rotation = 0
) {

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.7,
        0.85,
        length,
        16
      ),
      woodMat
    );


  body.rotation.z =
    Math.PI / 2;


  body.castShadow = true;

  body.receiveShadow = true;


  group.add(body);


  const end1 =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        0.76,
        16
      ),
      woodEndMat
    );


  end1.rotation.y =
    Math.PI / 2;


  end1.position.x =
    length / 2 + 0.01;


  group.add(end1);


  const end2 =
    end1.clone();


  end2.position.x =
    -length / 2 - 0.01;


  group.add(end2);


  group.position.set(
    x,
    0.82,
    z
  );


  group.rotation.y =
    rotation;


  scene.add(group);


  obstacles.push({

    mesh: group,

    type: 'log',

    length: length,

    width: 1.7,

    radius:
      length * 0.52,

    removed: false
  });
}


// ============================================================
// OBSTACLE FIELD
// ============================================================

addRock(
  -15,
  -19,
  3.0,
  2.0,
  2.4
);

addRock(
  13,
  -22,
  2.2,
  1.6,
  2.8
);

addLog(
  0,
  -30,
  10,
  0.10
);


addRock(
  24,
  -41,
  3.2,
  2.1,
  2.3
);

addLog(
  -20,
  -43,
  8,
  -0.35
);

addRock(
  -2,
  -49,
  2.1,
  1.5,
  2.0
);


addLog(
  17,
  -61,
  11,
  0.55
);

addRock(
  -20,
  -64,
  3.0,
  2.2,
  2.5
);

addRock(
  2,
  -69,
  2.0,
  1.7,
  2.2
);


addRock(
  25,
  -80,
  3.1,
  2.0,
  2.6
);

addLog(
  -17,
  -82,
  9,
  -0.25
);

addRock(
  4,
  -89,
  2.6,
  1.8,
  2.0
);


addLog(
  16,
  -99,
  11,
  0.40
);

addRock(
  -23,
  -103,
  3.2,
  2.2,
  2.7
);

addRock(
  0,
  -108,
  2.0,
  1.5,
  2.2
);


addRock(
  23,
  -119,
  3.0,
  2.1,
  2.5
);

addLog(
  -15,
  -121,
  10,
  -0.5
);

addRock(
  5,
  -128,
  2.5,
  1.9,
  2.4
);


addLog(
  0,
  -136,
  8,
  0.15
);


// ============================================================
// FINISH
// ============================================================

const finishMat =
  new THREE.MeshStandardMaterial({
    color: 0xe9e2d4,
    roughness: 0.8
  });


const finish =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      100,
      0.08,
      1.5
    ),
    finishMat
  );


finish.position.set(
  0,
  0.05,
  FINISH_Z
);


finish.receiveShadow = true;


scene.add(finish);


// ============================================================
// SAFE ZONE
// ============================================================

const safeZone =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      100,
      0.02,
      12
    ),
    new THREE.MeshStandardMaterial({
      color: 0x607f55,
      roughness: 1,
      transparent: true,
      opacity: 0.55
    })
  );


safeZone.position.set(
  0,
  0.02,
  FINISH_Z - 5
);


scene.add(safeZone);


// ============================================================
// DOLL
// ============================================================

const doll =
  new THREE.Group();


doll.position.set(
  0,
  0,
  FINISH_Z - 9
);


scene.add(doll);


// Feet

for (
  const x of [-1.2, 1.2]
) {

  const foot =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2,
        0.65,
        3.2
      ),
      blackMat
    );


  foot.position.set(
    x,
    0.35,
    0.2
  );


  foot.castShadow = true;


  doll.add(foot);
}


// Legs

for (
  const x of [-1.05, 1.05]
) {

  const leg =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.65,
        0.72,
        4.3,
        20
      ),
      whiteMat
    );


  leg.position.set(
    x,
    2.5,
    0
  );


  leg.castShadow = true;


  doll.add(leg);
}


// Dress

const dress =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      2.5,
      5,
      6.2,
      32
    ),
    new THREE.MeshStandardMaterial({
      color: 0xd9a43b,
      roughness: 0.75
    })
  );


dress.position.y =
  7;


dress.castShadow = true;


doll.add(dress);


// Waist

const waist =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      2.1,
      2.3,
      1,
      24
    ),
    whiteMat
  );


waist.position.y =
  10;


doll.add(waist);


// Neck

const neck =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.9,
      1,
      1.8,
      20
    ),
    skinMat
  );


neck.position.y =
  11.3;


doll.add(neck);


// Arms

for (
  const x of [-3, 3]
) {

  const arm =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.5,
        0.6,
        5.5,
        18
      ),
      whiteMat
    );


  arm.position.set(
    x,
    8.2,
    0
  );


  arm.rotation.z =
    x < 0
      ? 0.15
      : -0.15;


  arm.castShadow = true;


  doll.add(arm);


  const hand =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.7,
        16,
        12
      ),
      skinMat
    );


  hand.position.set(
    x * 1.04,
    5.5,
    0
  );


  doll.add(hand);
}


// ============================================================
// DOLL HEAD
// ============================================================

const headPivot =
  new THREE.Group();


headPivot.position.y =
  12.7;


doll.add(headPivot);


const dollHead =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      2.35,
      32,
      24
    ),
    skinMat
  );


dollHead.scale.set(
  0.88,
  1.08,
  0.88
);


dollHead.castShadow = true;


headPivot.add(
  dollHead
);


// Hair

const hair =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      2.42,
      32,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58
    ),
    blackMat
  );


hair.position.y =
  0.55;


headPivot.add(
  hair
);


// Eyes

const eyeWhiteMat =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35
  });


const eyeBlackMat =
  new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.3
  });


const laserEyeMat =
  new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xff0000,
    emissiveIntensity: 0
  });


for (
  const x of [-0.72, 0.72]
) {

  const eye =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.36,
        18,
        12
      ),
      eyeWhiteMat
    );


  eye.position.set(
    x,
    0.25,
    -2.08
  );


  headPivot.add(
    eye
  );


  const pupil =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.17,
        14,
        10
      ),
      eyeBlackMat
    );


  pupil.position.set(
    x,
    0.24,
    -2.38
  );


  headPivot.add(
    pupil
  );


  const laserEye =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.09,
        12,
        8
      ),
      laserEyeMat
    );


  laserEye.position.set(
    x,
    0.25,
    -2.5
  );


  headPivot.add(
    laserEye
  );
}


// Mouth

const mouth =
  new THREE.Mesh(
    new THREE.TorusGeometry(
      0.55,
      0.09,
      8,
      20,
      Math.PI
    ),
    blackMat
  );


mouth.position.set(
  0,
  -0.62,
  -2.18
);


mouth.rotation.x =
  Math.PI / 2;


headPivot.add(
  mouth
);


// ============================================================
// LIGHT ORBS
// ============================================================

const redLight =
  new THREE.PointLight(
    0xff2222,
    0,
    30
  );


redLight.position.set(
  -2.2,
  17,
  0
);


doll.add(
  redLight
);


const greenLight =
  new THREE.PointLight(
    0x35ff65,
    0,
    30
  );


greenLight.position.set(
  2.2,
  17,
  0
);


doll.add(
  greenLight
);


function createLightOrb(
  color
) {

  return new THREE.Mesh(
    new THREE.SphereGeometry(
      0.55,
      20,
      16
    ),
    new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 2
    })
  );
}


const redOrb =
  createLightOrb(
    0xff2020
  );


const greenOrb =
  createLightOrb(
    0x42ff72
  );


redOrb.position.set(
  -2.2,
  17,
  0
);


greenOrb.position.set(
  2.2,
  17,
  0
);


doll.add(
  redOrb,
  greenOrb
);


// ============================================================
// PLAYER
// ============================================================

const player =
  new THREE.Group();


player.position.set(
  0,
  1.05,
  START_Z
);


scene.add(player);


const playerBody =
  new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.68,
      1.35,
      8,
      16
    ),
    new THREE.MeshStandardMaterial({
      color: 0xb52020,
      roughness: 0.65
    })
  );


playerBody.castShadow = true;


player.add(
  playerBody
);


const playerHead =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.58,
      20,
      16
    ),
    skinMat
  );


playerHead.position.y =
  1.3;


playerHead.castShadow = true;


player.add(
  playerHead
);


const playerHair =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.61,
      18,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    ),
    blackMat
  );


playerHair.position.y =
  1.55;


player.add(
  playerHair
);


// ============================================================
// PLAYER NAME
// ============================================================

function makeTextSprite(
  text
) {

  const canvas =
    document.createElement(
      'canvas'
    );


  canvas.width = 512;
  canvas.height = 128;


  const ctx =
    canvas.getContext(
      '2d'
    );


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.fillStyle =
    'rgba(5,8,12,0.78)';


  ctx.beginPath();


  ctx.roundRect(
    20,
    20,
    472,
    88,
    22
  );


  ctx.fill();


  ctx.font =
    'bold 46px Arial';


  ctx.textAlign =
    'center';


  ctx.textBaseline =
    'middle';


  ctx.fillStyle =
    '#ffffff';


  ctx.fillText(
    text,
    256,
    64
  );


  const texture =
    new THREE.CanvasTexture(
      canvas
    );


  texture.colorSpace =
    THREE.SRGBColorSpace;


  const sprite =
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );


  sprite.scale.set(
    3.4,
    0.85,
    1
  );


  return sprite;
}


const nameSprite =
  makeTextSprite(
    'PLAYER 1'
  );


nameSprite.position.set(
  0,
  3.1,
  0
);


player.add(
  nameSprite
);


// ============================================================
// GAME STATE
// ============================================================

const clock =
  new THREE.Clock();


const keys = {};


let phase = 'GREEN';


let gameTime = 90;


let phaseTimer = 2.8;

let phaseDuration = 2.8;


let headTargetRotation = 0;

let headRotationSpeed = 7;


let eliminated = false;

let finished = false;

let safeZoneReached = false;


let velocityY = 0;

let onGround = true;


let lastPlayerPosition =
  player.position.clone();


let abilityUsed = false;


let redFreezeGrace = 0.12;


// ============================================================
// INPUT
// ============================================================

window.addEventListener(
  'keydown',
  (event) => {

    keys[event.code] =
      true;


    if (
      event.code === 'KeyQ' &&
      !event.repeat &&
      !abilityUsed &&
      !eliminated &&
      !finished
    ) {

      useAbility();
    }


    if (
      event.code === 'KeyE' &&
      !event.repeat
    ) {

      pushNearestObstacle();
    }
  }
);


window.addEventListener(
  'keyup',
  (event) => {

    keys[event.code] =
      false;
  }
);


// ============================================================
// HUD
// ============================================================

const hud =
  document.createElement(
    'div'
  );


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


document.body.appendChild(
  hud
);


const stateEl =
  document.createElement(
    'div'
  );


stateEl.style.cssText = `
font-size:46px;
font-weight:900;
letter-spacing:4px;
`;


hud.appendChild(
  stateEl
);


const timerEl =
  document.createElement(
    'div'
  );


timerEl.style.cssText = `
font-size:23px;
font-weight:800;
margin-top:3px;
`;


hud.appendChild(
  timerEl
);


const hintEl =
  document.createElement(
    'div'
  );


hintEl.style.cssText = `
font-size:15px;
font-weight:700;
margin-top:6px;
`;


hud.appendChild(
  hintEl
);


// ============================================================
// CONTROLS
// ============================================================

const controls =
  document.createElement(
    'div'
  );


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


document.body.appendChild(
  controls
);


// ============================================================
// BANNER
// ============================================================

const banner =
  document.createElement(
    'div'
  );


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


document.body.appendChild(
  banner
);


function flashBanner(
  text
) {

  banner.textContent =
    text;


  banner.style.opacity =
    '1';


  setTimeout(
    () => {

      banner.style.opacity =
        '0';

    },
    800
  );
}


// ============================================================
// RED / GREEN
// ============================================================

function setPhase(
  next
) {

  phase = next;


  if (
    phase === 'GREEN'
  ) {

    phaseDuration =
      THREE.MathUtils.randFloat(
        2.0,
        4.6
      );


    phaseTimer =
      phaseDuration;


    headTargetRotation =
      0;


    greenLight.intensity =
      6;


    redLight.intensity =
      0;


    greenOrb.material
      .emissiveIntensity = 4;


    redOrb.material
      .emissiveIntensity = 0.1;


    stateEl.textContent =
      'GREEN';


    stateEl.style.color =
      '#52ff78';


    hintEl.textContent =
      'RUN — GET TO THE FINISH';


    flashBanner(
      'RUN!'
    );

  } else {

    phaseDuration =
      THREE.MathUtils.randFloat(
        1.15,
        2.8
      );


    phaseTimer =
      phaseDuration;


    headTargetRotation =
      Math.PI;


    greenLight.intensity =
      0;


    redLight.intensity =
      6;


    greenOrb.material
      .emissiveIntensity = 0.1;


    redOrb.material
      .emissiveIntensity = 4;


    stateEl.textContent =
      'RED';


    stateEl.style.color =
      '#ff3030';


    hintEl.textContent =
      'FREEZE';


    flashBanner(
      'FREEZE!'
    );
  }
}


// ============================================================
// LASER
// ============================================================

let laserLine = null;

let laserTimer = 0;


function fireLaser(
  target
) {

  if (
    laserLine
  ) {

    scene.remove(
      laserLine
    );


    laserLine.geometry
      .dispose();


    laserLine.material
      .dispose();


    laserLine = null;
  }


  const start =
    new THREE.Vector3();


  headPivot.getWorldPosition(
    start
  );


  start.y +=
    0.2;


  const end =
    target.clone();


  end.y +=
    1;


  const direction =
    end.clone().sub(
      start
    );


  const length =
    direction.length();


  const geometry =
    new THREE.CylinderGeometry(
      0.1,
      0.23,
      length,
      12
    );


  const material =
    new THREE.MeshBasicMaterial({
      color: 0xff1111,
      transparent: true,
      opacity: 0.95
    });


  laserLine =
    new THREE.Mesh(
      geometry,
      material
    );


  laserLine.position
    .copy(start)
    .add(end)
    .multiplyScalar(
      0.5
    );


  laserLine.quaternion
    .setFromUnitVectors(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      direction.normalize()
    );


  scene.add(
    laserLine
  );


  laserTimer =
    0.25;
}


// ============================================================
// ELIMINATION
// ============================================================

function eliminate(
  reason
) {

  if (
    eliminated
  ) {
    return;
  }


  eliminated =
    true;


  fireLaser(
    player.position
  );


  flashBanner(
    reason
  );


  stateEl.textContent =
    'ELIMINATED';


  stateEl.style.color =
    '#ff3030';


  hintEl.textContent =
    'YOU ARE OUT';


  playerBody.material
    .color.set(
      0x303030
    );


  playerHead.visible =
    false;


  playerHair.visible =
    false;
}


// ============================================================
// WIN
// ============================================================

function win() {

  if (
    finished ||
    eliminated
  ) {
    return;
  }


  finished =
    true;


  safeZoneReached =
    true;


  flashBanner(
    'SURVIVED!'
  );


  stateEl.textContent =
    'SURVIVED';


  stateEl.style.color =
    '#6dff8a';


  hintEl.textContent =
    'SAFE ZONE — YOU SURVIVED';
}


// ============================================================
// ABILITY
// ============================================================

function useAbility() {

  abilityUsed =
    true;


  let closest =
    null;


  let closestDistance =
    Infinity;


  for (
    const o of obstacles
  ) {

    if (
      o.removed
    ) {
      continue;
    }


    const distance =
      player.position
        .distanceTo(
          o.mesh.position
        );


    if (
      distance <
      closestDistance
    ) {

      closestDistance =
        distance;


      closest =
        o;
    }
  }


  if (
    closest &&
    closestDistance < 14
  ) {

    closest.removed =
      true;


    closest.mesh.visible =
      false;


    flashBanner(
      'OBSTACLE REMOVED'
    );

  } else {

    flashBanner(
      'NO OBSTACLE NEARBY'
    );
  }
}


// ============================================================
// PUSH
// ============================================================

function pushNearestObstacle() {

  if (
    eliminated ||
    finished
  ) {
    return;
  }


  let closest =
    null;


  let closestDistance =
    Infinity;


  for (
    const o of obstacles
  ) {

    if (
      o.removed
    ) {
      continue;
    }


    const dx =
      player.position.x -
      o.mesh.position.x;


    const dz =
      player.position.z -
      o.mesh.position.z;


    const distance =
      Math.hypot(
        dx,
        dz
      );


    if (
      distance <
      closestDistance
    ) {

      closestDistance =
        distance;


      closest =
        o;
    }
  }


  if (
    closest &&
    closestDistance < 4
  ) {

    const pushDirection =
      new THREE.Vector3(
        player.position.x -
          closest.mesh.position.x,
        0,
        player.position.z -
          closest.mesh.position.z
      );


    if (
      pushDirection.lengthSq() >
      0.001
    ) {

      pushDirection.normalize();


      closest.mesh.position.x +=
        pushDirection.x * 2;


      closest.mesh.position.z +=
        pushDirection.z * 2;
    }


    flashBanner(
      'PUSH!'
    );
  }
}


// ============================================================
// PROPER OBSTACLE COLLISION
// ============================================================

function checkObstacleCollision(
  nextPos
) {

  const playerRadius =
    0.72;


  // If the player is high enough in the air,
  // they are allowed to jump over the obstacles.

  const airborne =
    nextPos.y > 2.0;


  for (
    const o of obstacles
  ) {

    if (
      o.removed
    ) {
      continue;
    }


    // ======================================================
    // LOG COLLISION
    // ======================================================

    if (
      o.type === 'log'
    ) {

      if (
        airborne
      ) {
        continue;
      }


      const dx =
        nextPos.x -
        o.mesh.position.x;


      const dz =
        nextPos.z -
        o.mesh.position.z;


      // Convert player position into
      // the log's local rotated coordinate system.

      const angle =
        -o.mesh.rotation.y;


      const cos =
        Math.cos(angle);


      const sin =
        Math.sin(angle);


      const localX =
        dx * cos -
        dz * sin;


      const localZ =
        dx * sin +
        dz * cos;


      const halfLength =
        o.length * 0.5;


      // Log radius + player's radius

      const halfWidth =
        0.86;


      // Closest point on the log rectangle

      const closestX =
        THREE.MathUtils.clamp(
          localX,
          -halfLength,
          halfLength
        );


      const closestZ =
        THREE.MathUtils.clamp(
          localZ,
          -halfWidth,
          halfWidth
        );


      const distanceX =
        localX -
        closestX;


      const distanceZ =
        localZ -
        closestZ;


      const distanceSquared =
        distanceX * distanceX +
        distanceZ * distanceZ;


      if (
        distanceSquared <
        playerRadius *
        playerRadius
      ) {

        return true;
      }


      continue;
    }


    // ======================================================
    // ROCK COLLISION
    // ======================================================

    if (
      o.type === 'rock'
    ) {

      if (
        airborne
      ) {
        continue;
      }


      const dx =
        nextPos.x -
        o.mesh.position.x;


      const dz =
        nextPos.z -
        o.mesh.position.z;


      const distance =
        Math.hypot(
          dx,
          dz
        );


      // Conservative collision radius.

      const collisionRadius =
        playerRadius +
        o.radius * 0.78;


      if (
        distance <
        collisionRadius
      ) {

        return true;
      }
    }
  }


  return false;
}


// ============================================================
// MOVEMENT
// ============================================================

function updateMovement(
  dt
) {

  if (
    eliminated
  ) {
    return;
  }


  const movement =
    new THREE.Vector3();


  if (
    keys.KeyW
  ) {

    movement.z -= 1;
  }


  if (
    keys.KeyS
  ) {

    movement.z += 1;
  }


  if (
    keys.KeyA
  ) {

    movement.x -= 1;
  }


  if (
    keys.KeyD
  ) {

    movement.x += 1;
  }


  if (
    movement.lengthSq() >
    0
  ) {

    movement.normalize();
  }


  const running =
    keys.ShiftLeft ||
    keys.ShiftRight;


  const speed =
    running
      ? 12
      : 6.5;


  const dx =
    movement.x *
    speed *
    dt;


  const dz =
    movement.z *
    speed *
    dt;


  // ========================================================
  // SUB-STEPS
  //
  // Prevent sprinting from jumping through an obstacle
  // between two frames.
  // ========================================================

  const distance =
    Math.hypot(
      dx,
      dz
    );


  const steps =
    Math.max(
      1,
      Math.ceil(
        distance / 0.16
      )
    );


  const stepX =
    dx / steps;


  const stepZ =
    dz / steps;


  for (
    let i = 0;
    i < steps;
    i++
  ) {

    const next =
      player.position.clone();


    next.x +=
      stepX;


    next.z +=
      stepZ;


    if (
      !checkObstacleCollision(
        next
      )
    ) {

      player.position.copy(
        next
      );

    } else {

      // Stop against obstacle.

      break;
    }
  }


  // ========================================================
  // JUMP
  // ========================================================

  if (
    keys.Space &&
    onGround
  ) {

    velocityY =
      8.5;


    onGround =
      false;
  }


  velocityY -=
    22 * dt;


  player.position.y +=
    velocityY * dt;


  if (
    player.position.y <=
    1.05
  ) {

    player.position.y =
      1.05;


    velocityY =
      0;


    onGround =
      true;
  }


  // ========================================================
  // ARENA BOUNDARIES
  // ========================================================

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -49,
      49
    );


  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      FINISH_Z - 8,
      START_Z + 3
    );


  // ========================================================
  // FACE MOVEMENT
  // ========================================================

  if (
    movement.lengthSq() >
    0
  ) {

    const desired =
      Math.atan2(
        movement.x,
        movement.z
      );


    player.rotation.y =
      THREE.MathUtils.lerp(
        player.rotation.y,
        desired,
        1 -
        Math.pow(
          0.0001,
          dt
        )
      );
  }


  // ========================================================
  // RED LIGHT DETECTION
  // ========================================================

  if (
    phase === 'RED' &&
    !safeZoneReached
  ) {

    const displacement =
      player.position
        .distanceTo(
          lastPlayerPosition
        );


    if (
      displacement >
      0.012
    ) {

      redFreezeGrace -=
        dt;


      if (
        redFreezeGrace <=
        0
      ) {

        eliminate(
          'ELIMINATED'
        );


        return;
      }

    } else {

      redFreezeGrace =
        Math.min(
          redFreezeGrace +
          dt * 0.5,
          0.12
        );
    }

  } else {

    redFreezeGrace =
      0.12;
  }


  lastPlayerPosition.copy(
    player.position
  );


  // ========================================================
  // FINISH
  // ========================================================

  if (
    player.position.z <=
    FINISH_Z
  ) {

    safeZoneReached =
      true;


    win();
  }


  // ========================================================
  // LEAVING SAFE ZONE DURING RED
  // ========================================================

  if (
    safeZoneReached &&
    phase === 'RED' &&
    player.position.z >
      FINISH_Z + 0.55
  ) {

    eliminate(
      'YOU LEFT THE SAFE ZONE'
    );
  }
}


// ============================================================
// GAME UPDATE
// ============================================================

function updateGame(
  dt
) {

  if (
    !eliminated &&
    !finished
  ) {

    gameTime -=
      dt;


    if (
      gameTime <=
      0
    ) {

      gameTime =
        0;


      eliminate(
        'TIME UP'
      );
    }


    phaseTimer -=
      dt;


    if (
      phaseTimer <=
      0
    ) {

      setPhase(
        phase === 'GREEN'
          ? 'RED'
          : 'GREEN'
      );
    }


    // Smooth doll rotation

    const current =
      headPivot.rotation.y;


    let difference =
      headTargetRotation -
      current;


    while (
      difference >
      Math.PI
    ) {

      difference -=
        Math.PI * 2;
    }


    while (
      difference <
      -Math.PI
    ) {

      difference +=
        Math.PI * 2;
    }


    headPivot.rotation.y +=
      difference *
      Math.min(
        1,
        headRotationSpeed *
        dt
      );
  }


  // ========================================================
  // LASER CLEANUP
  // ========================================================

  if (
    laserTimer > 0
  ) {

    laserTimer -=
      dt;


    if (
      laserTimer <=
      0 &&
      laserLine
    ) {

      scene.remove(
        laserLine
      );


      laserLine.geometry
        .dispose();


      laserLine.material
        .dispose();


      laserLine =
        null;
    }
  }


  // ========================================================
  // HUD
  // ========================================================

  const mins =
    Math.floor(
      gameTime / 60
    );


  const secs =
    Math.floor(
      gameTime % 60
    );


  timerEl.textContent =
    `TIME ${mins}:${String(secs).padStart(2, '0')}   •   ${Math.max(0, phaseTimer).toFixed(1)}s`;


  if (
    !finished &&
    !eliminated
  ) {

    const progress =
      THREE.MathUtils.clamp(
        (START_Z -
          player.position.z) /
        (START_Z -
          FINISH_Z),
        0,
        1
      );


    hintEl.textContent =
      `${phase === 'GREEN' ? 'MOVE' : 'FREEZE'}   •   ${Math.round(progress * 100)}% TO FINISH`;
  }
}


// ============================================================
// CAMERA
// ============================================================

function updateCamera(
  dt
) {

  const desired =
    new THREE.Vector3(
      player.position.x *
        0.45,
      player.position.y +
        5.4,
      player.position.z +
        11.5
    );


  camera.position.lerp(
    desired,
    1 -
    Math.pow(
      0.0005,
      dt
    )
  );


  const lookAt =
    new THREE.Vector3(
      player.position.x,
      player.position.y +
        1.4,
      player.position.z -
        18
    );


  camera.lookAt(
    lookAt
  );
}


// ============================================================
// START
// ============================================================

setPhase(
  'GREEN'
);


flashBanner(
  'GET READY'
);


// ============================================================
// LOOP
// ============================================================

function animate() {

  requestAnimationFrame(
    animate
  );


  const dt =
    Math.min(
      clock.getDelta(),
      0.05
    );


  updateMovement(
    dt
  );


  updateGame(
    dt
  );


  updateCamera(
    dt
  );


  renderer.render(
    scene,
    camera
  );
}


animate();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);