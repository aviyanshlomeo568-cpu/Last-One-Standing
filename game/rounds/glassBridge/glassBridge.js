import * as THREE from "three";
import {
    connectNetworking,
    onNetworkMessage,
    sendNetworkMessage
} from "../../src/networking.js";

// ============================================================
// LAST ONE STANDING
// GLASS BRIDGE — MULTIPLAYER BUILD
// ============================================================


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050611);

scene.fog = new THREE.FogExp2(
    0x080914,
    0.009
);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    700
);

camera.position.set(0, 29, 32);


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

renderer.toneMappingExposure = 1.15;

document.body.appendChild(
    renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

const ambient = new THREE.HemisphereLight(
    0x738dff,
    0x050509,
    1.4
);

scene.add(ambient);


const moonLight =
    new THREE.DirectionalLight(
        0xb9c9ff,
        3.0
    );

moonLight.position.set(
    -40,
    80,
    30
);

moonLight.castShadow = true;

moonLight.shadow.mapSize.set(
    2048,
    2048
);

scene.add(moonLight);


// Red atmospheric lights

const redLight1 =
    new THREE.PointLight(
        0xff163d,
        18,
        80
    );

redLight1.position.set(
    -18,
    25,
    -35
);

scene.add(redLight1);


const redLight2 =
    new THREE.PointLight(
        0xff163d,
        12,
        100
    );

redLight2.position.set(
    18,
    20,
    -90
);

scene.add(redLight2);


// ============================================================
// MATERIALS
// ============================================================

const glassSafeMaterial =
    new THREE.MeshPhysicalMaterial({
        color: 0x8bdcff,
        transparent: true,
        opacity: 0.32,
        roughness: 0.03,
        metalness: 0,
        transmission: 0.35,
        thickness: 0.2
    });


const glassMaterial =
    new THREE.MeshPhysicalMaterial({
        color: 0xc7efff,
        transparent: true,
        opacity: 0.28,
        roughness: 0.04,
        metalness: 0,
        transmission: 0.25,
        thickness: 0.2
    });


const glassFrameMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x242933,
        roughness: 0.65,
        metalness: 0.8
    });


const metalMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x11141b,
        roughness: 0.45,
        metalness: 0.9
    });


const redMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb8141d,
        roughness: 0.65
    });


const skinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xdca17c,
        roughness: 0.8
    });


const blackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x050507,
        roughness: 0.7
    });


// ============================================================
// BRIDGE SETTINGS
// ============================================================

const ROWS = 12;

const ROW_DISTANCE = 7;

const BRIDGE_WIDTH = 9;

const PANEL_WIDTH = 3.8;

const PANEL_DEPTH = 5;

const BRIDGE_HEIGHT = 22;

const START_Z = 12;

const FINISH_Z =
    START_Z -
    ROWS * ROW_DISTANCE;


// ============================================================
// GAME STATE (shared / round-wide)
// ============================================================

let gameStarted = false;

let gameTime = 90;


// ============================================================
// SAFE PATH
// ============================================================

const safePath = [];

for (let i = 0; i < ROWS; i++) {

    safePath.push(
        Math.random() < 0.5
            ? "left"
            : "right"
    );
}

console.log(
    "Safe path:",
    safePath
);


// ============================================================
// BRIDGE
// ============================================================

const bridge =
    new THREE.Group();

scene.add(bridge);


// ============================================================
// CREATE GLASS PANEL
// ============================================================

function createGlassPanel(row, side) {

    const group =
        new THREE.Group();


    const panel =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                PANEL_WIDTH,
                0.18,
                PANEL_DEPTH
            ),
            glassMaterial.clone()
        );

    panel.castShadow = true;
    panel.receiveShadow = true;


    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                PANEL_WIDTH + 0.25,
                0.22,
                PANEL_DEPTH + 0.25
            ),
            glassFrameMaterial
        );

    frame.position.y = -0.12;

    frame.castShadow = true;


    group.add(frame);
    group.add(panel);


    const x =
        side === "left"
            ? -2.25
            : 2.25;


    const z =
        START_Z -
        row * ROW_DISTANCE;


    group.position.set(
        x,
        BRIDGE_HEIGHT,
        z
    );


    group.userData = {
        row,
        side,
        panel,
        broken: false,
        safe: safePath[row] === side
    };


    bridge.add(group);

    return group;
}


