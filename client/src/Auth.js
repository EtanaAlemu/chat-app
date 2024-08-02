// src/Auth.js
import React, { useState } from "react";
import axios from "axios";

const Auth = ({ onLogin }) => {
  const [username, setUsername] = useState("etana");
  const [password, setPassword] = useState("1234");
  const [isRegistering, setIsRegistering] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        await axios.post("http://localhost:5000/api/auth/register", {
          username,
          password,
        });
        alert("Registration successful! Please log in.");
        setIsRegistering(false);
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          { username, password }
        );
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div>
      <h1>{isRegistering ? "Register" : "Login"}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
        <p>
          {isRegistering
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsRegistering((prev) => !prev)}
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;
