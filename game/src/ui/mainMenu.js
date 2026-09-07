export class MainMenu {

    constructor(options = {}) {

        this.callbacks = {
            PLAY: options.onPlay || (() => {}),
            CUSTOM_TOURNAMENT: options.onCustomTournament || (() => {}),
            HOW_TO_PLAY: options.onHowToPlay || (() => {}),
            SETTINGS: options.onSettings || (() => {}),
            BACK: options.onBack || (() => {})
        };

        this.playersJoined = options.playersJoined ?? 8;
        this.maxPlayers = options.maxPlayers ?? 12;

        this.selectedIndex = 0;

        this.menuElement = null;
        this.buttons = [];

        this.handleKeyDown =
            this.handleKeyDown.bind(this);
    }


    mount(parent = document.body) {

        if (this.menuElement) return;

        this.menuElement =
            document.createElement("div");

        this.menuElement.className =
            "main-menu";


        this.menuElement.innerHTML = `

            <!-- BACKGROUND -->
            <div class="background-layer"></div>

            <div class="dark-overlay"></div>

            <!-- TOP STATUS -->
            <div class="top-status">

                <div class="system-online">
                    <span class="status-dot"></span>
                    SYSTEM ONLINE
                </div>

                <div class="version">
                    LAST ONE STANDING // 01
                </div>

            </div>


            <!-- MAIN UI -->
            <div class="interface">


                <!-- LEFT SIDE -->
                <section class="left-panel">


                    <!-- TITLE -->
                    <div class="title-area">

                        <h1>
                            LAST ONE
                            <br>
                            STANDING
                        </h1>

                        <div class="title-symbols">

                            <span class="square">□</span>
                            <span class="diamond">◇</span>
                            <span class="circle">○</span>

                        </div>


                        <div class="tagline">

                            <div>
                                ONE GAME. ONE WINNER.
                            </div>

                            <strong>
                                ARE YOU READY?
                            </strong>

                        </div>

                    </div>


                    <!-- MENU -->
                    <nav class="menu-list">


                        <button
                            class="menu-button selected"
                            data-action="PLAY"
                        >

                            <span class="number">
                                01
                            </span>

                            <span class="symbol">
                                ▶
                            </span>

                            <span class="label">
                                PLAY
                            </span>

                            <span class="arrow">
                                →
                            </span>

                        </button>




                        <button
                            class="menu-button"
                            data-action="CUSTOM_TOURNAMENT"
                        >

                            <span class="number">
                                03
                            </span>

                            <span class="symbol">
                                □
                            </span>

                            <span class="label">
                                CUSTOM TOURNAMENT
                            </span>

                            <span class="arrow">
                                →
                            </span>

                        </button>


                        <button
                            class="menu-button"
                            data-action="HOW_TO_PLAY"
                        >

                            <span class="number">
                                04
                            </span>

                            <span class="symbol">
                                △
                            </span>

                            <span class="label">
                                HOW TO PLAY
                            </span>

                            <span class="arrow">
                                →
                            </span>

                        </button>


                        <button
                            class="menu-button"
                            data-action="SETTINGS"
                        >

                            <span class="number">
                                05
                            </span>

                            <span class="symbol">
                                ⚙
                            </span>

                            <span class="label">
                                SETTINGS
                            </span>

                            <span class="arrow">
                                →
                            </span>

                        </button>


                    </nav>

                </section>


                <!-- RIGHT PLAYER PANEL -->
                <aside class="player-panel">


                    <div class="player-header">

                        <span>
                            PLAYERS JOINED
                        </span>

                        <span class="live">
                            <i></i>
                            LIVE
                        </span>

                    </div>


                    <div class="player-number">

                        <strong class="current-count">
                            ${this.playersJoined}
                        </strong>

                        <span>
                            / ${this.maxPlayers}
                        </span>

                    </div>


                    <!-- PLAYER DOTS -->
                    <div class="player-icons">

                        ${this.createPlayerIcons()}

                    </div>


                    <!-- PROGRESS -->
                    <div class="progress">

                        <div
                            class="progress-fill"
                            style="
                                width:${this.getPercentage()}%
                            "
                        ></div>

                    </div>


                    <div class="divider"></div>


                    <!-- QR -->
                    <div class="qr-container">

                        <div class="qr-box">

                            <div class="corner tl"></div>
                            <div class="corner tr"></div>
                            <div class="corner bl"></div>
                            <div class="corner br"></div>

                            <div class="qr-placeholder">

    <img
        src="./src/assets/controller_qr_5174.png"
        alt="Scan to join the phone controller"
        style="
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        "
    >

</div>
                        </div>


                        <div class="scan">

                            <span>
                                ▯
                            </span>

                            SCAN TO JOIN

                        </div>


                        <p>

                            USE YOUR PHONE AS<br>
                            YOUR CONTROLLER

                        </p>

                    </div>

                </aside>


            </div>


            <!-- BOTTOM -->
            <footer class="bottom-bar">


                <div class="controls">

                    <span class="key">
                        ENTER
                    </span>

                    <span>
                        SELECT
                    </span>


                    <span class="key esc">
                        ESC
                    </span>

                    <span>
                        BACK
                    </span>

                </div>


                <div class="connected">

                    <span class="status-dot"></span>

                    <span class="connected-count">
                        ${this.playersJoined}
                    </span>

                    PLAYERS CONNECTED

                </div>


            </footer>

        `;


        parent.appendChild(
            this.menuElement
        );


        this.buttons =
            [
                ...this.menuElement.querySelectorAll(
                    ".menu-button"
                )
            ];


        this.bindEvents();

        this.updateSelection();


        window.addEventListener(
            "keydown",
            this.handleKeyDown
        );
    }


    createPlayerIcons() {

        let html = "";

        for (
            let i = 0;
            i < this.maxPlayers;
            i++
        ) {

            html += `
                <span
                    class="player-icon ${
                        i < this.playersJoined
                            ? "active"
                            : ""
                    }"
                ></span>
            `;

        }

        return html;
    }


    getPercentage() {

        return Math.min(
            100,
            (this.playersJoined /
                this.maxPlayers) * 100
        );

    }


    bindEvents() {

        this.buttons.forEach(
            (button, index) => {

                button.addEventListener(
                    "mouseenter",
                    () => {

                        this.selectedIndex =
                            index;

                        this.updateSelection();

                    }
                );


                button.addEventListener(
                    "click",
                    () => {

                        this.activate();

                    }
                );

            }
        );

    }


    handleKeyDown(event) {

        if (!this.menuElement) return;


        if (event.key === "ArrowDown") {

            event.preventDefault();

            this.selectedIndex =
                (this.selectedIndex + 1)
                % this.buttons.length;

            this.updateSelection();

        }


        if (event.key === "ArrowUp") {

            event.preventDefault();

            this.selectedIndex =
                (
                    this.selectedIndex -
                    1 +
                    this.buttons.length
                )
                % this.buttons.length;

            this.updateSelection();

        }


        if (event.key === "Enter") {

            event.preventDefault();

            this.activate();

        }


        if (event.key === "Escape") {

            event.preventDefault();

            this.callbacks.BACK();

        }

    }


    updateSelection() {

        this.buttons.forEach(
            (button, index) => {

                button.classList.toggle(
                    "selected",
                    index === this.selectedIndex
                );

            }
        );

    }


    activate() {

        const button =
            this.buttons[
                this.selectedIndex
            ];

        if (!button) return;

        const action =
            button.dataset.action;


        button.classList.add(
            "pressed"
        );


        setTimeout(() => {

            button.classList.remove(
                "pressed"
            );

        }, 150);


        this.callbacks[action]?.();

    }


    setPlayersJoined(count) {

        this.playersJoined =
            Math.max(
                0,
                Math.min(
                    count,
                    this.maxPlayers
                )
            );


        if (!this.menuElement) return;


        const current =
            this.menuElement.querySelector(
                ".current-count"
            );

        const progress =
            this.menuElement.querySelector(
                ".progress-fill"
            );

        const connected =
            this.menuElement.querySelector(
                ".connected-count"
            );

        const icons =
            this.menuElement.querySelector(
                ".player-icons"
            );


        current.textContent =
            this.playersJoined;


        progress.style.width =
            `${this.getPercentage()}%`;


        connected.textContent =
            this.playersJoined;


        icons.innerHTML =
            this.createPlayerIcons();

    }


    destroy() {

        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );

        this.menuElement?.remove();

        this.menuElement = null;

    }

}