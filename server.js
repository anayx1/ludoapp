const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("user-joined", (data) => {
      socket.join(data);
    });

    socket.on("battle-joined", (data) => {
      const jsonData = JSON.parse(data)
      console.log("Battle joined", data);
      socket.broadcast.emit("battle-joined", jsonData);
      socket.to("admin").emit("update-stats");
    });

    socket.on("battle-created", (data) => {
      console.log("Battle created", data);
      socket.broadcast.emit("battle-created", data);
      socket.to("admin").emit("update-stats");
    });

    socket.on("battle-cancel", (data) => {
      console.log("Battle cancel", data);
      socket.broadcast.emit("battle-cancel", data);
      socket.to("admin").emit("update-stats");
    });

    socket.on("room-id-created", (data) => {
        console.log("Battle cancel", data);
        socket.broadcast.emit("room-id-created", data);
        socket.to("admin").emit("update-stats");
    });

    socket.on("battle-result", (data) => {
      console.log("Battle result", data);
      socket.broadcast.emit("battle-result", data);
      socket.to("admin").emit("update-stats");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
