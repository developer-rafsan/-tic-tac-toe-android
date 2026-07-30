/* eslint-disable no-undef */

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateCode = () => {
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export class GameRoom {
  constructor(state, env) {
    this.state = state;
    this.players = [];
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    server.accept();

    if (this.players.length === 0) {
      this.players.push(server);
      const code = this.state.id.name;
      server.send(JSON.stringify({ type: 'room_created', code }));

      server.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'restart') {
            this.players.forEach((p) => p.send(JSON.stringify({ type: 'restarted' })));
            return;
          }
          const other = this.players.find((p) => p !== server);
          if (other) other.send(JSON.stringify(data));
        } catch (_) {}
      });

      server.addEventListener('close', () => {
        const other = this.players.find((p) => p !== server);
        if (other) other.send(JSON.stringify({ type: 'opponent_disconnected' }));
        this.players = [];
      });
    } else if (this.players.length === 1) {
      this.players.push(server);
      server.send(JSON.stringify({ type: 'joined', symbol: 'O' }));
      this.players[0].send(JSON.stringify({ type: 'opponent_joined' }));

      server.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'restart') {
            this.players.forEach((p) => p.send(JSON.stringify({ type: 'restarted' })));
            return;
          }
          const other = this.players.find((p) => p !== server);
          if (other) other.send(JSON.stringify(data));
        } catch (_) {}
      });

      server.addEventListener('close', () => {
        const other = this.players.find((p) => p !== server);
        if (other) other.send(JSON.stringify({ type: 'opponent_disconnected' }));
        this.players = [];
      });
    } else {
      server.send(JSON.stringify({ type: 'error', message: 'Room full' }));
      server.close();
    }

    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      return new Response('Use /ws/create or /ws/join?code=XXXX', { status: 400 });
    }

    if (url.pathname === '/ws/create') {
      let code;
      do { code = generateCode(); } while (false);
      const id = env.GAME_ROOM.idFromName(code);
      const stub = env.GAME_ROOM.get(id);
      return stub.fetch(request);
    }

    if (url.pathname === '/ws/join') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });
      const id = env.GAME_ROOM.idFromName(code);
      const stub = env.GAME_ROOM.get(id);
      return stub.fetch(request);
    }

    return new Response('Tic Tac Toe Relay', { status: 200 });
  },
};
