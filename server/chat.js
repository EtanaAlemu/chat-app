const Message = require("./models/Message");

module.exports = (io) => {
  io.on("connection", async (socket) => {
    try {
      console.log("New user connected", socket.user.username);

      // Send all previous messages to the connected user for P2P and group chats
      const userRooms = await getUserRooms(socket.user._id); // Function to get rooms user is part of
      for (const room of userRooms) {
        const messages = await Message.find({ room })
          .sort({ timestamp: 1 })
          .exec();
        socket.emit("previousMessages", { room, messages });
      }
    } catch (err) {
      console.error(err);
    }

    // Join a room (P2P or group)
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`${socket.user.username} joined room: ${room}`);
    });

    // Listen for incoming messages for P2P or group chat
    socket.on("sendMessage", async (data) => {
      try {
        const newMessage = new Message({
          username: socket.user.username,
          message: data.message,
          room: data.room, // Room can be P2P or group
        });

        await newMessage.save();
        io.to(data.room).emit("newMessage", newMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.user.username);
    });
  });
};

// Function to get rooms user is part of (example implementation)
async function getUserRooms(userId) {
  // Example: Fetch user rooms from the database
  // Here you would have a logic to fetch the rooms the user is part of
  return ["room1", "room2"]; // Replace with actual logic
}
