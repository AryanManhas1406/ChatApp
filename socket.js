
const { Server } = require('socket.io');
const Message = require("./models/message");
const Room = require('./models/room');
const jwt        = require("jsonwebtoken");
const User       = require("./models/user.js");

const mongoose = require("mongoose");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

function initSocket (server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
io.use(async (socket, next) => {
    try {
      console.log(" Checking token...");
      const authHeader = socket.handshake.headers.authorization;
      console.log("Auth header:", authHeader);

      if (!authHeader) {
        console.log(" No authorization header found");
        return next(new Error("No token provided"));
      }
      const token = authHeader.split(" ")[1];

      if (!token) {
        return next(new Error("Token format wrong. Use: Bearer <token>"));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(" Token verified for user:", decoded.id);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      console.log(` Socket authenticated: ${user.username}`);

      next();

    } catch (err) {
      console.log(" Auth failed:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const username = socket.user.username;
    console.log(` ${username} connected | socket.id: ${socket.id}`);

    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });


   const mongoose = require("mongoose");

socket.on("join_room", async ({ roomId }) => {

  const username = socket.user.username;

  const room = await Room.findById(roomId);

  if (!room) {

    socket.emit("error", { message: "Room not found" });

    return;

  }

  if (!room.members.includes(username)) {

    socket.emit("error", { message: "Not allowed" });

    return;

  }

  socket.join(roomId);

  socket.data.roomId = roomId;

  console.log(`${username} joined ${roomId}`);

  await Message.updateMany(

    {

      roomId: new mongoose.Types.ObjectId(roomId),

      sender: { $ne: username },

      isRead: false

    },

    {

      $set: { isRead: true }

    }

  );

});

socket.on("send_message", async ({ message }) => {

  const sender = socket.user.username;

  const roomId = socket.data.roomId;

  if (!roomId) {

    socket.emit("error", { message: "Join room first" });

    return;

  }
  const roomSockets = io.sockets.adapter.rooms.get(roomId);

  let isReceiverInRoom = false;

  if (roomSockets && roomSockets.size > 1) {

    isReceiverInRoom = true;

  }
  const savedMessage = await Message.create({

    roomId: new mongoose.Types.ObjectId(roomId),

    sender: sender,

    text: message,

    isRead: isReceiverInRoom,

    timeStamp: new Date()

  });

  await Room.findByIdAndUpdate(

    roomId,

    {

      $set: {

        lastMessage: {

          text: message,

          sender: sender,

          timeStamp: new Date()

        }

      }

    }

  );
  socket.to(roomId).emit("receive_message", {

    text: message,

    sender: sender,

    timeStamp: savedMessage.timeStamp,

    isRead: savedMessage.isRead

  });


  console.log(

    `message saved | read status: ${savedMessage.isRead}`

  );

});
    socket.on("disconnect", async (reason) => {
      const username = socket.user?.username;

      await User.findByIdAndUpdate(
        socket.user._id,
        { isOnline: false, lastSeen: new Date() }
      );

      const roomId = socket.data.roomId;
      if (roomId) {
        socket.to(roomId).emit("user_left", {
          message: ` ${username} disconnected`
        });
      }

      console.log(` ${username} disconnected | Reason: ${reason}`);
    });
  });
}



module.exports = { initSocket };
