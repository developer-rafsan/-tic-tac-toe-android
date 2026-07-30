const RELAY_URL = 'wss://tictactoe-relay.onrender.com';

const COMMON_IPS = [
  '192.168.43.1', '192.168.0.1', '192.168.1.1',
  '192.168.43.2', '192.168.0.2', '192.168.1.2', '10.0.2.2',
];

const tryConnect = (url, timeout = 5000) => {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; ws.close(); resolve(null); }
    }, timeout);
    ws.onopen = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        const send = (data) => { try { ws.send(JSON.stringify(data)); } catch (_) {} };
        const close = () => { try { ws.close(); } catch (_) {} };
        resolve({ ws, send, close });
      }
    };
    ws.onerror = () => {
      if (!done) { done = true; clearTimeout(timer); resolve(null); }
    };
  });
};

export const connectRelay = async (onProgress) => {
  if (onProgress) onProgress('Connecting...');
  const relay = await tryConnect(RELAY_URL, 5000);
  if (relay) {
    if (onProgress) onProgress('Connected');
    return relay;
  }
  return null;
};

export const findServer = async (onProgress) => {
  for (const ip of COMMON_IPS) {
    if (onProgress) onProgress(`Trying ${ip}...`);
    const conn = await tryConnect(`ws://${ip}:3000`, 3000);
    if (conn) {
      if (onProgress) onProgress(`Found server at ${ip}`);
      return conn;
    }
  }
  return null;
};
