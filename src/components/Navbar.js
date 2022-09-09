import React from "react";
import logo from "../maze.png";

export default function Navbar() {
  return (
    <nav>
      <img src={logo} className="nav--logo" />
      <h1 className="page-title">Maze Generator & Path Finder</h1>
    </nav>
  );
}
