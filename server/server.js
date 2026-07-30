const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tic Tac Toe Relay');
});

const wss = new WebSocketServer({ server });

const rooms = {};

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const send = (ws, data) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
};

const broadcast = (room, data) => {
  room.players.forEach((p) => send(p, data));
};

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.symbol = null;

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch (_) { return; }

    switch (data.type) {
      case 'create_room': {
        let code;
        do { code = generateCode(); } while (rooms[code]);
        rooms[code] = { players: [ws], board: Array(9).fill(''), turn: 'X' };
        ws.roomCode = code;
        ws.symbol = 'X';
        send(ws, { type: 'room_created', code });
        break;
      }
      case 'join_room': {
        const room = rooms[data.code];
        if (!room) return send(ws, { type: 'error', message: 'Room not found' });
        if (room.players.length >= 2) return send(ws, { type: 'error', message: 'Room is full' });
        room.players.push(ws);
        ws.roomCode = data.code;
        ws.symbol = 'O';
        send(ws, { type: 'joined', symbol: 'O' });
        send(room.players[0], { type: 'opponent_joined', symbol: 'O' });
        break;
      }
      case 'move_made':
      case 'game_over': {
        const room = rooms[ws.roomCode];
        if (room) room.players.forEach((p) => { if (p !== ws) send(p, data); });
        break;
      }
      case 'restart': {
        const room = rooms[ws.roomCode];
        if (!room) return;
        room.board = Array(9).fill('');
        room.turn = 'X';
        broadcast(room, { type: 'restarted', board: [...room.board], turn: room.turn });
        break;
      }
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (code && rooms[code]) {
      broadcast(rooms[code], { type: 'opponent_disconnected' });
      delete rooms[code];
    }
  });

  ws.on('error', () => {});
});

server.listen(PORT, () => {
  console.log(`Tic Tac Toe Server running on port ${PORT}`);
});
