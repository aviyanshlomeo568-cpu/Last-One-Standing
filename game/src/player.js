import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;

        // Create the player's body
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);

        const material = new THREE.MeshStandardMaterial({
            color: 0xff3333
        });

        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.set(0, 1, 0);

        scene.add(this.mesh);

        // Movement
        this.speed = 5;
        this.velocityY = 0;
        this.onGround = true;
    }

    update(keys, delta) {

        // Forward/backward
        if (keys['w']) {
            this.mesh.position.z -= this.speed * delta;
        }

        if (keys['s']) {
            this.mesh.position.z += this.speed * delta;
        }

        // Left/right
        if (keys['a']) {
            this.mesh.position.x -= this.speed * delta;
        }

        if (keys['d']) {
            this.mesh.position.x += this.speed * delta;
        }

        // Jump
        if (keys[' '] && this.onGround) {
            this.velocityY = 7;
            this.onGround = false;
        }

        // Gravity
        this.velocityY -= 20 * delta;

        this.mesh.position.y += this.velocityY * delta;

        // Ground collision
        if (this.mesh.position.y <= 1) {
            this.mesh.position.y = 1;
            this.velocityY = 0;
            this.onGround = true;
        }
    }
}