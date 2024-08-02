const Message = require("./models/Message");
const ChatRoom = require("./models/ChatRoom");

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("New user connected", socket.user.username);

    // Send all previous messages for the rooms the user is a part of
    const chatRooms = await ChatRoom.find({
      "members.userId": socket.user._id,
    });
    for (const room of chatRooms) {
      const messages = await Message.find({ room: room._id })
        .sort({ timestamp: 1 })
        .exec();
      socket.emit("previousMessages", { room: room._id, messages });
    }

    // Listen for incoming messages for P2P or group chat
    socket.on("newMessage", async (message) => {
      try {
        // Ensure data is an object
        const data =
          typeof message === "string" ? JSON.parse(message) : message;

        console.log("New message received: ", data);

        // Check if the room is P2P or Group
        const chatRoom = await ChatRoom.findById(data.room);

        if (!chatRoom) {
          console.error("Chat room not found");
          return;
        }

        // Check if the user is a member of the chat room
        const isMember = chatRoom.members.some(
          (member) => member.userId.toString() === socket.user._id.toString()
        );

        if (!isMember) {
          console.error("User is not a member of this chat room");
          return;
        }

        // Validate the type of chat room and members
        if (chatRoom.type === "P2P" && chatRoom.members.length !== 2) {
          console.error("Invalid P2P chat room configuration");
          return;
        }

        const newMessage = new Message({
          username: socket.user.username,
          message: data.message,
          room: data.room, // Room can be P2P or group
          sender: socket.user._id, // Add sender information
          status: "sent", // Set the initial status of the message
          timestamp: new Date(), // Set the timestamp for the message
        });

        await newMessage.save();
        socket.emit("newMessage", newMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.user.username);
    });
  });
};
