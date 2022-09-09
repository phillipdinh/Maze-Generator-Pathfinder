import "./App.css";
import React from "react";
import Maze from "./components/Maze.js";
import Navbar from "./components/Navbar.js";
import "./styles.css";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Maze />
    </div>
  );
}

export default App;
