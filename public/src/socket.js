class Socket extends WebSocket {
  channels;
  constructor(url, protocol) {
    super(url, protocol);
    this.id = null;
    this.channels = new Map();
    this.onmessage = async function (e) {
      //parse the blob to json object
      let response = await e.data.text();
      response = JSON.parse(response);
      //publish to the listeners
      this.getChannel(response.channel).forEach((listeners) => {
        listeners(response);
      });
    };
  }

  emit(channel, data) {
    const toEmit = JSON.stringify({ channel, data });
    this.send(toEmit);
  }

  //observer pattern to be implemented here
  on(channel, cb) {
    //subscribe the listener to the channel
    return this.addChannelListener(channel, cb);
  }

  getChannel(channel) {
    return this.channels.get(channel)
      ? this.channels.get(channel)
      : (function (that) {
          that.channels.set(channel, []);
          return that.channels.get(channel);
        })(this);
  }
  addChannelListener(channel, listener) {
    this.getChannel(channel).push(listener);
  }
}

//i want a user to create a game -- more like a room
// once the room is created , the user becomes the first particiapnat
//and other user that join that created game are added as participants to that room/goom
//event s are they=n subsequently shared among those particiapants in the room
