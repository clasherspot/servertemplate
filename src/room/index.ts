import { Socket } from "socket.io";
const rooms: any = {};
const messages: any = {};

export const roomHandler = (socket: Socket) => {
  const room: any = socket.handshake.query.room;

  rooms[room] =
    (rooms[room] && rooms[room].set(socket.id, socket)) ||
    new Map().set(socket.id, socket);
  messages[room] = messages[room] || [];

  // connectedPeers.set(socket.id, socket)

  console.log(socket.id);
  socket.emit("connection-success", {
    success: socket.id,
    peerCount: rooms[room].size,
    messages: messages[room],
  });

  // const broadcast = () => socket.broadcast.emit('joined-peers', {
  //   peerCount: connectedPeers.size,
  // })
  const broadcast = () => {
    const _connectedPeers = rooms[room];

    for (const [_socketID, _socket] of _connectedPeers.entries()) {
      // if (socketID !== socket.id) {
      _socket.emit("joined-peers", {
        peerCount: rooms[room].size, // connectedPeers.size,
      });
      // }
    }
  };
  broadcast();

  // const disconnectedPeer = (socketID) => socket.broadcast.emit('peer-disconnected', {
  //   peerCount: connectedPeers.size,
  //   socketID: socketID
  // })
  const disconnectedPeer = (socketID: any) => {
    const _connectedPeers = rooms[room];
    for (const [_socketID, _socket] of _connectedPeers.entries()) {
      _socket.emit("peer-disconnected", {
        peerCount: rooms[room].size,
        socketID,
      });
    }
  };

  socket.on("new-message", (data) => {
    console.log("new-message", JSON.parse(data.payload));

    messages[room] = [...messages[room], JSON.parse(data.payload)];
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    // connectedPeers.delete(socket.id)
    rooms[room].delete(socket.id);
    messages[room] = rooms[room].size === 0 ? null : messages[room];
    disconnectedPeer(socket.id);
  });

  socket.on("onlinePeers", (data) => {
    const _connectedPeers = rooms[room];
    for (const [socketID, _socket] of _connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID.local) {
        console.log("online-peer", data.socketID, socketID);
        socket.emit("online-peer", socketID);
      }
    }
  });

  socket.on("offer", (data) => {
    const _connectedPeers = rooms[room];
    for (const [socketID, _socket] of _connectedPeers.entries()) {
      // don't send to self
      if (socketID === data.socketID.remote) {
        // console.log('Offer', socketID, data.socketID, data.payload.type)
        _socket.emit("offer", {
          sdp: data.payload,
          socketID: data.socketID.local,
        });
      }
    }
  });

  socket.on("answer", (data) => {
    const _connectedPeers = rooms[room];
    for (const [socketID, _socket] of _connectedPeers.entries()) {
      if (socketID === data.socketID.remote) {
        console.log("Answer", socketID, data.socketID, data.payload.type);
        _socket.emit("answer", {
          sdp: data.payload,
          socketID: data.socketID.local,
        });
      }
    }
  });

  socket.on("candidate", (data) => {
    const _connectedPeers = rooms[room];
    // send candidate to the other peer(s) if any
    for (const [socketID, _socket] of _connectedPeers.entries()) {
      if (socketID === data.socketID.remote) {
        _socket.emit("candidate", {
          candidate: data.payload,
          socketID: data.socketID.local,
        });
      }
    }
  });
};
