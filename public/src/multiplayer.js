class Multiplayer {
  wsuri = "ws://127.0.0.1:1234/socket";
  playerList = null;
  gameId = null;
  id = null;

  constructor() {
    this.getInstance();
    this.playerChangedListeners = [];
  }

  init(payload) {
    this.players = payload.data.room.Participants;
    this.gameId = payload.data.room.ID;
    this.id = payload.data.id;
  }

  join(id, username) {
    return new Promise((resolve, reject) => {
      Multiplayer.socket.emit("join", { id, username });
      Multiplayer.socket.on("joinError", reject);
      Multiplayer.socket.on("joined", (payload) => {
        resolve(payload);
        this.init(payload);
      });
    });
  }

  create(username) {
    Multiplayer.socket.emit("create", { username });
  }

  start() {
    const id = this.gameId;
    return new Promise((resolve, reject) => {
      Multiplayer.socket.emit("start", { id });
      Multiplayer.socket.on("startError", reject);
      Multiplayer.socket.on("started", resolve);
    });
  }

  onReady(cb) {
    Multiplayer.socket.onopen = function () {
      cb();
    };
  }

  onCreated(cb) {
    Multiplayer.socket.on("created", (payload) => {
      cb(payload);
      this.init(payload);
    });
  }

  onJoined(cb) {
    Multiplayer.socket.on("joined", (payload) => {
      cb(payload);
      init(payload);
    });
  }

  onStarted(cb) {
    Multiplayer.socket.on("started", (payload) => {
      cb(payload);
    });
  }

  onNewPlayer() {
    Multiplayer.socket.on("newplayer", (payload) => {
      this.players = payload.data.room.Participants;
    });
  }

  onNewScore(cb) {
    Multiplayer.socket.on("newscore", (payload) => {
      cb(payload);
    });
  }

  newScore(score) {
    this.getPlayer(this.id).Score = score;
    Multiplayer.socket.emit("score", {
      client: this.id,
      id: this.gameId,
      score,
    });
  }

  updatePlayerScore(payload) {
    this.getPlayer(payload.data.client).Score = payload.data.score;
  }

  addPlayerChangedListener(listener) {
    this.playerChangedListeners.push(listener);
  }

  set players(player) {
    this.playerList = player;
    this.playerChangedListeners.forEach((listener) => {
      listener(player);
    });
  }

  getPlayer(id) {
    return this.playerList.filter((player) => player.ID == id)[0];
  }

  //singleton pattern
  getInstance() {
    if (Multiplayer.instance) return Multiplayer.instance;
    Multiplayer.socket = new Socket(this.wsuri);
    Multiplayer.instance = this;
  }
}