// ============================================================
// BUILD GLASS BRIDGE
// ============================================================

const glassPanels = [];

for (let row = 0; row < ROWS; row++) {

    glassPanels.push({

        left:
            createGlassPanel(
                row,
                "left"
            ),

        right:
            createGlassPanel(
                row,
                "right"
            )

    });
}


// ============================================================
// SUPPORT BEAMS
// ============================================================

for (let i = 0; i < ROWS; i++) {

    const z =
        START_Z -
        i * ROW_DISTANCE;


    for (const x of [-4.7, 4.7]) {

        const beam =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    0.35,
                    ROW_DISTANCE
                ),
                metalMaterial
            );


        beam.position.set(
            x,
            BRIDGE_HEIGHT - 0.35,
            z - ROW_DISTANCE / 2
        );


        beam.castShadow = true;

        bridge.add(beam);
    }
}


// ============================================================
// SIDE RAILINGS
// ============================================================

function createRail(x) {

    const rail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.25,
                2.2,
                ROWS * ROW_DISTANCE
            ),
            metalMaterial
        );


    rail.position.set(
        x,
        BRIDGE_HEIGHT + 1,
        (FINISH_Z + START_Z) / 2
    );


    rail.castShadow = true;

    bridge.add(rail);


    // glowing red strip

    const glow =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.06,
                0.08,
                ROWS * ROW_DISTANCE
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff163d
            })
        );


    glow.position.set(
        x > 0
            ? x - 0.15
            : x + 0.15,

        BRIDGE_HEIGHT + 1.4,

        (FINISH_Z + START_Z) / 2
    );


    bridge.add(glow);
}


createRail(-5.2);
createRail(5.2);


// ============================================================
// VERTICAL SUPPORTS
// ============================================================

for (let i = 0; i <= ROWS; i++) {

    const z =
        START_Z -
        i * ROW_DISTANCE;


    for (const x of [-5.2, 5.2]) {

        const support =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.15,
                    0.15,
                    2.2,
                    12
                ),
                metalMaterial
            );


        support.position.set(
            x,
            BRIDGE_HEIGHT + 1,
            z
        );


        bridge.add(support);
    }
}


// ============================================================
// START PLATFORM
// ============================================================

const startPlatform =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            12,
            1,
            12
        ),
        metalMaterial
    );

startPlatform.position.set(
    0,
    BRIDGE_HEIGHT - 0.55,
    START_Z + 7
);

startPlatform.castShadow = true;
startPlatform.receiveShadow = true;

scene.add(startPlatform);


// ============================================================
// FINISH PLATFORM
// ============================================================

const finishPlatform =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            13,
            1,
            12
        ),
        metalMaterial
    );

finishPlatform.position.set(
    0,
    BRIDGE_HEIGHT - 0.55,
    FINISH_Z - 5
);

finishPlatform.castShadow = true;
finishPlatform.receiveShadow = true;

scene.add(finishPlatform);


// Finish glowing strips

for (const x of [-5, 5]) {

    const strip =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                0.08,
                10
            ),
            new THREE.MeshBasicMaterial({
                color: 0x64ff9a
            })
        );

    strip.position.set(
        x,
        BRIDGE_HEIGHT + 0.02,
        FINISH_Z - 5
    );

    scene.add(strip);
}


// ============================================================
// PLAYER NAME TAG
// ============================================================

function makeTextSprite(text) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle =
        "rgba(5,8,12,0.78)";

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
        "bold 46px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        text,
        256,
        64
    );

    const texture =
        new THREE.CanvasTexture(canvas);

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


// ============================================================
// PLAYERS
//
// Every player — the local keyboard "host" player and every
// phone controller that joins — is an entry in the `players`
// Map, keyed by a stable id. Panels themselves stay shared/
// global (once broken, they're broken for everyone), but each
// player tracks their own position, velocity, jump state, and
// pass/fail outcome independently.
// ============================================================

const HOST_ID = "host-local-player";

