import "./App.css";
import React from "react";
import Game from "./components/Game.js";
import Navbar from "./components/Navbar.js";
import "./styles.css";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Game />
    </div>
  );
}

export default App;
