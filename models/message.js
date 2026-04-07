const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({

  roomId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "Room"

  },

  sender: String,

  text: String,

  isRead: {

    type: Boolean,

    default: false

  },

  timeStamp: {

    type: Date,

    default: Date.now

  }

});

module.exports = mongoose.model('Message',messageSchema)