import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const socket = useRef(null); // Use useRef to keep the socket instance

  useEffect(() => {
    // Initialize the socket connection once
    socket.current = io("http://localhost:5000/", {
      query: { token }, // Send the token with the connection
    });

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

        setMessages((prevMessages) => [...prevMessages, ...messages]);
      }
    });

    return () => {
      socket.current.off("newMessage");
      socket.current.off("previousMessages");
      socket.current.disconnect();
    };
  }, [token, roomId]); // Add token as a dependency

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

        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Type a Room ID..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
