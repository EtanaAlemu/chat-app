// src/App.js
import React, { useState } from "react";
import Auth from "./Auth";
import Chat from "./Chat";

const App = () => {
  const [token, setToken] = useState(null);

  const handleLogin = (jwt) => {
    setToken(jwt);
  };

  return (
    <div>
      {!token ? <Auth onLogin={handleLogin} /> : <Chat token={token} />}
    </div>
  );
};

export default App;
