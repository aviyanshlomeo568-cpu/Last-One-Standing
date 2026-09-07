import { MainMenu } from "./mainMenu.js";
import { HowToPlay } from "./howToPlay.js";
import { RoundSelect } from "./roundSelect.js";

let currentScreen = null;


// ================================
// MAIN MENU
// ================================

function showMainMenu() {

    currentScreen?.destroy();

    currentScreen = new MainMenu({

        playersJoined: 1,
        maxPlayers: 12,

        // PLAY → ROUND SELECT
        onPlay: () => showRoundSelect(),

        onHowToPlay: () => showHowToPlay(),

        onSettings: () => {
            console.log("SETTINGS");
        },

        onBack: () => {
            console.log("BACK");
        }
    });

    currentScreen.mount();

    window.menu = currentScreen;
}


// ================================
// ROUND SELECT
// ================================

function showRoundSelect() {

    currentScreen?.destroy();

    currentScreen = new RoundSelect({

        onRound1: () => {
    window.location.href = "./game.html";
},

        onRound2: () => {
            console.log("ROUND 2 SELECTED");
        },

           onRound3: () => {
       window.location.href = "./rounds/finalStand/finalStand.html";
   },

        onCustom: () => {
            console.log("CUSTOM TOURNAMENT SELECTED");
        },

        // ESC → MAIN MENU
        onBack: () => showMainMenu()
    });

    currentScreen.mount();

    window.roundSelect = currentScreen;
}


// ================================
// HOW TO PLAY
// ================================

function showHowToPlay() {

    currentScreen?.destroy();

    currentScreen = new HowToPlay({

        onBack: () => showMainMenu()

    });

    currentScreen.mount();

    window.howToPlay = currentScreen;
}


// START
showMainMenu();