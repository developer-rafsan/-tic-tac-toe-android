const { WebSocketServer } = require('ws');

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

const rooms = {};

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const send = (ws, data) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
};

const broadcast = (room, data) => {
  room.players.forEach((p) => send(p, data));
};

const WIN_CONDITIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWinner = (board) => {
  for (const cond of WIN_CONDITIONS) {
    if (
      board[cond[0]] &&
      board[cond[0]] === board[cond[1]] &&
      board[cond[0]] === board[cond[2]]
    ) {
      return board[cond[0]];
    }
  }
  return null;
};

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.symbol = null;

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (_) {
      return;
    }

    switch (data.type) {
      case 'create_room': {
        let code;
        do {
          code = generateCode();
        } while (rooms[code]);
        rooms[code] = {
          players: [ws],
          board: Array(9).fill(''),
          turn: 'X',
        };
        ws.roomCode = code;
        ws.symbol = 'X';
        send(ws, { type: 'room_created', code });
        console.log(`Room created: ${code}`);
        break;
      }

      case 'join_room': {
        const room = rooms[data.code];
        if (!room) {
          return send(ws, { type: 'error', message: 'Room not found' });
        }
        if (room.players.length >= 2) {
          return send(ws, { type: 'error', message: 'Room is full' });
        }
        room.players.push(ws);
        ws.roomCode = data.code;
        ws.symbol = 'O';
        send(ws, { type: 'joined', symbol: 'O' });
        send(room.players[0], { type: 'opponent_joined', symbol: 'O' });
        console.log(`${data.code}: Player joined`);
        break;
      }

      case 'move': {
        const room = rooms[ws.roomCode];
        if (!room) return;
        if (room.turn !== ws.symbol) {
          return send(ws, { type: 'error', message: 'Not your turn' });
        }
        if (room.board[data.index] !== '') {
          return send(ws, { type: 'error', message: 'Cell already taken' });
        }
        room.board[data.index] = ws.symbol;
        room.turn = room.turn === 'X' ? 'O' : 'X';

        broadcast(room, {
          type: 'move_made',
          index: data.index,
          symbol: ws.symbol,
          board: [...room.board],
          turn: room.turn,
        });

        const winner = checkWinner(room.board);
        const draw = !winner && room.board.every((c) => c !== '');

        if (winner || draw) {
          broadcast(room, { type: 'game_over', winner, draw: !!draw });
          console.log(`${ws.roomCode}: Game over - ${winner ? `Winner ${winner}` : 'Draw'}`);
        }
        break;
      }

      case 'move_made':
      case 'game_over': {
        const room = rooms[ws.roomCode];
        if (room) {
          room.players.forEach((p) => {
            if (p !== ws) send(p, data);
          });
        }
        break;
      }
      case 'restart': {
        const room = rooms[ws.roomCode];
        if (!room) return;
        room.board = Array(9).fill('');
        room.turn = 'X';
        broadcast(room, {
          type: 'restarted',
          board: [...room.board],
          turn: room.turn,
        });
        console.log(`${ws.roomCode}: Game restarted`);
        break;
      }
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (code && rooms[code]) {
      broadcast(rooms[code], { type: 'opponent_disconnected' });
      delete rooms[code];
      console.log(`Room closed: ${code}`);
    }
  });

  ws.on('error', () => {});
});

console.log(`Tic Tac Toe Server running on port ${PORT}`);
console.log(`Connect via: ws://<your-ip>:${PORT}`);