const PLAYER_COLORS = [
    0xb8141d, 0x2060b5, 0x20b558, 0xb5a020,
    0x8020b5, 0x20b5ac, 0xb5206e, 0x6eb520
];

let colorIndex = 0;

function nextPlayerColor() {
    const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
    colorIndex++;
    return color;
}

let spawnCounter = 0;

function nextSpawnOffset() {
    const slot = spawnCounter % 8;
    spawnCounter++;
    // Spread players across the start platform, which is 12 wide.
    return THREE.MathUtils.clamp((slot - 3.5) * 1.3, -5, 5);
}

function createPlayerVisual(name, color) {

    const group = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.65, 1.3, 8, 16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.65 })
    );
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.58, 20, 16),
        skinMaterial
    );
    head.position.y = 1.3;
    head.castShadow = true;
    group.add(head);

    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.61, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
        blackMaterial
    );
    hair.position.y = 1.55;
    group.add(hair);

    const nameSprite = makeTextSprite(name.slice(0, 16).toUpperCase());
    nameSprite.position.set(0, 3.0, 0);
    group.add(nameSprite);

    return { group, body, head, hair, nameSprite };
}

const players = new Map();

function spawnPlayer(id, name) {

    if (players.has(id)) {
        return players.get(id);
    }

    const visual = createPlayerVisual(name, nextPlayerColor());

    visual.group.position.set(
        nextSpawnOffset(),
        BRIDGE_HEIGHT + 1.3,
        START_Z + 6
    );

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

        // Phone controller input
        moveX: 0,
        moveY: 0,
        running: false,

        // Physics (mirrors the constants below, per player)
        velocityY: 0,
        onGround: true,
        falling: false,
        movementLocked: false,
        currentVelocity: new THREE.Vector3(),
        jumpBufferTime: 0,
        coyoteTime: 0,

        eliminated: false,
        finished: false
    };

    players.set(id, state);

    updatePlayerListUI();

    return state;
}


// ============================================================
// PLAYER PHYSICS (shared constants)
// ============================================================

const playerHeight = 2.6;

const gravity = 30;

const jumpPower = 11;

const walkSpeed = 7;

const runSpeed = 11;

// How fast the player accelerates toward / decelerates away from
// target speed, in units of "fraction closed per second". Higher
// = snappier, lower = floatier. This replaces the old instant
// on/off velocity so movement doesn't feel stiff.
const ACCELERATION = 18;

const DECELERATION = 22;

// Jump buffering: if the player presses Space (or the phone jump
// button) slightly before landing, remember it for a few frames
// so the jump still fires.
const JUMP_BUFFER_WINDOW = 0.15;

// Coyote time: allow a jump for a brief moment after walking off
// a ledge, matching what players expect from a "fair" platformer.
const COYOTE_WINDOW = 0.12;


// ============================================================
// INPUT (keyboard controls the local "host" player, for testing
// without a phone — same as any phone-controlled player)
// ============================================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;


        if (event.code === "Space") {

            const hostPlayer = players.get(HOST_ID);

            if (hostPlayer) {
                hostPlayer.jumpBufferTime =
                    JUMP_BUFFER_WINDOW;
            }
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;
    }
);


// ============================================================
// ROW Z-RANGE CHECK
// ============================================================

// True when `pz` falls within the depth-span of ANY row of glass
// panels (whether or not the player is actually standing on one
// of the two panels in that row). Used to tell the difference
// between "no panel because you're in the safe gap between rows"
// (solid ground) and "no panel because you're in the open middle
// notch between the left/right panels of an active row" (a hole).

function isWithinAnyRowZRange(pz) {

    for (let row = 0; row < ROWS; row++) {

        const rowZ =
            START_Z -
            row * ROW_DISTANCE;


        if (
            Math.abs(pz - rowZ) <=
            PANEL_DEPTH / 2
        ) {

            return true;
        }
    }


    return false;
}


// ============================================================
// FIND PANEL UNDER A POSITION
// ============================================================

function getPanelUnderPosition(px, pz) {

    for (const row of glassPanels) {

        for (const side of ["left", "right"]) {

            const panel =
                row[side];


            const centerX =
                panel.position.x;


            const centerZ =
                panel.position.z;


            const insideX =
                Math.abs(
                    px - centerX
                ) <=
                PANEL_WIDTH / 2;


            const insideZ =
                Math.abs(
                    pz - centerZ
                ) <=
                PANEL_DEPTH / 2;


            if (
                insideX &&
                insideZ
            ) {

                return panel;
            }
        }
    }


    return null;
}


