export class RoundSelect {
    constructor(options = {}) {
        this.callbacks = {
            ROUND_1: options.onRound1 || (() => {}),
            ROUND_2: options.onRound2 || (() => {}),
            ROUND_3: options.onRound3 || (() => {}),
            CUSTOM: options.onCustom || (() => {}),
            BACK: options.onBack || (() => {})
        };

        this.selectedIndex = 0;

        this.rounds = [
            {
                id: "ROUND_1",
                number: "01",
                title: "RED LIGHT",
                description: "MOVE WHEN THE LIGHT IS GREEN. STOP WHEN IT TURNS RED."
            },
            {
                id: "ROUND_2",
                number: "02",
                title: "GLASS BRIDGE",
                description: "CHOOSE YOUR PATH. ONE WRONG STEP MEANS ELIMINATION."
            },
            {
                id: "ROUND_3",
                number: "03",
                title: "FINAL STAND",
                description: "SURVIVE THE FINAL CHALLENGE AND BE THE LAST ONE STANDING."
            },
            {
                id: "CUSTOM",
                number: "★",
                title: "CUSTOM TOURNAMENT",
                description: "CREATE YOUR OWN TOURNAMENT EXPERIENCE."
            }
        ];

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    mount() {
        this.destroy();

        this.element = document.createElement("div");
        this.element.className = "round-select-screen";

        this.element.innerHTML = `
            <div class="background-layer"></div>
            <div class="dark-overlay"></div>

            <div class="round-select-content">

                <div class="top-bar">
                    <div class="status">
                        <span class="status-dot"></span>
                        SYSTEM ONLINE
                    </div>

                    <div class="players">
                        PLAYERS <strong>1 / 12</strong>
                    </div>
                </div>

                <header>
                    <div class="small-label">TOURNAMENT SETUP</div>
                    <h1>SELECT<br><span>ROUND</span></h1>
                    <p>CHOOSE THE FIRST CHALLENGE</p>
                </header>

                <div class="round-list">
                    ${this.rounds.map((round, index) => `
                        <button
                            class="round-card ${index === 0 ? "selected" : ""}"
                            data-index="${index}"
                        >
                            <div class="round-number">${round.number}</div>

                            <div class="round-info">
                                <h2>${round.title}</h2>
                                <p>${round.description}</p>
                            </div>

                            <div class="arrow">▶</div>
                        </button>
                    `).join("")}
                </div>

                <footer>
                    <span>↑ ↓ SELECT</span>
                    <span>ENTER CONFIRM</span>
                    <span>ESC BACK</span>
                </footer>

            </div>
        `;

        document.body.appendChild(this.element);

        this.buttons = [
            ...this.element.querySelectorAll(".round-card")
        ];

        this.buttons.forEach(button => {
            button.addEventListener("click", () => {
                this.selectedIndex = Number(button.dataset.index);
                this.updateSelection();
                this.activate();
            });
        });

        document.addEventListener("keydown", this.handleKeyDown);

        this.updateSelection();
    }

    updateSelection() {
        this.buttons.forEach((button, index) => {
            button.classList.toggle(
                "selected",
                index === this.selectedIndex
            );
        });
    }

    handleKeyDown(event) {
        switch (event.key) {

            case "ArrowUp":
                event.preventDefault();
                this.selectedIndex--;

                if (this.selectedIndex < 0) {
                    this.selectedIndex = this.buttons.length - 1;
                }

                this.updateSelection();
                break;

            case "ArrowDown":
                event.preventDefault();
                this.selectedIndex++;

                if (this.selectedIndex >= this.buttons.length) {
                    this.selectedIndex = 0;
                }

                this.updateSelection();
                break;

            case "Enter":
                event.preventDefault();
                this.activate();
                break;

            case "Escape":
                event.preventDefault();
                this.back();
                break;
        }
    }

    activate() {
        const selected = this.rounds[this.selectedIndex];

        if (selected.id === "ROUND_1") {
           window.location.href = "./game.html";
        }

        if (selected.id === "ROUND_2") {
             window.location.href = "./rounds/glassBridge/glassBridge.html";
        }

        if (selected.id === "ROUND_3") {
            this.callbacks.ROUND_3();
        }

        if (selected.id === "CUSTOM") {
            this.callbacks.CUSTOM();
        }
    }

    back() {
        this.destroy();
        this.callbacks.BACK();
    }

    destroy() {
        document.removeEventListener("keydown", this.handleKeyDown);

        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}