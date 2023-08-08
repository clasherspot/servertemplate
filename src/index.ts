import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { roomHandler } from "./room";
import { routeHandler } from "./routes";

const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
}).sockets;

routeHandler(app);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  roomHandler(socket);

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, async () => {
  console.log(`Listening to the server on ${port}`);
});