// ============================================================
// BREAK GLASS
// ============================================================

function breakGlass(panel) {

    if (
        !panel ||
        panel.userData.broken
    ) {
        return;
    }


    panel.userData.broken = true;


    const glass =
        panel.userData.panel;


    glass.material =
        glass.material.clone();


    glass.material.opacity =
        0.65;


    // Crack effect

    const crack =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                PANEL_WIDTH * 0.8,
                PANEL_DEPTH * 0.8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.65,
                wireframe: true
            })
        );


    crack.rotation.x =
        -Math.PI / 2;


    crack.position.y =
        0.12;


    panel.add(crack);


    // Fall

    setTimeout(() => {

        panel.position.y -= 4;

        panel.rotation.x += 0.45;

        panel.rotation.z +=
            THREE.MathUtils.randFloat(
                -0.2,
                0.2
            );

    }, 120);
}


// ============================================================
// MARK SAFE GLASS
// ============================================================

function markSafeGlass(panel) {

    const glass =
        panel.userData.panel;


    glass.material =
        glassSafeMaterial.clone();


    glass.material.emissive =
        new THREE.Color(
            0x113344
        );


    glass.material.emissiveIntensity =
        0.5;
}


// ============================================================
// FALL (per player)
// ============================================================

function startFall(p) {

    if (p.falling) {
        return;
    }


    p.falling = true;

    p.velocityY = -3;

    flashBanner(
        `${p.name.toUpperCase()} — GLASS BREAK!`
    );
}


// ============================================================
// MOVEMENT (per player)
// ============================================================

