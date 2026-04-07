const express = require("express");
const http = require("http");
const {initSocket} = require("./socket.js");
const authRoutes = require("./routes/authRoutes.js");
const authMiddleware = require("./Middlewares/authMiddleware.js");

const app = express();
const server = http.createServer(app);
const connectDB = require("./config/db.js")
const Message = require("./models/message.js");
const { errorMonitor } = require("events");
const room = require("./models/room.js");
const User = require("./models/user.js")

app.use(express.json());  
initSocket(server);
app.use("/auth", authRoutes);

app.get("/",(req,res)=>{
    res.send("Chat server is running! Connect via Socket.IO")
});
const PORT = 3000
server.listen(PORT, () => {
  console.log(`HTTP Server is running on http://localhost:${PORT}`);
  console.log(` Socket.IO is ready for connections on port ${PORT}`);
  connectDB();
});
app.get("/message/:roomId", authMiddleware, async (req, res) => {
  try {
    const myUsername = req.user.username;  
    const roomId     = req.params.roomId;
     const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;
    const existingRoom = await room.findOne({ _id : roomId });

    if (!existingRoom) {
      return res.status(404).json({
        message: "Room not found"
      });
    }
    if (!existingRoom.members.includes(myUsername)) {
      return res.status(403).json({
        message: "You are not allowed to see these messages"
      });
    }
    const messages = await Message.find({ roomId }) .sort({ timestamp: 1 }).skip(skip)

.limit(limit);
    await Message.updateMany(
      {
        roomId: roomId,
        sender: { $ne: myUsername },
        isRead: false
      },{$set :
      { isRead: true } },
    );

    return res.json({ success: true,page,limit, messages });

  } catch (err) {
    return res.status(500).json({
      error: `Error while getting messages: ${err.message}`
                                              
    });
  }
});

app.get("/rooms", authMiddleware, async (req, res) => {
  try {
    const allRooms = await room.find({ isActive: true });

    return res.json({ success: true, rooms: allRooms });

  } catch (err) {
    return res.status(500).json({
      error: `Error while getting rooms: ${err.message}`
    
    });
  }
});



app.post("/createRoom", authMiddleware, async (req, res) => {
  try {
    const myUsername     = req.user.username; 
    const { friendName } = req.body;          
    if (!friendName) {
      return res.status(400).json({
        message: "friendName is required"
      });
    }
    const friendExists = await User.findOne({ username: friendName });

    if (!friendExists) {
      return res.status(404).json({
        message: "Friend not found"
      });
    }
    const existingRoom = await room.findOne({
      members: { $all: [myUsername, friendName] }
    });

    if (existingRoom) {
      return res.json({
        message: "Room already exists",
        room: existingRoom
      });
    }
    const roomId = [myUsername, friendName].sort().join("_");

    const newRoom = await room.create({
      roomId,
      members:   [myUsername, friendName],
      createdBy: myUsername
    });

    return res.status(201).json({
      message: "Room created successfully",
      room:    newRoom
    });

  } catch (err) {
    return res.status(500).json({
      error: `Error while creating room: ${err.message}`
    });
  }
});
 app.get("/chatlist", authMiddleware, async (req, res) => {

  try {

    const myUsername = req.user.username;
     const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const chatList = await room.aggregate([

      {
        $match: {

          members: myUsername,

          isActive: true

        }

      },


      {
        $sort: {

          "lastMessage.timeStamp": -1}

        },
        {
  $skip: skip
},

{
  $limit: limit
},

      
      {
        $addFields: {

          friendUsername: {

            $arrayElemAt: [

              {

                $filter: {

                  input: "$members",

                  as: "member",

                  cond: {

                    $ne: ["$$member", myUsername]

                  }

                }

              },

              0

            ]

          }

        }

      },
      {
        $lookup: {

          from: "users",

          localField: "friendUsername",

          foreignField: "username",

          as: "friendData"

        }

      },


      {
        $unwind: "$friendData"
      },
      {
        $lookup: {

          from: "messages",

          let: {

            roomObjectId: "$_id",

            friendUsername: "$friendUsername"

          },

          pipeline: [

            {

              $match: {

                $expr: {

                  $and: [

                    {

                      $eq: [

                        { $toString: "$roomId" },

                        { $toString: "$$roomObjectId" }

                      ]

                    },

                    {

                      $eq: ["$sender", "$$friendUsername"]

                    },

                    {

                      $eq: ["$isRead", false]

                    }

                  ]

                }

              }

            },

            {

              $count: "total"

            }

          ],

          as: "unreadMessages"

        }

      },
      {
        $addFields: {

          unreadCount: {

            $ifNull: [

              {

                $arrayElemAt: [

                  "$unreadMessages.total",

                  0

                ]

              },

              0

            ]

          }

        }

      },
      {
        $lookup: {

          from: "users",

          localField: "lastMessage.sender",

          foreignField: "username",

          as: "senderData"

        }

      },


      {
        $unwind: {

          path: "$senderData",

          preserveNullAndEmptyArrays: true

        }

      },
      {
        $project: {

          roomId: "$_id",

          friendName: "$friendData.username",

          friendId: "$friendData._id",

          isOnline: "$friendData.isOnline",

          lastSeen: "$friendData.lastSeen",

          unreadCount: 1,

          lastMessage: {

            text: "$lastMessage.text",

            sender: "$lastMessage.sender",

            senderId: "$senderData._id",

            timeStamp: "$lastMessage.timeStamp"

          }

        }

      }

    ]);


    res.json({

      success: true,
      page,

      limit,

      chatList

    });

  }

  catch (err) {

    res.status(500).json({

      error: err.message

    });

  }

});