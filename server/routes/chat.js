const express = require("express");
const router = express.Router();
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/auth"); // Authentication middleware

// Create a group chat room
router.post("/group", protect, async (req, res) => {
  const { creator, isPublic, members } = req.body;

  try {
    const chatRoom = new ChatRoom({
      type: "Group",
      created: { creator },
      isPublic,
      members: members.map((member) => ({ userId: member })),
    });

    await chatRoom.save();
    res.status(201).json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create or get a P2P chat room
router.post('/p2p', async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    let chatRoom = await ChatRoom.findOrCreateP2P(user1, user2);

    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Send a message
router.post('/message', async (req, res) => {
  const { username, message, roomId, sender } = req.body;

  try {
    const newMessage = new Message({
      username,
      message,
      room: roomId,
      sender,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all groups
router.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching groups" });
  }
});

module.exports = router;