function updateMovement(p, dt) {

    if (
        !gameStarted ||
        p.eliminated ||
        p.finished ||
        p.falling ||
        p.movementLocked
    ) {
        return;
    }


    // ------------------------------------------------------
    // Horizontal input -> smoothed velocity
    // ------------------------------------------------------

    const inputDirection =
        new THREE.Vector3();

    let running = false;


    if (p.isHost) {

        if (
            keys["KeyW"] ||
            keys["ArrowUp"]
        ) {
            inputDirection.z -= 1;
        }


        if (
            keys["KeyS"] ||
            keys["ArrowDown"]
        ) {
            inputDirection.z += 1;
        }


        if (
            keys["KeyA"] ||
            keys["ArrowLeft"]
        ) {
            inputDirection.x -= 1;
        }


        if (
            keys["KeyD"] ||
            keys["ArrowRight"]
        ) {
            inputDirection.x += 1;
        }


        running =
            !!(keys["ShiftLeft"] ||
            keys["ShiftRight"]);

    } else {

        // Phone joystick — already analog, x/y in roughly [-1, 1].
        inputDirection.x = p.moveX;
        inputDirection.z = p.moveY;

        running = p.running;
    }


    const hasInput =
        inputDirection.lengthSq() > 0.0009;


    if (hasInput) {

        // Only force-normalize the host's digital WASD input
        // (which is always length 1 or sqrt(2)). The phone
        // joystick is analog — normalizing it away would throw
        // out how far the stick is actually pushed, so only clamp
        // it if it somehow exceeds length 1.
        if (p.isHost) {

            inputDirection.normalize();

        } else if (
            inputDirection.length() > 1
        ) {

            inputDirection.normalize();
        }
    }


    const speed =
        running
            ? runSpeed
            : walkSpeed;


    const targetVelocity =
        hasInput
            ? inputDirection.multiplyScalar(speed)
            : new THREE.Vector3(0, 0, 0);


    // Smoothly approach the target velocity instead of snapping
    // to it, using a different rate for speeding up vs slowing
    // down so stopping still feels responsive.

    const rate =
        hasInput
            ? ACCELERATION
            : DECELERATION;


    const lerpFactor =
        1 - Math.exp(-rate * dt);


    p.currentVelocity.lerp(
        targetVelocity,
        lerpFactor
    );


    // Snap out tiny residual velocity so the player doesn't
    // drift forever due to floating point noise.

    if (
        !hasInput &&
        p.currentVelocity.lengthSq() < 0.0004
    ) {

        p.currentVelocity.set(0, 0, 0);
    }


    p.group.position.x +=
        p.currentVelocity.x * dt;


    p.group.position.z +=
        p.currentVelocity.z * dt;


    if (
        p.currentVelocity.lengthSq() > 0.01
    ) {

        // Face movement direction

        const targetRotation =
            Math.atan2(
                p.currentVelocity.x,
                p.currentVelocity.z
            );


        p.group.rotation.y =
            THREE.MathUtils.lerp(
                p.group.rotation.y,
                targetRotation,
                0.2
            );
    }


    // Keep player inside bridge

    p.group.position.x =
        THREE.MathUtils.clamp(
            p.group.position.x,
            -4.45,
            4.45
        );


    // ------------------------------------------------------
    // Ground detection
    // ------------------------------------------------------

    const panel =
        getPanelUnderPosition(
            p.group.position.x,
            p.group.position.z
        );


    const bridgeTop =
        BRIDGE_HEIGHT +
        1.3;


    // The ground is solid on the start platform, the finish
    // platform, and the small gaps between rows. It is NOT solid
    // over a panel that has already broken, and it is NOT solid
    // in the open middle notch between the left/right panels of
    // an active row — that notch is empty air by design, even
    // though `panel` also comes back null there.

    const inActiveRow =
        isWithinAnyRowZRange(
            p.group.position.z
        );


    const overMiddleGap =
        inActiveRow && !panel;


    const overBrokenGlass =
        panel && panel.userData.broken;


    const standingOverHole =
        overMiddleGap ||
        overBrokenGlass;


    // Gravity

    p.velocityY -=
        gravity * dt;


    p.group.position.y +=
        p.velocityY * dt;


    if (!standingOverHole) {

        if (
            p.group.position.y <= bridgeTop &&
            p.velocityY <= 0
        ) {

            p.group.position.y =
                bridgeTop;

            p.velocityY = 0;

            p.onGround = true;

            p.coyoteTime =
                COYOTE_WINDOW;


            // Only glass panels can trigger a break; the start
            // platform, finish platform, and gaps between rows
            // are solid and do nothing here.

            if (
                panel &&
                !panel.userData.broken
            ) {

                if (
                    !panel.userData.safe
                ) {

                    breakGlass(
                        panel
                    );

                    setTimeout(
                        () => {

                            startFall(p);

                        },
                        180
                    );
                }
                else {

                    markSafeGlass(
                        panel
                    );
                }
            }
        }
        else {

            p.onGround = false;

            p.coyoteTime =
                Math.max(
                    0,
                    p.coyoteTime - dt
                );
        }
    }
    else {

        p.onGround = false;

        p.coyoteTime =
            Math.max(
                0,
                p.coyoteTime - dt
            );
    }


    // ------------------------------------------------------
    // Jumping (buffered + coyote time)
    // ------------------------------------------------------

    p.jumpBufferTime =
        Math.max(
            0,
            p.jumpBufferTime - dt
        );


    const canJump =
        (p.onGround || p.coyoteTime > 0) &&
        !p.falling;


    if (
        p.jumpBufferTime > 0 &&
        canJump
    ) {

        p.velocityY =
            jumpPower;

        p.onGround = false;

        p.coyoteTime = 0;

        p.jumpBufferTime = 0;
    }


    // Fell off bridge

    if (
        p.group.position.y <
        BRIDGE_HEIGHT - 8
    ) {

        startFall(p);
    }


    // Reached finish

    if (
        p.group.position.z <=
        FINISH_Z - 2
    ) {

        win(p);
    }
}


// ============================================================
// FALL PHYSICS (per player)
// ============================================================

function updateFall(p, dt) {

    if (!p.falling) {
        return;
    }


    p.velocityY -=
        gravity * dt;


    p.group.position.y +=
        p.velocityY * dt;


    p.group.rotation.x +=
        2.5 * dt;


    if (
        p.group.position.y <
        -30
    ) {

        eliminate(p, "ELIMINATED");
    }
}


// ============================================================
// HUD
// ============================================================

