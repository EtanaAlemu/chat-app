const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./conf/db");
const Message = require("./models/Message");
const dotenv = require("dotenv");
const chat = require("./chat");
const authRoutes = require("./routes/auth");
const { protect } = require("./middleware/auth");
const jwt = require("jsonwebtoken"); // Add this line
const User = require("./models/User"); // Add this line

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to Database
connectDB();

// Middleware
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);

// Chat logic
io.use(async (socket, next) => {
    try {
      if (!socket.handshake.query.token) {
        throw new Error("No token provided");
      }

      const token = socket.handshake.query.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user and attach to the socket
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        throw new Error("User not found");
      }

      socket.user = user;
      console.log(`User connected: ${user.id} (${user.username})`);
      next();
    } catch (err) {
        console.error(err);
        return next(new Error('Authentication error'));
    }
});

// Chat logic
chat(io);

// Serve frontend (if any)
app.get("/", (req, res) => {
  res.send("Chat server is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
