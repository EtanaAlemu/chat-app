// models/ChatRoom.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  type: {
    type: String,
    enum: ["P2P", "Group"],
    required: true,
  },
  name: {
    type: String,
    unique: function () {
      return this.type === "Group";
    },
    required: function () {
      return this.type === "Group";
    },
  },
  members: {
    type: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    validate: [
      function (members) {
        if (this.type === "P2P" && members.length !== 2) {
          return false;
        }
        return true;
      },
      "P2P chat rooms must have exactly two members",
    ],
  },
  created: {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "Group";
      },
    },
    at: { type: Date, default: Date.now },
  },
  isPublic: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

ChatRoomSchema.statics.findOrCreateP2P = async function (user1Id, user2Id) {
  const existingRoom = await this.findOne({
    type: "P2P",
    "members.userId": { $all: [user1Id, user2Id] },
  });

  if (existingRoom) {
    return existingRoom;
  }

  const newRoom = new this({
    type: "P2P",
    members: [{ userId: user1Id }, { userId: user2Id }],
  });

  await newRoom.save();
  return newRoom;
};

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
