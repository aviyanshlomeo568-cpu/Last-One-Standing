// ============================================================
// LAST ONE STANDING
// NETWORKING
// Supabase Realtime phone controller
// ============================================================

const SUPABASE_URL =
  'https://vdefxwfauerkdjekbqwy.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_f-6TD_ck1FI-D-TBODmUOQ_y9sm93s1';

const CHANNEL_NAME =
  'loststanding-controller';

let supabaseClient = null;
let gameChannel = null;

const listeners = {
  JOIN: [],
  READY: [],
  MOVE: [],
  RUN: [],
  RUN_RELEASE: [],
  JUMP: [],
  PUSH: [],
  ABILITY: []
};


// ============================================================
// CONNECT
// ============================================================

export async function connectNetworking() {

  console.log(
    '[networking] Starting connection...'
  );


  // ----------------------------------------------------------
  // Make sure Supabase exists.
  // ----------------------------------------------------------

  if (!window.supabase) {

    console.error(
      '[networking] window.supabase DOES NOT EXIST.'
    );

    console.error(
      '[networking] Make sure Supabase CDN is loaded in game/index.html.'
    );

    return false;
  }


  console.log(
    '[networking] Supabase library found.'
  );


  // ----------------------------------------------------------
  // Create client
  // ----------------------------------------------------------

  try {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

  } catch (error) {

    console.error(
      '[networking] Failed to create Supabase client:',
      error
    );

    return false;
  }


  // ----------------------------------------------------------
  // Create channel
  // ----------------------------------------------------------

  gameChannel =
    supabaseClient.channel(
      CHANNEL_NAME,
      {
        config: {
          broadcast: {
            self: true
          }
        }
      }
    );


  // ----------------------------------------------------------
  // Receive controller messages
  // ----------------------------------------------------------

  gameChannel.on(
    'broadcast',
    {
      event: 'controller-event'
    },
    ({ payload }) => {

      console.log(
        '[networking] RECEIVED:',
        payload
      );


      if (
        !payload ||
        !payload.type
      ) {
        return;
      }


      const callbacks =
        listeners[payload.type];


      if (!callbacks) {
        return;
      }


      for (
        const callback of callbacks
      ) {

        try {

          callback(payload);

        } catch (error) {

          console.error(
            '[networking] Listener error:',
            error
          );
        }
      }
    }
  );


  // ----------------------------------------------------------
  // Subscribe
  // ----------------------------------------------------------

  return new Promise((resolve) => {

    gameChannel.subscribe(
      (status) => {

        console.log(
          '[networking] CHANNEL STATUS:',
          status
        );


        if (
          status === 'SUBSCRIBED'
        ) {

          console.log(
            '========================================'
          );

          console.log(
            '🎮 GAME CONNECTED TO PHONE CONTROLLER'
          );

          console.log(
            '========================================'
          );

          resolve(true);
        }


        if (
          status === 'CHANNEL_ERROR'
        ) {

          console.error(
            '[networking] CHANNEL ERROR'
          );

          resolve(false);
        }


        if (
          status === 'TIMED_OUT'
        ) {

          console.error(
            '[networking] CHANNEL TIMED OUT'
          );

          resolve(false);
        }
      }
    );

  });
}


// ============================================================
// REGISTER LISTENER
// ============================================================

export function onNetworkMessage(
  type,
  callback
) {

  if (
    !listeners[type]
  ) {

    listeners[type] = [];
  }


  listeners[type].push(
    callback
  );


  console.log(
    `[networking] Listener registered: ${type}`
  );


  // Return unsubscribe function.
  return () => {

    const index =
      listeners[type].indexOf(
        callback
      );


    if (
      index !== -1
    ) {

      listeners[type].splice(
        index,
        1
      );
    }
  };
}


// ============================================================
// SEND MESSAGE FROM GAME
// ============================================================

export async function sendNetworkMessage(
  payload
) {

  if (
    !gameChannel
  ) {

    console.warn(
      '[networking] Cannot send. Channel not connected.'
    );

    return;
  }


  try {

    await gameChannel.send({
      type: 'broadcast',
      event: 'game-event',
      payload
    });

  } catch (error) {

    console.error(
      '[networking] Send error:',
      error
    );
  }
}