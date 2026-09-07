// ============================================================
// LAST ONE STANDING - PHONE CONTROLLER
// ============================================================

const SUPABASE_URL = 'https://vdefxwfauerkdjekbqwy.supabase.co';
const SUPABASE_ANON_KEY =
  'sb_publishable_f-6TD_ck1FI-D-TBODmUOQ_y9sm93s1';

console.log('[controller] SCRIPT STARTED');

// ------------------------------------------------------------
// SUPABASE
// ------------------------------------------------------------

if (!window.supabase) {
  console.error('[controller] Supabase library NOT FOUND');
} else {
  console.log('[controller] Supabase library found');
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const CHANNEL_NAME = 'loststanding-controller';

const gameChannel = supabaseClient.channel(CHANNEL_NAME);

// Listen for messages sent back FROM the game (e.g. our assigned
// player number). Registered before subscribe() so nothing is missed.
gameChannel.on('broadcast', { event: 'game-event' }, ({ payload }) => {
  console.log('[controller] GAME EVENT:', payload);

  if (!payload || payload.playerId !== playerId) {
    return;
  }

  if (payload.type === 'ASSIGNED') {
    session.playerNumber = payload.playerNumber;
    updatePlayerNumberUI();
  }
});

gameChannel.subscribe((status) => {
  console.log('[controller] Supabase status:', status);
});

// ------------------------------------------------------------
// PLAYER ID
// ------------------------------------------------------------

function getPlayerId() {
  let id = localStorage.getItem('los_player_id');

  if (!id) {
    id =
      'player-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 10);

    localStorage.setItem('los_player_id', id);
  }

  return id;
}

const playerId = getPlayerId();

console.log('[controller] Player ID:', playerId);

// ------------------------------------------------------------
// SESSION
// (created before DOM setup since it doesn't depend on it)
// ------------------------------------------------------------

const session = {
  id: playerId,
  name: null,
  joined: false,
  ready: false,
  playerNumber: null
};

// ------------------------------------------------------------
// BROADCAST
// ------------------------------------------------------------

function broadcastMessage(payload) {
  const message = {
    ...payload,
    playerId: session.id,
    player: session.name
  };

  console.log('[controller] SENDING:', message);

  gameChannel.send({
    type: 'broadcast',
    event: 'controller-event',
    payload: message
  });
}

// ------------------------------------------------------------
// DOM / INIT
//
// Everything that touches the DOM lives inside initController(),
// which only runs once the document is actually ready. Running
// getElementById() calls before the page has finished parsing
// (e.g. a <script> without `defer` placed above the buttons in
// the HTML) silently returns null for anything below the script
// tag — that's the classic cause of "some buttons just don't
// work" bugs like the jump/push/run/ability buttons here.
// ------------------------------------------------------------

function initController() {

  const nameForm = document.getElementById('name-form');
  const nameInput = document.getElementById('name-input');

  const screenName = document.getElementById('screen-name');
  const screenReady = document.getElementById('screen-ready');
  const screenGame = document.getElementById('screen-game');

  const readyButton = document.getElementById('ready-button');

  const readyPlayerName =
    document.getElementById('ready-player-name');

  const readyPlayerNumber =
    document.getElementById('ready-player-number');

  const gamePlayerName =
    document.getElementById('game-player-name');

  const gamePlayerNumber =
    document.getElementById('game-player-number');

  console.log('[controller] DOM check:', {
    nameForm: !!nameForm,
    nameInput: !!nameInput,
    screenName: !!screenName,
    screenReady: !!screenReady,
    screenGame: !!screenGame,
    readyButton: !!readyButton
  });

  // ----------------------------------------------------------
  // SCREEN
  // ----------------------------------------------------------

  function showScreen(screen) {
    screenName?.classList.remove('is-active');
    screenReady?.classList.remove('is-active');
    screenGame?.classList.remove('is-active');

    screen?.classList.add('is-active');
  }

  // Exposed so the game-event listener (registered outside this
  // function) can refresh the number once it's assigned.
  window.__losUpdatePlayerNumberUI = () => {
    if (readyPlayerNumber) {
      readyPlayerNumber.textContent = session.playerNumber ?? '—';
    }
    if (gamePlayerNumber) {
      gamePlayerNumber.textContent = `Player ${session.playerNumber ?? '—'}`;
    }
  };

  // ----------------------------------------------------------
  // JOIN
  // ----------------------------------------------------------

  function handleJoin() {
    console.log('[controller] JOIN BUTTON PRESSED');

    if (!nameInput) {
      console.error('[controller] name-input NOT FOUND');
      return;
    }

    const name = nameInput.value.trim();

    console.log('[controller] Name:', name);

    if (!name) {
      alert('Please enter your name.');
      return;
    }

    if (name.length > 16) {
      alert('Name must be 16 characters or less.');
      return;
    }

    session.name = name;
    session.joined = true;

    localStorage.setItem('los_player_name', name);

    broadcastMessage({
      type: 'JOIN'
    });

    if (readyPlayerName) {
      readyPlayerName.textContent = name;
    }

    window.__losUpdatePlayerNumberUI();

    showScreen(screenReady);
  }

  if (nameForm) {
    nameForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleJoin();
    });

    console.log('[controller] Join form listener attached');
  } else {
    console.error('[controller] name-form NOT FOUND');
  }

  // ----------------------------------------------------------
  // READY
  // ----------------------------------------------------------

  if (readyButton) {
    readyButton.addEventListener('click', () => {
      if (!session.joined) return;
      if (session.ready) return;

      session.ready = true;

      broadcastMessage({
        type: 'READY'
      });

      if (gamePlayerName) {
        gamePlayerName.textContent = session.name;
      }

      window.__losUpdatePlayerNumberUI();

      showScreen(screenGame);
    });
  }

  // ----------------------------------------------------------
  // TOUCH RELIABILITY HELPER
  //
  // Buttons need `touch-action: none` (not just preventDefault)
  // or mobile browsers can swallow/delay the pointerdown while
  // deciding whether the gesture is actually a scroll. The
  // joystick already worked because it uses setPointerCapture;
  // give every action button the same treatment.
  // ----------------------------------------------------------

  function makeTouchReliable(el) {
    if (!el) return;
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.webkitTapHighlightColor = 'transparent';
  }

  // ----------------------------------------------------------
  // JOYSTICK
  // ----------------------------------------------------------

  const joystickBase =
    document.getElementById('joystick-base');

  const joystickKnob =
    document.getElementById('joystick-knob');

  let joystickActive = false;

  function sendMove(x, y) {
    broadcastMessage({
      type: 'MOVE',
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    });
  }

  function resetJoystick() {
    joystickActive = false;

    if (joystickKnob) {
      joystickKnob.style.transform =
        'translate(-50%, -50%)';
    }

    // Send an explicit hard zero (not just "whatever the last
    // computed value was") so release always fully stops movement,
    // even if the last pointermove before this reported a tiny
    // non-zero position.
    sendMove(0, 0);
  }

  if (joystickBase && joystickKnob) {

    makeTouchReliable(joystickBase);

    // Stick positions closer to center than this fraction of the
    // radius are treated as "not moving". Without this, a light
    // touch — or the last flicker of a pointermove event right
    // before the finger actually lifts — sends a tiny non-zero
    // value that the game still reads as "move a little", which is
    // what made the character drift/creep instead of stopping
    // cleanly.
    const JOYSTICK_DEADZONE = 0.12;

    function updateJoystick(clientX, clientY) {

      const rect = joystickBase.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;

      const radius = rect.width / 2;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) {
        dx = (dx / distance) * radius;
        dy = (dy / distance) * radius;
      }

      // Knob still visually tracks the finger exactly...
      joystickKnob.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      // ...but the value actually sent to the game is deadzoned,
      // so near-center jitter reads as "stopped".
      let x = dx / radius;
      let y = dy / radius;

      if (Math.hypot(x, y) < JOYSTICK_DEADZONE) {
        x = 0;
        y = 0;
      }

      sendMove(x, y);
    }

    joystickBase.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      joystickActive = true;
      joystickBase.setPointerCapture(event.pointerId);
      updateJoystick(event.clientX, event.clientY);
    });

    joystickBase.addEventListener('pointermove', (event) => {
      if (!joystickActive) return;
      updateJoystick(event.clientX, event.clientY);
    });

    joystickBase.addEventListener('pointerup', resetJoystick);
    joystickBase.addEventListener('pointercancel', resetJoystick);
  }

  // ----------------------------------------------------------
 // ----------------------------------------------------------
