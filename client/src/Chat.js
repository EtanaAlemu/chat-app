import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const [chatRooms, setChatRooms] = useState([]); // Store chat rooms
  const socket = useRef(null); // Use useRef to keep the socket instance

  useEffect(() => {
    // Initialize the socket connection once
    socket.current = io("http://localhost:5000/", {
      query: { token }, // Send the token with the connection
    });

    // Fetch chat rooms for the logged-in user
    const fetchChatRooms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`, // Send token for authentication
          },
        });
        const data = await response.json();
        setChatRooms(data); // Set the chat rooms state
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };

    fetchChatRooms();

    socket.current.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.current.on("newMessage", (message) => {
      console.log("New message received", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.current.on("previousMessages", ({ room, messages }) => {
      if (room === roomId) {
        console.log("Received previous messages", messages);

        setMessages(messages); // Set messages directly instead of appending
      }
    });

    return () => {
      socket.current.off("newMessage");
      socket.current.off("previousMessages");
      socket.current.disconnect();
    };
  }, [token]); // Add token as a dependency

  const handleRoomChange = (e) => {
    const selectedRoomId = e.target.value;
    setRoomId(selectedRoomId);
    setMessages([]); // Clear messages when changing room

    if (selectedRoomId) {
      // Request previous messages for the selected room
      socket.current.emit("requestPreviousMessages", { room: selectedRoomId });
    }
  };
  const sendMessage = (e) => {
    e.preventDefault();
    if (input && roomId) {
      socket.current.emit("newMessage", { message: input, room: roomId });
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: "You", message: input, self: true },
      ]);
      setInput("");
    }
  };

  return (
    <div>
      <h1>Chat Room</h1>
      <div>
        <select value={roomId} onChange={handleRoomChange}>
          <option value="">Select a chat room</option>
          {chatRooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.type === "Group"
                ? room.name
                : "P2P with " +
                  room.members
                    .map((member) => member.userId.username)
                    .join(", ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.self ? "right" : "left" }}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;