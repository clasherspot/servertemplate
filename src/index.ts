import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { roomHandler } from "./room";
import { routeHandler } from "./routes";

const port = 2001;
const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/joyws",
}).sockets;

routeHandler(app);

io.on("connection", (socket) => {
  roomHandler(socket);
});

server.listen(port, async () => {
  console.log(`Listening to the server on ${port}`);
});