// STARTUP

  // ----------------------------------------------------------
  // RUN
  // ----------------------------------------------------------

    const actionButtons =
    document.querySelectorAll('.action-btn');

  console.log(
    '[controller] Action buttons found:',
    actionButtons.length
  );

  actionButtons.forEach((button) => {

    makeTouchReliable(button);

    const type = button.dataset.action;

    if (!type) {
      console.warn(
        '[controller] Action button has no data-action:',
        button
      );
      return;
    }

    console.log(
      '[controller] Setting up action button:',
      type
    );

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();

      button.classList.add('is-pressed');

      console.log(
        '[controller] BUTTON PRESSED:',
        type
      );

      broadcastMessage({
        type: type
      });
    });

    button.addEventListener('pointerup', (event) => {
      event.preventDefault();

      button.classList.remove('is-pressed');

      if (type === 'RUN') {
        console.log('[controller] RUN RELEASED');

        broadcastMessage({
          type: 'RUN_RELEASE'
        });
      }
    });

    button.addEventListener('pointercancel', (event) => {
      event.preventDefault();

      button.classList.remove('is-pressed');

      if (type === 'RUN') {
        broadcastMessage({
          type: 'RUN_RELEASE'
        });
      }
    });
  });

  // ----------------------------------------------------------
  // STARTUP
  // ----------------------------------------------------------

  const savedName = localStorage.getItem('los_player_name');

  if (savedName && nameInput) {
    nameInput.value = savedName;
  }

  showScreen(screenName);

  console.log('[controller] READY');
}

function updatePlayerNumberUI() {
  // window.__losUpdatePlayerNumberUI is set once initController()
  // has run; guard in case an ASSIGNED message arrives first.
  window.__losUpdatePlayerNumberUI?.();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initController);
} else {
  initController();
}
