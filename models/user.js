const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username:       { type: String, required: true, unique: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  fcmToken:       { type: String, default: "" },
  isOnline:       { type: Boolean, default: false },
  lastSeen:       { type: Date,    default: Date.now },
  followerCount:  { type: Number,  default: 0 },
  followingCount: { type: Number,  default: 0 },
  createdAt:      { type: Date,    default: Date.now }
});

module.exports = mongoose.model("User", userSchema);