const hud =
    document.createElement(
        "div"
    );

hud.style.cssText = `
position:fixed;
top:20px;
left:50%;
transform:translateX(-50%);
text-align:center;
font-family:Arial,sans-serif;
color:white;
z-index:10;
pointer-events:none;
text-shadow:0 3px 15px rgba(0,0,0,.95);
`;

document.body.appendChild(hud);


const stateEl =
    document.createElement(
        "div"
    );

stateEl.style.cssText = `
font-size:42px;
font-weight:900;
letter-spacing:5px;
`;

hud.appendChild(stateEl);


const timerEl =
    document.createElement(
        "div"
    );

timerEl.style.cssText = `
font-size:21px;
font-weight:800;
margin-top:4px;
`;

hud.appendChild(timerEl);


const hintEl =
    document.createElement(
        "div"
    );

hintEl.style.cssText = `
font-size:15px;
font-weight:700;
margin-top:7px;
opacity:.9;
`;

hud.appendChild(hintEl);


// Per-player status panel (new — needed now that there can be
// several players on the bridge at once).

const playerListEl =
    document.createElement("div");

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
min-width:160px;
line-height:1.6;
pointer-events:none;
text-shadow:0 2px 6px rgba(0,0,0,.85);
`;

document.body.appendChild(playerListEl);

function statusFor(p) {

    if (p.eliminated) {
        return { text: "OUT", color: "#ff5050" };
    }

    if (p.finished) {
        return { text: "SAFE", color: "#63ff88" };
    }

    if (!gameStarted) {
        return { text: "READY", color: "#ffffff" };
    }

    const row =
        Math.max(
            0,
            Math.min(
                ROWS - 1,
                Math.floor(
                    (START_Z - p.group.position.z) /
                    ROW_DISTANCE
                )
            )
        );

    return { text: `ROW ${row + 1}/${ROWS}`, color: "#8fdcff" };
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function updatePlayerListUI() {

    const rows = [];

    for (const p of players.values()) {

        const status = statusFor(p);

        rows.push(
            `<div style="display:flex;justify-content:space-between;gap:14px;">` +
            `<span>${escapeHtml(p.name)}${p.isHost ? " (you)" : ""}</span>` +
            `<span style="color:${status.color}">${status.text}</span>` +
            `</div>`
        );
    }

    playerListEl.innerHTML =
        rows.join("") || "<div>Waiting for players…</div>";
}


// ============================================================
// BANNER
// ============================================================

const banner =
    document.createElement(
        "div"
    );

banner.style.cssText = `
position:fixed;
left:50%;
top:50%;
transform:translate(-50%,-50%);
color:white;
font:900 64px Arial;
letter-spacing:6px;
text-shadow:0 5px 30px rgba(0,0,0,.95);
opacity:0;
pointer-events:none;
z-index:20;
transition:opacity .15s;
`;

document.body.appendChild(banner);


function flashBanner(text) {

    banner.textContent =
        text;

    banner.style.opacity =
        "1";


    setTimeout(
        () => {

            banner.style.opacity =
                "0";

        },
        800
    );
}


// ============================================================
// COUNTDOWN
// ============================================================

const countdownEl =
    document.createElement(
        "div"
    );

countdownEl.style.cssText = `
position:fixed;
inset:0;
display:flex;
align-items:center;
justify-content:center;
font:900 150px Arial;
color:white;
text-shadow:0 5px 30px rgba(0,0,0,.9);
z-index:30;
pointer-events:none;
`;

document.body.appendChild(
    countdownEl
);


function startCountdown() {

    let count = 3;

    countdownEl.textContent =
        count;


    const interval =
        setInterval(
            () => {

                count--;


                if (
                    count <= 0
                ) {

                    clearInterval(
                        interval
                    );


                    countdownEl.textContent =
                        "";


                    gameStarted =
                        true;


                    stateEl.textContent =
                        "GLASS BRIDGE";


                    stateEl.style.color =
                        "#8fdcff";


                    hintEl.textContent =
                        "WASD MOVE  •  SPACE JUMP  •  SHIFT RUN  (or use your phone)";


                    flashBanner(
                        "GO!"
                    );


                    updatePlayerListUI();


                    return;
                }


                countdownEl.textContent =
                    count;

            },
            1000
        );
}


// ============================================================
// ELIMINATION (per player)
// ============================================================

function eliminate(p, reason) {

    if (p.eliminated) {
        return;
    }


    p.eliminated = true;


    p.body.material.color.set(0x303030);
    p.head.visible = false;
    p.hair.visible = false;


    flashBanner(
        `${p.name.toUpperCase()} — ${reason}`
    );

    updatePlayerListUI();
}


// ============================================================
// WIN (per player)
// ============================================================

function win(p) {

    if (
        p.finished ||
        p.eliminated
    ) {
        return;
    }


    p.finished = true;


    flashBanner(
        `${p.name.toUpperCase()} SURVIVED!`
    );

    updatePlayerListUI();
}


// ============================================================
// GAME UPDATE (shared + per player)
// ============================================================

const clock =
    new THREE.Clock();


function updateGame(dt) {

    if (gameStarted) {

        const anyoneStillPlaying =
            [...players.values()].some(
                p => !p.eliminated && !p.finished
            );


        if (anyoneStillPlaying) {

            gameTime -= dt;


            if (
                gameTime <= 0
            ) {

                gameTime = 0;

                for (const p of players.values()) {
                    if (!p.eliminated && !p.finished) {
                        eliminate(p, "TIME UP");
                    }
                }
            }
        }


        const mins =
            Math.floor(
                gameTime / 60
            );


        const secs =
            Math.floor(
                gameTime % 60
            );


        timerEl.textContent =
            `TIME ${mins}:${String(secs).padStart(2, "0")}`;
    }


    for (const p of players.values()) {
        updateMovement(p, dt);
        updateFall(p, dt);
    }


    updatePlayerListUI();
}


// ============================================================
// CAMERA
// ============================================================

const cameraTarget =
    new THREE.Vector3();


function getCameraFocusPosition() {

    const active =
        [...players.values()].filter(
            p => !p.eliminated
        );

    const pool =
        active.length > 0
            ? active
            : [...players.values()];

    if (pool.length === 0) {
        return new THREE.Vector3(
            0,
            BRIDGE_HEIGHT + 1.3,
            START_Z + 6
        );
    }

    const centroid = new THREE.Vector3();

    for (const p of pool) {
        centroid.add(p.group.position);
    }

    centroid.divideScalar(pool.length);

    return centroid;
}


function updateCamera(dt) {

    const focus =
        getCameraFocusPosition();

    const desired =
        new THREE.Vector3(
            focus.x * 0.45,

            focus.y + 6.5,

            focus.z + 13
        );


    camera.position.lerp(
        desired,
        1 -
        Math.pow(
            0.0001,
            dt
        )
    );


    cameraTarget.set(
        focus.x,

        focus.y + 1,

        focus.z - 14
    );


    camera.lookAt(
        cameraTarget
    );
}


// ============================================================
// STARS
// ============================================================

const starGeometry =
    new THREE.BufferGeometry();

const starCount = 1800;

const starPositions =
    new Float32Array(
        starCount * 3
    );


for (
    let i = 0;
    i < starCount;
    i++
) {

    starPositions[i * 3] =
        THREE.MathUtils.randFloatSpread(
            500
        );

    starPositions[i * 3 + 1] =
        THREE.MathUtils.randFloat(
            35,
            250
        );

    starPositions[i * 3 + 2] =
        THREE.MathUtils.randFloat(
            -300,
            200
        );
}


starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        starPositions,
        3
    )
);


const stars =
    new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            transparent: true,
            opacity: 0.75
        })
    );


scene.add(stars);


// ============================================================
// MOON
// ============================================================

const moon =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            8,
            32,
            32
        ),
        new THREE.MeshBasicMaterial({
            color: 0xdce6ff
        })
    );


moon.position.set(
    -65,
    90,
    -110
);


scene.add(moon);


// Moon glow

const moonGlow =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            11,
            32,
            32
        ),
        new THREE.MeshBasicMaterial({
            color: 0x718bff,
            transparent: true,
            opacity: 0.08
        })
    );


moonGlow.position.copy(
    moon.position
);

scene.add(moonGlow);


// ============================================================
// CLOUDS / FOG BELOW
// ============================================================

function createCloud(
    x,
    y,
    z,
    scale
) {

    const cloud =
        new THREE.Group();


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const puff =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    5,
                    16,
                    12
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x7d86a5,
                    transparent: true,
                    opacity: 0.09
                })
            );


        puff.position.set(
            i * 5 - 15,
            THREE.MathUtils.randFloat(
                -2,
                2
            ),
            THREE.MathUtils.randFloat(
                -4,
                4
            )
        );


        puff.scale.set(
            1.5,
            0.5,
            1
        );


        cloud.add(puff);
    }


    cloud.position.set(
        x,
        y,
        z
    );


    cloud.scale.setScalar(
        scale
    );


    scene.add(cloud);
}


createCloud(
    -30,
    3,
    -30,
    2
);


createCloud(
    35,
    0,
    -80,
    2.5
);


createCloud(
    -20,
    -2,
    -140,
    3
);


createCloud(
    35,
    4,
    -190,
    2
);


// ============================================================
// DISTANT RED LIGHTS
// ============================================================

for (
    let i = 0;
    i < 18;
    i++
) {

    const light =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.3,
                12,
                12
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff1744
            })
        );


    light.position.set(
        THREE.MathUtils.randFloat(
            -80,
            80
        ),

        THREE.MathUtils.randFloat(
            15,
            55
        ),

        THREE.MathUtils.randFloat(
            -250,
            50
        )
    );


    scene.add(light);
}


// ============================================================
// PHONE CONTROLLER → PLAYERS
//
// Every phone that presses "Join" gets its own player on the
// bridge, spawned with the name typed on the phone. The glass
// bridge round has no obstacles or ability mechanic, so PUSH and
// ABILITY are accepted (so the buttons never error) but don't do
// anything here — only MOVE, RUN/RUN_RELEASE and JUMP matter.
// ============================================================

onNetworkMessage("JOIN", (message) => {

    if (!message.playerId || !message.player) return;

    if (players.has(message.playerId)) {
        // Already joined (e.g. a page refresh re-sent JOIN) — ignore.
        return;
    }

    spawnPlayer(message.playerId, message.player);

    const playerNumber =
        [...players.values()].filter(p => !p.isHost).length;

    console.log(`🎮 ${message.player} joined as Player ${playerNumber}`);

    sendNetworkMessage({
        type: "ASSIGNED",
        playerId: message.playerId,
        playerNumber
    });
});

onNetworkMessage("READY", (message) => {
    console.log("✅ PHONE READY:", message.player);
});

onNetworkMessage("MOVE", (message) => {
    const p = players.get(message.playerId);
    if (!p) return;

    p.moveX = Number(message.x) || 0;
    p.moveY = Number(message.y) || 0;
});

onNetworkMessage("RUN", (message) => {
    const p = players.get(message.playerId);
    if (!p) return;

    p.running = true;
});

onNetworkMessage("RUN_RELEASE", (message) => {
    const p = players.get(message.playerId);
    if (!p) return;

    p.running = false;
});

onNetworkMessage("JUMP", (message) => {
    const p = players.get(message.playerId);
    if (!p) return;

    // Feeds the same buffered-jump system the keyboard uses, so a
    // tap slightly before landing still counts.
    p.jumpBufferTime = JUMP_BUFFER_WINDOW;
});

onNetworkMessage("PUSH", () => {
    // No obstacles on the glass bridge — nothing to push.
});

onNetworkMessage("ABILITY", () => {
    // No ability mechanic on the glass bridge.
});


// ============================================================
// START
// ============================================================

connectNetworking();

// The keyboard-controlled local player, always available for
// testing without a phone connected.
spawnPlayer(HOST_ID, "YOU");

stateEl.textContent =
    "GET READY";

stateEl.style.color =
    "#ffffff";


hintEl.textContent =
    "WASD MOVE  •  SPACE JUMP  (or connect your phone)";


timerEl.textContent =
    "TIME 1:30";


flashBanner(
    "GLASS BRIDGE"
);


startCountdown();


// ============================================================
// GAME LOOP
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


    updateGame(dt);

    updateCamera(dt);


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
    "resize",
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
