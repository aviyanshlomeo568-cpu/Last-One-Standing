import * as THREE from 'three';

const skinMat = new THREE.MeshStandardMaterial({ color: 0xdca17c, roughness: 0.8 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.65 });
const batWoodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.6 });
const batGripMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });

// Name tag — big, bold, pink pill panel. This is the primary, most
// prominent floating element above each player.
function drawNameCanvas(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');
  const w = 860;
  const h = 210;
  const x = 20;
  const y = 25;
  const radius = h / 2;

  ctx.fillStyle = 'rgba(8,9,15,0.92)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ff2d78';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.stroke();

  ctx.font = '900 130px "Arial Black", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, 450, y + h / 2 + 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 450, y + h / 2 + 4);

  return canvas;
}

// Status/countdown — no panel, just bold outlined numbers floating
// below the name tag.
function drawStatusCanvas(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 520;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');

  ctx.font = '900 120px "Arial Black", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, 260, 90);
  ctx.fillStyle = '#ff2d78';
  ctx.fillText(text, 260, 90);

  return canvas;
}

function makeSprite(canvas, scaleX, scaleY) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(scaleX, scaleY, 1);
  return sprite;
}

// Rest pose and swing motion for the bat arm, in radians on the X axis.
const ARM_REST_X = -0.25;
const SWING_AMPLITUDE = 2.1;
const SWING_DURATION = 0.35;

// RUN: temporary speed multiplier while the button is held.
const RUN_MULTIPLIER = 1.6;

// ABILITY: brief knockback-immunity "dodge" with a cooldown so it
// can't be spammed to camp the hill unpushable.
const DODGE_DURATION = 0.4;
const DODGE_COOLDOWN = 3.0;
const DODGE_FLICKER_INTERVAL = 0.08; // seconds per opacity flip while dodging

// FALLING / DEATH: once a player's x/z is outside groundRadius,
// there is no ground under them - gravity just keeps pulling them
// down until they pass this y value, at which point they die.
const DEATH_Y = -25;

