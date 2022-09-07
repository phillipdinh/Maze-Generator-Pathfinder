import React from "react";
import Node from "./Node";

function Maze(props) {
  const mazeInit = (col, row) => {
    const grid = [];
    for (let x = 0; x < col; x++) {
      const currRow = [];
      for (let y = 0; y < row; y++) {
        currRow.push(createNode(y, x));
      }
      grid.push(currRow);
    }
    return grid;
  };

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

  const [maze, setMaze] = React.useState(mazeInit(props.x, props.y));

  function resetMaze() {
    maze.map((row, rowIdx) => {
      row.map((node, colIdx) => {
        updateMaze(colIdx, rowIdx, "visited", false);
      });
    });
    updateMaze(props.x - 1, props.y - 1, "id", "finish");
    visitedCount.current = 0;
  }

  function getNeighbors(col, row) {
    return {
      top: row <= 0 ? [-1, -1] : [col, row - 1],
      right: col >= props.x - 1 ? [-1, -1] : [col + 1, row],
      bottom: row >= props.y - 1 ? [-1, -1] : [col, row + 1],
      left: col <= 0 ? [-1, -1] : [col - 1, row],
    };
  }

  function updateMaze(col, row, prop, update) {
    let copyMaze = [...maze];
    copyMaze[col][row][prop] = update;
    setMaze(copyMaze);
  }
  const list = React.useRef(new Array());
  const visitedCount = React.useRef(0);

  function checkNeighbors(col, row, neighbors) {
    return Object.keys(neighbors).filter((direction) => {
      const neighborIdx = neighbors[direction];
      if (neighborIdx[0] == -1 || neighborIdx[1] == -1) {
        return false;
      } else if (!maze[neighborIdx[0]][neighborIdx[1]].visited) {
        const goodNeighbor = maze[neighborIdx[0]][neighborIdx[1]];

        return goodNeighbor;
      }
      return false;
    });
  }

  function checkNeighborsSolve(col, row, neighbors) {
    return Object.keys(neighbors).filter((direction) => {
      const neighborIdx = neighbors[direction];
      if (
        neighborIdx[0] == -1 ||
        neighborIdx[1] == -1 ||
        maze[col][row][direction] == false
      ) {
        return false;
      } else if (!maze[neighborIdx[0]][neighborIdx[1]].visited) {
        const goodNeighbor = maze[neighborIdx[0]][neighborIdx[1]];

        return goodNeighbor;
      }
      return false;
    });
  }
  /////////////////////// Recursive ////////////////////////////////

  async function recursiveBackTrackDFS(col, row) {
    updateMaze(col, row, "id", "active");
    updateMaze(col, row, "visited", true);

    await delay(10);

    updateMaze(col, row, "id", "not-active");

    if (visitedCount.current < maze.length * maze[0].length) {
      const neighbors = getNeighbors(col, row);

      const goodNeighbors = checkNeighbors(col, row, neighbors);
      const randNeighbor =
        goodNeighbors[Math.floor(Math.random() * goodNeighbors.length)];

      if (randNeighbor) {
        list.current.push([col, row]);
        visitedCount.current = visitedCount.current + 1;

        const oppD = oppDir[randNeighbor];

        let copyMaze = [...maze];
        copyMaze[col][row][randNeighbor] = true;

        neighbors[randNeighbor];

        if (!(oppD[0] == -1) && !(oppD[1] == -1)) {
          copyMaze[neighbors[randNeighbor][0]][neighbors[randNeighbor][1]][
            oppD
          ] = true;
        }

        setMaze(copyMaze);

        return recursiveBackTrackDFS(
          neighbors[randNeighbor][0],
          neighbors[randNeighbor][1]
        );
      }

      if (list.current.length > 0) {
        const lastNode = list.current.pop();

        return recursiveBackTrackDFS(lastNode[0], lastNode[1]);
      }
      return resetMaze();
    }
  }

  async function solveRBTDFS(col, row) {
    if (maze[col][row].id == "finish") {
      console.log("FINISH");
      return resetMaze();
    }

    updateMaze(col, row, "id", "active");
    updateMaze(col, row, "visited", true);

    await delay(10);

    if (visitedCount.current < maze.length * maze[0].length) {
      const neighbors = getNeighbors(col, row);

      const goodNeighbors = checkNeighborsSolve(col, row, neighbors);
      const randNeighbor =
        goodNeighbors[Math.floor(Math.random() * goodNeighbors.length)];

      if (randNeighbor) {
        list.current.push([col, row]);
        visitedCount.current = visitedCount.current + 1;

        return solveRBTDFS(
          neighbors[randNeighbor][0],
          neighbors[randNeighbor][1]
        );
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
    console.log(col, row);
    updateMaze(col, row, "id", "active");

    await delay(10);

    updateMaze(col, row, "id", "not-active");

    const neighbors = getNeighbors(col, row);
    const goodNeighbors = checkNeighbors(col, row, neighbors);

    goodNeighbors.map((direction) => {
      neighbors[direction].push(oppDir[direction]);
      list.current.push(neighbors[direction]);
    });

    updateMaze(col, row, "visited", true);

    do {
      if (list.current.length <= 0) {
        return resetMaze();
      }

      var randWall =
        list.current[Math.floor(Math.random() * list.current.length)];

      var index = list.current.indexOf(randWall);
      console.log(index);
      if (index > -1) {
        list.current.splice(index, 1);
      }

      var randWallNeighbors = getNeighbors(randWall[0], randWall[1]);
      var oppRandWall = randWallNeighbors[randWall[2]];
    } while (
      oppRandWall[0] == -1 ||
      oppRandWall[1] == -1 ||
      (maze[randWall[0]][[randWall[1]]].visited == true &&
        maze[oppRandWall[0]][oppRandWall[1]].visited == true)
    );

    updateMaze(oppRandWall[0], oppRandWall[1], oppDir[randWall[2]], true);

    updateMaze(randWall[0], randWall[1], randWall[2], true);

    return prim(randWall[0], randWall[1]);
  }

  async function primSolve(col, row) {
    if (maze[col][row].id == "finish") {
      console.log("FINISH");
      return resetMaze();
    }
    updateMaze(col, row, "id", "active");

    await delay(10);

    //updateMaze(col, row, "id", "not-active");

    const neighbors = getNeighbors(col, row);

    const goodNeighbors = checkNeighborsSolve(col, row, neighbors);

    goodNeighbors.map((direction) => {
      list.current.push(neighbors[direction]);
    });

    updateMaze(col, row, "visited", true);

    do {
      if (list.current.length <= 0) {
        return resetMaze();
      }

      var randNeighbor =
        list.current[Math.floor(Math.random() * list.current.length)];

      var index = list.current.indexOf(randNeighbor);
      console.log(index);
      if (index > -1) {
        list.current.splice(index, 1);
      }
    } while (maze[randNeighbor[0]][[randNeighbor[1]]].visited == true);

    return primSolve(randNeighbor[0], randNeighbor[1]);
  }
  /////////////////////////////////////////////////////////////////////////

  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const styles = {
    display: "inline-grid",
    gridTemplateColumns: `repeat(${props.x}, 1fr)`,
  };

  return (
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
      <div className="maze-buttons">
        <div className="maze-button-labels">
          Generate Maze
          <button
            className="maze-button"
            onClick={() => recursiveBackTrackDFS(0, 0)}
          >
            DFS
          </button>
          <button className="maze-button" onClick={() => prim(0, 0)}>
            Prim
          </button>
        </div>

        <div>
          Solve Maze
          <button className="maze-button" onClick={() => solveRBTDFS(0, 0)}>
            DFS
          </button>
          <button className="maze-button" onClick={() => primSolve(0, 0)}>
            Prim
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(Maze);
