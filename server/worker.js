/* eslint-disable no-undef */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (
      url.pathname === '/ws' &&
      request.headers.get('Upgrade') === 'websocket'
    ) {
      return handleUpgrade(request);
    }
    return new Response('Tic Tac Toe Relay — connect via /ws', { status: 200 });
  },
};

const rooms = new Map();

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateCode = () => {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const send = (ws, data) => {
  try {
    ws.send(JSON.stringify(data));
  } catch (_) {}
};

function handleUpgrade(request) {
  const [client, server] = Object.values(new WebSocketPair());

  server.accept();

  let currentRoom = null;
  let isHost = false;

  server.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'create_room') {
        let code;
        do {
          code = generateCode();
        } while (rooms.has(code));
        rooms.set(code, { host: server, guest: null });
        currentRoom = code;
        isHost = true;
        send(server, { type: 'room_created', code });
        return;
      }

      if (data.type === 'join_room') {
        const room = rooms.get(data.code);
        if (!room || room.guest) {
          send(server, { type: 'error', message: 'Room not found or full' });
          return;
        }
        room.guest = server;
        currentRoom = data.code;
        isHost = false;
        send(server, { type: 'joined', symbol: 'O' });
        send(room.host, { type: 'opponent_joined' });
        return;
      }

      if (data.type === 'restart') {
        if (!currentRoom) return;
        const room = rooms.get(currentRoom);
        if (!room) return;
        send(room.host, { type: 'restarted' });
        if (room.guest) send(room.guest, { type: 'restarted' });
        return;
      }

      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      if (!room) return;
      const target = isHost ? room.guest : room.host;
      if (target) send(target, data);
    } catch (_) {}
  });

  server.addEventListener('close', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        const target = isHost ? room.guest : room.host;
        if (target) send(target, { type: 'opponent_disconnected' });
        rooms.delete(currentRoom);
      }
    }
  });

  return new Response(null, { status: 101, webSocket: client });
}