export class Player {
  constructor(scene, { name, colorHex = 0xff3333, spawnPos, groundRadius = Infinity } = {}) {
    this.scene = scene;
    this.name = name;

    // Radius (from world origin, in the x/z plane) within which solid
    // ground exists. Outside this radius there's nothing to stand on,
    // so gravity is allowed to carry the player down past DEATH_Y.
    this.groundRadius = groundRadius;

    this.mesh = new THREE.Group();
    this.mesh.position.copy(spawnPos ?? new THREE.Vector3(0, 1.05, 0));
    scene.add(this.mesh);

    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.68, 1.35, 8, 16),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.65, transparent: true })
    );
    this.body.castShadow = true;
    this.mesh.add(this.body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 20, 16), skinMat);
    head.position.y = 1.3;
    head.castShadow = true;
    this.mesh.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.61, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      blackMat
    );
    hair.position.y = 1.55;
    this.mesh.add(hair);

    // Left arm — static, just hangs at the side.
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.78, 1.0, 0);
    const leftArmMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 0.7, 4, 8),
      skinMat
    );
    leftArmMesh.position.y = -0.4;
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skinMat);
    leftHand.position.y = -0.78;
    leftArm.add(leftHand);
    this.mesh.add(leftArm);

    // Right arm — holds the bat, this is the one that swings.
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.78, 1.0, 0);
    this.rightArm.rotation.x = ARM_REST_X;
    const rightArmMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 0.7, 4, 8),
      skinMat
    );
    rightArmMesh.position.y = -0.4;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skinMat);
    rightHand.position.y = -0.78;
    this.rightArm.add(rightHand);

    // Bat: grip + tapered barrel, held at the hand.
    const bat = new THREE.Group();
    bat.position.set(0, -0.78, 0);
    bat.rotation.z = Math.PI * 0.15;
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.28, 10),
      batGripMat
    );
    grip.position.y = -0.1;
    bat.add(grip);
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.05, 0.95, 12),
      batWoodMat
    );
    barrel.position.y = 0.52;
    barrel.castShadow = true;
    bat.add(barrel);
    this.rightArm.add(bat);

    this.mesh.add(this.rightArm);

    // Name tag — the big one, sits on top.
    if (name) {
      const nameSprite = makeSprite(drawNameCanvas(name), 9.5, 2.75);
      nameSprite.position.set(0, 6.3, 0);
      this.mesh.add(nameSprite);
    }

    // Movement
    this.baseSpeed = 6.5;
    this.running = false;
    this.velocityY = 0;
    this.onGround = true;
    this.move = { x: 0, y: 0 };

    this.eliminated = false;
    this.instability = { x: 0, z: 0 };
    this.score = 0;
    this.playerNumber = null;
    this.ready = false;

    // Bat swing state.
    this._swinging = false;
    this._swingTime = 0;

    // Dodge (ABILITY) state.
    this.dodging = false;
    this._dodgeTime = 0;
    this._dodgeCooldownRemaining = 0;

    // Generic floating status label below the name tag - plain
    // number/word, no panel. Any mini-game can use this for a
    // timer, a score, a status word, etc. - lazily created the
    // first time setLabel() runs.
    this._label = null;
    this._labelText = null;
  }

  // Call every frame with whatever text you want floating over this
  // player's head (e.g. "14" or "WINNER"). Cheap to call often -
  // it only redraws the texture when the text actually changes.
  setLabel(text) {
    if (!this._label) {
      this._label = makeSprite(drawStatusCanvas(text), 5.5, 1.9);
      this._label.position.set(0, 3.9, 0);
      this.mesh.add(this._label);
      this._labelText = text;
      return;
    }
    if (text === this._labelText) return;
    this._labelText = text;
    const canvas = drawStatusCanvas(text);
    this._label.material.map.dispose();
    this._label.material.map = new THREE.CanvasTexture(canvas);
    this._label.material.map.colorSpace = THREE.SRGBColorSpace;
    this._label.material.needsUpdate = true;
  }

  // Call this whenever this player performs a PUSH - plays a bat
  // swing. Safe to call again mid-swing; it just restarts the arc.
  swingBat() {
    this._swinging = true;
    this._swingTime = 0;
  }

  setMove(x, y) {
    this.move.x = x;
    this.move.y = y;
  }

  // RUN button held/released - toggles the speed multiplier.
  setRunning(isRunning) {
    this.running = isRunning;
  }

  jump() {
    if (this.onGround) {
      this.velocityY = 7;
      this.onGround = false;
    }
  }

  // ABILITY button - starts a brief knockback-immunity window if
  // not on cooldown. No-op while already on cooldown.
  tryDodge() {
    if (this._dodgeCooldownRemaining > 0) return;
    this.dodging = true;
    this._dodgeTime = 0;
    this._dodgeCooldownRemaining = DODGE_COOLDOWN;
  }

  applyKnockback(dirX, dirZ, force) {
    if (this.dodging) return; // immune while dodging
    this.instability.x += dirX * force;
    this.instability.z += dirZ * force;
  }

  // Called when this player falls off the platform and passes
  // DEATH_Y. Marks them eliminated, hides their mesh, and stops
  // all residual motion/state so they don't keep affecting the
  // round (can't be pushed, can't hold the hill, no label churn).
  die() {
    if (this.eliminated) return;

    this.eliminated = true;
    this.mesh.visible = false;

    this.velocityY = 0;
    this.move.x = 0;
    this.move.y = 0;
    this.instability.x = 0;
    this.instability.z = 0;

    this.dodging = false;
    this._swinging = false;
  }

  // Called at the start of a new round after a win: puts this
  // player back to a fresh spawn state (position, movement,
  // score, bat pose) without recreating any meshes/sprites.
  resetRound(spawnPos) {
    this.eliminated = false;
    this.mesh.visible = true;

    this.mesh.position.copy(spawnPos);
    this.mesh.rotation.y = 0;

    this.move.x = 0;
    this.move.y = 0;
    this.velocityY = 0;
    this.onGround = true;
    this.running = false;

    this.instability.x = 0;
    this.instability.z = 0;

    this.score = 0;

    this._swinging = false;
    this._swingTime = 0;
    this.rightArm.rotation.x = ARM_REST_X;

    this.dodging = false;
    this._dodgeTime = 0;
    this._dodgeCooldownRemaining = 0;
    this.body.material.opacity = 1;
  }

  update(delta) {
    if (this.eliminated) return;

    if (this._dodgeCooldownRemaining > 0) {
      this._dodgeCooldownRemaining = Math.max(0, this._dodgeCooldownRemaining - delta);
    }

    if (this.dodging) {
      this._dodgeTime += delta;
      const flickerOn = Math.floor(this._dodgeTime / DODGE_FLICKER_INTERVAL) % 2 === 0;
      this.body.material.opacity = flickerOn ? 0.35 : 0.85;
      if (this._dodgeTime >= DODGE_DURATION) {
        this.dodging = false;
        this.body.material.opacity = 1;
      }
    }

    const effectiveSpeed = this.running ? this.baseSpeed * RUN_MULTIPLIER : this.baseSpeed;
    this.mesh.position.x += this.move.x * effectiveSpeed * delta;
    this.mesh.position.z += this.move.y * effectiveSpeed * delta;

    this.mesh.position.x += this.instability.x * delta;
    this.mesh.position.z += this.instability.z * delta;
    const decay = Math.pow(0.02, delta);
    this.instability.x *= decay;
    this.instability.z *= decay;

    const lengthSq = this.move.x * this.move.x + this.move.y * this.move.y;
    if (lengthSq > 0.0001) {
      const desired = Math.atan2(this.move.x, this.move.y);
      this.mesh.rotation.y = THREE.MathUtils.lerp(
        this.mesh.rotation.y,
        desired,
        1 - Math.pow(0.0001, delta)
      );
    }

    this.velocityY -= 20 * delta;
    this.mesh.position.y += this.velocityY * delta;

    // Ground only exists within groundRadius of the center. Inside
    // it, behave as before (land at y = 1.05). Outside it, there's
    // nothing to stand on - keep falling under gravity until the
    // player drops far enough to die.
    const distFromCenter = Math.hypot(this.mesh.position.x, this.mesh.position.z);
    const overGround = distFromCenter <= this.groundRadius;

    if (overGround) {
      if (this.mesh.position.y <= 1.05) {
        this.mesh.position.y = 1.05;
        this.velocityY = 0;
        this.onGround = true;
      }
    } else {
      this.onGround = false;

      if (this.mesh.position.y <= DEATH_Y) {
        this.die();
        return;
      }
    }

    // Bat swing animation - forward arc and back to rest.
    if (this._swinging) {
      this._swingTime += delta;
      const progress = Math.min(this._swingTime / SWING_DURATION, 1);
      const arc = Math.sin(progress * Math.PI);
      this.rightArm.rotation.x = ARM_REST_X + arc * SWING_AMPLITUDE;
      if (progress >= 1) {
        this._swinging = false;
        this.rightArm.rotation.x = ARM_REST_X;
      }
    }
  }
}