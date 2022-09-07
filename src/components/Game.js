import React from "react";
import Maze from "./Maze.js";

export default function Game() {
  const [formData, setFormData] = React.useState({
    x: "",
    y: "",
    submitted: false,
  });

  function handleChange(event) {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    // submitToApi(formData)
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        submitted: true,
      };
    });
  }

  return (
    <div className="game">
      <form className="size-form" onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Columns"
          name="x"
          value={formData.x}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Rows"
          onChange={handleChange}
          name="y"
          value={formData.y}
        />
        <button className="submit-button">Submit</button>
      </form>
      <div className="game-maze">
        Maze
        {formData.submitted && <Maze x={formData.x} y={formData.y} />}
      </div>
    </div>
  );
}
