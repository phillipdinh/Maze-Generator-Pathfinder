import React from "react";
import Node from "./Node";

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const oppDir = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const createNode = (row, col) => {
  return {
    col,
    row,
    top: false,
    bottom: false,
    left: false,
    right: false,
    visited: false,
    id: "not-active",
  };
};

const mazeInit = () => {
  const grid = [];
  for (let x = 0; x < 15; x++) {
    const currRow = [];
    for (let y = 0; y < 15; y++) {
      currRow.push(createNode(y, x));
    }
    grid.push(currRow);
  }
  return grid;
};

//////////////////// Maze Component ///////////////////////////////
export default function Maze() {
  function clearMaze() {
    setMaze(mazeInit());
  }

  function resetMaze() {
    maze.map((row, rowIdx) => {
      row.map((node, colIdx) => {
        updateMaze(colIdx, rowIdx, "visited", false);
      });
    });
    updateMaze(14, 14, "id", "finish");
    visitedCount.current = 0;
  }

  function updateMaze(col, row, prop, update) {
    let copyMaze = [...maze];
    copyMaze[col][row][prop] = update;
    setMaze(copyMaze);
  }

  function getNeighbors(col, row) {
    return {
      top: row <= 0 ? [-1, -1] : [col, row - 1],
      right: col >= 14 ? [-1, -1] : [col + 1, row],
      bottom: row >= 14 ? [-1, -1] : [col, row + 1],
      left: col <= 0 ? [-1, -1] : [col - 1, row],
    };
  }

  function checkNeighbors(col, row, neighbors, solve) {
    return Object.keys(neighbors).filter((direction) => {
      const neighborIdx = neighbors[direction];

      if (neighborIdx[0] == -1 || neighborIdx[1] == -1) {
        return false;
      }
      if (solve && maze[col][row][direction] == false) {
        return false;
      } else if (!maze[neighborIdx[0]][neighborIdx[1]].visited) {
        const goodNeighbor = maze[neighborIdx[0]][neighborIdx[1]];

        return goodNeighbor;
      }
      return false;
    });
  }

  async function setNewNode(col, row) {
    updateMaze(col, row, "id", "active");
    updateMaze(col, row, "visited", true);
    await delay(10);
  }

  const [maze, setMaze] = React.useState(mazeInit());
  const list = React.useRef(new Array());
  const visitedCount = React.useRef(0);

  /////////////////////// Recursive Back Track ////////////////////////////////
  async function RBT_DFS(col, row) {
    await setNewNode(col, row);
    updateMaze(col, row, "id", "not-active");

    if (visitedCount.current < maze.length * maze[0].length) {
      const neighbors = getNeighbors(col, row);

      const goodNeighbors = checkNeighbors(col, row, neighbors, false);
      const randDir = getRand(goodNeighbors);

      if (randDir) {
        list.current.push([col, row]);
        visitedCount.current = visitedCount.current + 1;

        const oppD = oppDir[randDir];
        const randNeighbor = neighbors[randDir];

        updateMaze(col, row, randDir, true);
        updateMaze(randNeighbor[0], randNeighbor[1], oppD, true);

        return RBT_DFS(randNeighbor[0], randNeighbor[1]);
      }

      if (list.current.length > 0) {
        const lastNode = list.current.pop();
        return RBT_DFS(lastNode[0], lastNode[1]);
      }

      return resetMaze();
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////
  /////////////////////// Solve Recursive Back Track ////////////////////////////////
  async function solveRBTDFS(col, row) {
    if (maze[col][row].id == "finish") {
      console.log("FINISH");
      return resetMaze();
    }

    await setNewNode(col, row);

    if (visitedCount.current < maze.length * maze[0].length) {
      const neighbors = getNeighbors(col, row);

      const goodNeighbors = checkNeighbors(col, row, neighbors, true);

      const randDir = getRand(goodNeighbors);

      if (randDir) {
        list.current.push([col, row]);
        visitedCount.current = visitedCount.current + 1;

        return solveRBTDFS(neighbors[randDir][0], neighbors[randDir][1]);
      } else {
        updateMaze(col, row, "id", "not-active");
      }

      if (list.current.length > 0) {
        const lastNode = list.current.pop();
        return solveRBTDFS(lastNode[0], lastNode[1]);
      }
    }
  }

  //////////////////////////////////////////////////////////////////
  /////////////////////// Prim's ///////////////////////////////////

  async function prim(col, row) {
    await setNewNode(col, row);
    updateMaze(col, row, "id", "not-active");

    const neighbors = getNeighbors(col, row);
    const goodNeighbors = checkNeighbors(col, row, neighbors, false);

    goodNeighbors.map((direction) => {
      neighbors[direction].push(oppDir[direction]);
      list.current.push(neighbors[direction]);
    });

    do {
      if (list.current.length <= 0) {
        return resetMaze();
      }
      var randWall = getRand(list.current);
      var randWallNeighbors = getNeighbors(randWall[0], randWall[1]);
      var oppWall = randWallNeighbors[randWall[2]];

      var index = list.current.indexOf(randWall);
      if (index > -1) {
        list.current.splice(index, 1);
      }
    } while (
      oppWall[0] == -1 ||
      oppWall[1] == -1 ||
      (maze[randWall[0]][randWall[1]].visited == true &&
        maze[oppWall[0]][oppWall[1]].visited == true)
    );

    updateMaze(oppWall[0], oppWall[1], oppDir[randWall[2]], true);
    updateMaze(randWall[0], randWall[1], randWall[2], true);

    return prim(randWall[0], randWall[1]);
  }
  //////////////////////////////////////////////////////////////////

  const styles = {
    display: "inline-grid",
    gridTemplateColumns: `repeat(${15}, 1fr)`,
  };

  return (
    <div className="maze-container">
      <div className="maze-button-div">
        <div className="maze-generate-div">
          <p className="maze-button-header">Generate</p>
          <button className="maze-button" onClick={() => RBT_DFS(0, 0)}>
            DFS
          </button>
          <button className="maze-button" onClick={() => prim(0, 0)}>
            Prim
          </button>
        </div>

        <div className="maze-solve-div">
          <p className="maze-button-header">Solve</p>
          <button className="maze-button" onClick={() => solveRBTDFS(0, 0)}>
            DFS
          </button>
        </div>
      </div>

      <div className="maze-div">
        <div style={styles} className="maze">
          {maze.map((block, rowIdx) => {
            return (
              <div key={rowIdx}>
                {block.map((node, nodeIdx) => {
                  const { col, row, top, bottom, left, right, visited, id } =
                    node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={row}
                      top={top}
                      bottom={bottom}
                      left={left}
                      right={right}
                      visited={visited}
                      id={id}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        <button className="clear-maze-button" onClick={() => clearMaze()}>
          Clear Maze
        </button>
      </div>
    </div>
  );
}
