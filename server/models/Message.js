// models/Message.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  room: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

module.exports = mongoose.model("Message", MessageSchema);
