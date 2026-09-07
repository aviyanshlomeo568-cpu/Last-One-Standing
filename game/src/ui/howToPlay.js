
export class HowToPlay {

    constructor(options = {}) {

        this.onBack =
            options.onBack || (() => {});

        this.page = null;

        this.handleKeyDown =
            this.handleKeyDown.bind(this);
    }


    mount(parent = document.body) {

        if (this.page) return;


        this.page =
            document.createElement("div");

        this.page.className =
            "how-to-play";


        this.page.innerHTML = `

            <!-- BACKGROUND -->

            <div class="htp-background"></div>

            <div class="htp-overlay"></div>


            <!-- TOP BAR -->

            <header class="htp-header">

                <div class="system-status">

                    <span class="status-dot"></span>

                    SYSTEM ONLINE

                </div>


                <div class="page-name">

                    HOW TO PLAY

                </div>


                <div class="game-name">

                    LAST ONE STANDING // 01

                </div>

            </header>


            <!-- MAIN CONTENT -->

            <main class="htp-content">


                <!-- TITLE -->

                <section class="htp-title">

                    <div class="symbols">

                        <span>□</span>
                        <span>◇</span>
                        <span>○</span>

                    </div>


                    <h1>

                        HOW TO<br>
                        <span>PLAY</span>

                    </h1>


                    <p>

                        ENTER THE ARENA.<br>
                        SURVIVE EVERY ROUND.

                    </p>

                </section>


                <!-- INSTRUCTIONS -->

                <section class="instructions">


                    <!-- STEP 01 -->

                    <article class="instruction-card">

                        <div class="step-number">
                            01
                        </div>


                        <div class="card-icon">
                            📱
                        </div>


                        <div class="card-content">

                            <h2>
                                JOIN THE GAME
                            </h2>

                            <p>

                                Scan the QR code shown
                                on the main screen using
                                your phone.

                            </p>

                        </div>

                    </article>


                    <!-- STEP 02 -->

                    <article class="instruction-card">

                        <div class="step-number">
                            02
                        </div>


                        <div class="card-icon">
                            🎮
                        </div>


                        <div class="card-content">

                            <h2>
                                USE YOUR PHONE
                            </h2>

                            <p>

                                Your phone becomes your
                                wireless controller.
                                Move your character using
                                the on-screen joystick.

                            </p>

                        </div>

                    </article>


                    <!-- STEP 03 -->

                    <article class="instruction-card">

                        <div class="step-number">
                            03
                        </div>


                        <div class="card-icon">
                            ⚠
                        </div>


                        <div class="card-content">

                            <h2>
                                SURVIVE
                            </h2>

                            <p>

                                Every round has different
                                challenges. Make the right
                                moves and avoid elimination.

                            </p>

                        </div>

                    </article>


                    <!-- STEP 04 -->

                    <article class="instruction-card">

                        <div class="step-number">
                            04
                        </div>


                        <div class="card-icon">
                            🏆
                        </div>


                        <div class="card-content">

                            <h2>
                                BE THE LAST ONE
                            </h2>

                            <p>

                                Players are eliminated
                                throughout the tournament.
                                The final surviving player
                                wins.

                            </p>

                        </div>

                    </article>


                </section>


                <!-- GAME FLOW -->

                <section class="game-flow">

                    <div class="flow-title">

                        <span></span>

                        GAME FLOW

                    </div>


                    <div class="flow">

                        <div class="flow-item">

                            <strong>
                                JOIN
                            </strong>

                            <small>
                                SCAN QR
                            </small>

                        </div>


                        <div class="flow-arrow">
                            →
                        </div>


                        <div class="flow-item">

                            <strong>
                                PLAY
                            </strong>

                            <small>
                                SURVIVE
                            </small>

                        </div>


                        <div class="flow-arrow">
                            →
                        </div>


                        <div class="flow-item">

                            <strong>
                                ELIMINATE
                            </strong>

                            <small>
                                OUTLAST
                            </small>

                        </div>


                        <div class="flow-arrow">
                            →
                        </div>


                        <div class="flow-item winner">

                            <strong>
                                WIN
                            </strong>

                            <small>
                                LAST ONE
                            </small>

                        </div>

                    </div>

                </section>


            </main>


            <!-- FOOTER -->

            <footer class="htp-footer">

                <button
                    class="back-button"
                    id="how-to-back"
                >

                    <span class="key">
                        ESC
                    </span>

                    <span>
                        BACK TO MENU
                    </span>

                    <strong>
                        ←
                    </strong>

                </button>


                <div class="footer-status">

                    △ ○ □

                    &nbsp;&nbsp;

                    UP TO 12 PLAYERS

                </div>

            </footer>

        `;


        parent.appendChild(this.page);


        const backButton =
            this.page.querySelector(
                "#how-to-back"
            );


        backButton.addEventListener(
            "click",
            () => this.back()
        );


        window.addEventListener(
            "keydown",
            this.handleKeyDown
        );

    }


    handleKeyDown(event) {

        if (event.key === "Escape") {

            event.preventDefault();

            this.back();

        }

    }


    back() {

        this.destroy();

        this.onBack();

    }


    destroy() {

        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );


        this.page?.remove();

        this.page = null;

    }

}