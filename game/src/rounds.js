import * as THREE from 'three';

export class RedLightGreenLight {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.roundDuration = 180; // 3 minutes
        this.timeRemaining = this.roundDuration;

        this.state = 'GREEN';
        this.stateTimer = 3;

        this.finished = false;
        this.eliminated = false;

        this.abilityUsed = false;

        this.lastPlayerPosition = player.mesh.position.clone();

        this.createFinishLine();
        this.createDoll();
        this.createObstacles();
        this.createEnvironment();
        this.createUI();
    }

    // ----------------------------------------
    // ENVIRONMENT
    // ----------------------------------------

    createEnvironment() {

        // Grass field
        const grassGeometry = new THREE.PlaneGeometry(70, 130);

        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x4f8f45
        });

        this.grass = new THREE.Mesh(
            grassGeometry,
            grassMaterial
        );

        this.grass.rotation.x = -Math.PI / 2;
        this.grass.position.set(0, 0, -10);

        this.scene.add(this.grass);

        // Small grass patches
        for (let i = 0; i < 120; i++) {

            const blade = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.35, 4),
                new THREE.MeshStandardMaterial({
                    color: 0x376b32
                })
            );

            blade.position.set(
                (Math.random() - 0.5) * 60,
                0.15,
                45 - Math.random() * 110
            );

            this.scene.add(blade);
        }

        // Clouds
        for (let i = 0; i < 8; i++) {

            const cloud = new THREE.Group();

            for (let j = 0; j < 5; j++) {

                const puff = new THREE.Mesh(
                    new THREE.SphereGeometry(
                        2 + Math.random() * 1.5,
                        12,
                        12
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff
                    })
                );

                puff.position.set(
                    j * 2 - 4,
                    Math.random() * 1.5,
                    Math.random()
                );

                cloud.add(puff);
            }

            cloud.position.set(
                (Math.random() - 0.5) * 70,
                18 + Math.random() * 8,
                -20 - Math.random() * 50
            );

            this.scene.add(cloud);
        }
    }

    // ----------------------------------------
    // FINISH LINE
    // ----------------------------------------

    createFinishLine() {

        const geometry = new THREE.BoxGeometry(28, 0.05, 1);

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff
        });

        this.finishLine = new THREE.Mesh(
            geometry,
            material
        );

        this.finishLine.position.set(0, 0.03, -48);

        this.scene.add(this.finishLine);

        // Red/white posts
        for (const x of [-14, 14]) {

            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 3, 12),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff
                })
            );

            post.position.set(x, 1.5, -48);

            this.scene.add(post);
        }
    }

    // ----------------------------------------
    // GIANT DOLL
    // ----------------------------------------

    createDoll() {

        this.doll = new THREE.Group();

        // Body
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3.5, 9, 24),
            new THREE.MeshStandardMaterial({
                color: 0xf4b08b
            })
        );

        body.position.y = 5;

        this.doll.add(body);

        // Dress
        const dress = new THREE.Mesh(
            new THREE.ConeGeometry(6, 10, 24),
            new THREE.MeshStandardMaterial({
                color: 0xf5a623
            })
        );

        dress.position.y = 4;

        this.doll.add(dress);

        // Head
        this.dollHead = new THREE.Group();

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(3.2, 24, 24),
            new THREE.MeshStandardMaterial({
                color: 0xffc49d
            })
        );

        this.dollHead.add(head);

        // Hair
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(3.4, 24, 24),
            new THREE.MeshStandardMaterial({
                color: 0x171717
            })
        );

        hair.scale.set(1, 1.05, 0.85);
        hair.position.z = -0.6;

        this.dollHead.add(hair);

        // Eyes
        this.leftEye = this.createEye(-1.1);
        this.rightEye = this.createEye(1.1);

        this.dollHead.add(this.leftEye);
        this.dollHead.add(this.rightEye);

        this.dollHead.position.y = 12;

        this.doll.add(this.dollHead);

        // Put doll at finish
        this.doll.position.set(0, 0, -53);

        this.scene.add(this.doll);

        // Lights above doll
        this.createDollLights();
    }

    createEye(x) {

        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 12, 12),
            new THREE.MeshBasicMaterial({
                color: 0x222222
            })
        );

        eye.position.set(
            x,
            12.2,
            -56
        );

        return eye;
    }

    createDollLights() {

        this.lightGroup = new THREE.Group();

        const colors = [
            0xff2222,
            0x22ff44,
            0xff2222,
            0x22ff44
        ];

        colors.forEach((color, index) => {

            const light = new THREE.Mesh(
                new THREE.SphereGeometry(0.45, 16, 16),
                new THREE.MeshBasicMaterial({
                    color
                })
            );

            light.position.set(
                (index - 1.5) * 1.2,
                22,
                -53
            );

            this.lightGroup.add(light);
        });

        this.scene.add(this.lightGroup);

        this.updateDollLights();
    }

    updateDollLights() {

        const isGreen = this.state === 'GREEN';

        this.lightGroup.children.forEach((light, index) => {

            light.material.color.set(
                isGreen
                    ? (index % 2 === 0 ? 0x117722 : 0x33ff66)
                    : (index % 2 === 0 ? 0xff3333 : 0x771111)
            );

        });
    }

    // ----------------------------------------
    // OBSTACLES
    // ----------------------------------------

    createObstacles() {

        this.obstacles = [];

        // Large stones
        const stonePositions = [
            [-8, 22],
            [6, 10],
            [-5, -2],
            [9, -15],
            [-7, -28],
            [4, -38]
        ];

        stonePositions.forEach(([x, z]) => {

            const stone = new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    1.8 + Math.random(),
                    1
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x777777
                })
            );

            stone.position.set(x, 1.2, z);

            this.scene.add(stone);
            this.obstacles.push(stone);
        });

        // Wooden logs
        const logPositions = [
            [7, 30],
            [-8, 5],
            [5, -8],
            [-4, -20],
            [8, -32]
        ];

        logPositions.forEach(([x, z]) => {

            const log = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1,
                    1,
                    5,
                    12
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x7b4a25
                })
            );

            log.rotation.z = Math.PI / 2;

            log.position.set(x, 1, z);

            this.scene.add(log);
            this.obstacles.push(log);
        });
    }

    // ----------------------------------------
    // UI
    // ----------------------------------------

    createUI() {

        this.ui = document.createElement('div');

        this.ui.style.position = 'absolute';
        this.ui.style.top = '20px';
        this.ui.style.left = '50%';
        this.ui.style.transform = 'translateX(-50%)';

        this.ui.style.color = 'white';
        this.ui.style.textAlign = 'center';
        this.ui.style.fontFamily = 'Arial, sans-serif';
        this.ui.style.fontWeight = 'bold';
        this.ui.style.fontSize = '28px';

        this.ui.style.textShadow = '2px 2px 5px black';

        this.sceneUI = this.ui;

        document.body.appendChild(this.ui);

        this.updateUI();
    }

    updateUI() {

        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = Math.floor(this.timeRemaining % 60);

        const time =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const color =
            this.state === 'GREEN'
                ? '#39ff5a'
                : '#ff3030';

        this.ui.innerHTML = `
            <div style="font-size:42px;color:${color}">
                ${this.state}
            </div>

            <div style="font-size:24px">
                TIME: ${time}
            </div>

            <div style="font-size:16px;margin-top:8px">
                CROSS THE FINISH LINE
            </div>
        `;
    }

    // ----------------------------------------
    // ROUND UPDATE
    // ----------------------------------------

    update(delta, input) {

        if (this.finished || this.eliminated) {
            return;
        }

        this.timeRemaining -= delta;

        if (this.timeRemaining <= 0) {

            this.timeRemaining = 0;

            this.eliminated = true;

            this.showMessage('TIME UP — ELIMINATED');

            return;
        }

        // State timer
        this.stateTimer -= delta;

        if (this.stateTimer <= 0) {

            if (this.state === 'GREEN') {

                this.state = 'RED';

                this.stateTimer =
                    1.5 + Math.random() * 2.5;

            } else {

                this.state = 'GREEN';

                this.stateTimer =
                    2 + Math.random() * 3;
            }

            this.updateDollLights();
        }

        // Detect movement during RED
        if (this.state === 'RED') {

            const currentPosition =
                this.player.mesh.position;

            const distanceMoved =
                currentPosition.distanceTo(
                    this.lastPlayerPosition
                );

            if (distanceMoved > 0.025) {

                this.eliminatePlayer(
                    'MOVEMENT DETECTED'
                );

                return;
            }
        }

        // Save position
        this.lastPlayerPosition.copy(
            this.player.mesh.position
        );

        // Finish detection
        if (
            this.player.mesh.position.z <= -48
        ) {

            this.finished = true;

            this.showMessage(
                'YOU MADE IT! 🏁'
            );
        }

        this.updateUI();
    }

    // ----------------------------------------
    // ELIMINATION
    // ----------------------------------------

    eliminatePlayer(reason) {

        if (this.eliminated) {
            return;
        }

        this.eliminated = true;

        this.fireLaser();

        setTimeout(() => {

            this.showMessage(
                `💥 ELIMINATED — ${reason}`
            );

        }, 300);
    }

    // ----------------------------------------
    // LASER
    // ----------------------------------------

    fireLaser() {

        const start =
            new THREE.Vector3(
                this.doll.position.x,
                12,
                this.doll.position.z + 3
            );

        const end =
            this.player.mesh.position.clone();

        const direction =
            new THREE.Vector3()
                .subVectors(end, start);

        const length =
            direction.length();

        const laser = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12,
                0.12,
                length,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff0000
            })
        );

        laser.position.copy(start).add(
            direction.multiplyScalar(0.5)
        );

        laser.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );

        this.scene.add(laser);

        // Red flash from eyes
        this.leftEye.material.color.set(0xff0000);
        this.rightEye.material.color.set(0xff0000);

        setTimeout(() => {

            this.scene.remove(laser);

        }, 500);
    }

    // ----------------------------------------
    // ABILITY
    // ----------------------------------------

    useAbility() {

        if (this.abilityUsed) {
            return;
        }

        this.abilityUsed = true;

        let closest = null;
        let closestDistance = Infinity;

        this.obstacles.forEach(obstacle => {

            const distance =
                obstacle.position.distanceTo(
                    this.player.mesh.position
                );

            if (
                distance < closestDistance &&
                distance < 8
            ) {

                closest = obstacle;
                closestDistance = distance;
            }
        });

        if (closest) {

            this.scene.remove(closest);

            this.obstacles =
                this.obstacles.filter(
                    obstacle => obstacle !== closest
                );

            this.showTemporaryMessage(
                'ABILITY USED — OBSTACLE REMOVED'
            );

        } else {

            this.showTemporaryMessage(
                'NO OBSTACLE NEARBY'
            );
        }
    }

    // ----------------------------------------
    // PUSH
    // ----------------------------------------

    push() {

        this.showTemporaryMessage(
            'PUSH!'
        );

        // Multiplayer player pushing will be
        // implemented when networking is added.
    }

    // ----------------------------------------
    // MESSAGES
    // ----------------------------------------

    showTemporaryMessage(text) {

        const message =
            document.createElement('div');

        message.innerText = text;

        message.style.position = 'absolute';
        message.style.top = '45%';
        message.style.left = '50%';
        message.style.transform =
            'translate(-50%, -50%)';

        message.style.color = 'white';
        message.style.fontSize = '30px';
        message.style.fontWeight = 'bold';
        message.style.textShadow =
            '2px 2px 5px black';

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 1000);
    }

    showMessage(text) {

        const message =
            document.createElement('div');

        message.innerText = text;

        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';

        message.style.transform =
            'translate(-50%, -50%)';

        message.style.color = 'white';
        message.style.fontSize = '48px';
        message.style.fontWeight = 'bold';
        message.style.textAlign = 'center';

        message.style.textShadow =
            '3px 3px 10px black';

        document.body.appendChild(message);
    }
}