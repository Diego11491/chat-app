const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
let users = {};

app.use(cors());
app.use(express.json());

app.get("/api/messages", (req, res) => {
  res.json({ message: "Servidor funcionando con WebSocket" });
});

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on("setUsername", (username) => {
    username = username.trim() || "Anónimo";
    users[socket.id] = username;
    console.log(`${username} se unió al chat.`);
    io.emit("userList", Object.values(users));
  });

  socket.on("chatMessage", (msg) => {
    const sender = users[socket.id] || "Anónimo";
    io.emit("chatMessage", { sender, msg });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      console.log(`${users[socket.id]} se desconectó.`);
      delete users[socket.id];
      io.emit("userList", Object.values(users));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

