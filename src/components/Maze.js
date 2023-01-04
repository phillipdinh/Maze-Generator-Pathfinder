import React from "react";
import Node from "./Node";

// TODO:
// Add Solve algorithms:
// Better colors
// Disable solve button if maze not generated or if already solved
// Add overlay for dijkstras
// Add info for each button
// Make the maze start and finish randomly

// Used to delay maze graphics
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Used by:
// RBT_DFS(), solveRBTDFS(), prim()
function getRand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Used by:
// RBT_DFS(), prim()
const oppDir = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

// Used by mazeInit and returns node object with props
const createNode = (row, col) => {
  return {
    col,
    row,
    top: false,
    bottom: false,
    left: false,
    right: false,
    visited: false,
    distance: Infinity,
    previousNode: null,
    id: "not-active",
  };
};

// Initializes 16 x 16 maze of nodes
// Each node has correct column and row,
// All 4 walls and visited are false,
// Id is not-active
const mazeInit = () => {
  const grid = [];
  for (let x = 0; x < 16; x++) {
    const currRow = [];
    for (let y = 0; y < 16; y++) {
      currRow.push(createNode(y, x));
    }
    grid.push(currRow);
  }
  return grid;
};

//////////////////// Maze Component ///////////////////////////////
export default function Maze() {
  // Initializes and set maze to new maze
  function clearMaze() {
    maze.map((row, rowIdx) => {
      row.map((node, colIdx) => {
        updateMaze(colIdx, rowIdx, "left", false);
        updateMaze(colIdx, rowIdx, "right", false);
        updateMaze(colIdx, rowIdx, "top", false);
        updateMaze(colIdx, rowIdx, "bottom", false);
        updateMaze(colIdx, rowIdx, "visited", false);
        updateMaze(colIdx, rowIdx, "distance", Infinity);
        updateMaze(colIdx, rowIdx, "id", "not-active");
      });
    });
    stepCount.current = 0;
  }

  // Set all nodes visited prop to false
  // Set [15, 15] node id prop to finish
  // Set visitedCount to 0
  function resetMaze() {
    maze.map((row, rowIdx) => {
      row.map((node, colIdx) => {
        updateMaze(colIdx, rowIdx, "visited", false);
      });
    });
    updateMaze(15, 15, "id", "finish");
    visitedCount.current = 0;
    list.current.length = 0;
    setLoadingState(false);
  }

  // Remove all walls in maze
  function emptyMaze() {
    maze.map((row, rowIdx) => {
      row.map((node, colIdx) => {
        updateMaze(colIdx, rowIdx, "left", true);
        updateMaze(colIdx, rowIdx, "right", true);
        updateMaze(colIdx, rowIdx, "top", true);
        updateMaze(colIdx, rowIdx, "bottom", true);
        if (rowIdx == 0) {
          updateMaze(colIdx, rowIdx, "top", false);
        } else if (rowIdx == 15) {
          updateMaze(colIdx, rowIdx, "bottom", false);
        }
        if (colIdx == 0) {
          updateMaze(colIdx, rowIdx, "left", false);
        } else if (colIdx == 15) {
          updateMaze(colIdx, rowIdx, "right", false);
        }
      });
    });
  }

  // Updates a nodes prop from the given column and row
  function updateMaze(col, row, prop, update) {
    let copyMaze = [...maze];
    copyMaze[col][row][prop] = update;
    setMaze(copyMaze);
  }

  // Return dict of neighbors at given column and row
  // No neighbor the value will be set to [-1, -1]
  function getNeighbors(col, row) {
    return {
      top: row <= 0 ? [-1, -1] : [col, row - 1],
      right: col >= 15 ? [-1, -1] : [col + 1, row],
      bottom: row >= 15 ? [-1, -1] : [col, row + 1],
      left: col <= 0 ? [-1, -1] : [col - 1, row],
    };
  }

  // Returns object with keys of neighbors and boolean values
  function checkNeighbors(col, row, neighbors, solve) {
    return Object.keys(neighbors).filter((direction) => {
      const neighborIdx = neighbors[direction];

      // If no neighbor return false
      if (neighborIdx[0] == -1 || neighborIdx[1] == -1) return false;

      // If function is used for solve and no neighbor
      if (solve && maze[col][row][direction] == false) return false;
      // If neighbor has not been visited return good neighbor
      else if (!maze[neighborIdx[0]][neighborIdx[1]].visited) {
        const goodNeighbor = maze[neighborIdx[0]][neighborIdx[1]];
        return goodNeighbor;
      }
      return false;
    });
  }

  // Sets node id to active and visited to true
  async function setNewNode(col, row) {
    updateMaze(col, row, "id", "active");
    updateMaze(col, row, "visited", true);
    await delay(100);
  }

  const [loadingState, setLoadingState] = React.useState(false);
  const [maze, setMaze] = React.useState(mazeInit());
  const list = React.useRef(new Array());
  const visitedCount = React.useRef(0);
  const stepCount = React.useRef(0);

  ///////////////////////////////////////////////////////////////////////
  /////////////////////////// Dijkstra's ////////////////////////////////
  async function dijkstras(col, row) {
    function updateUnvisitedNeighbors(node) {
      const neighbors = getNeighbors(node.col, node.row);
      const goodNeighbors = checkNeighbors(node.col, node.row, neighbors, true);

      for (const dir of goodNeighbors) {
        updateMaze(
          neighbors[dir][0],
          neighbors[dir][1],
          "distance",
          node.distance + 1
        );
        updateMaze(neighbors[dir][0], neighbors[dir][1], "previousNode", node);
      }
    }

    async function showShortestpath(visitedNodesInOrder) {
      for (const node of visitedNodesInOrder) {
        await setNewNode(node.col, node.row);
      }
    }
    function getNodesInShortestPathOrder(finishNode) {
      const nodesInShortestPathOrder = [];
      let currentNode = finishNode;
      while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.previousNode;
      }
      return nodesInShortestPathOrder;
    }

    // Start
    const visitedNodesInOrder = [];
    updateMaze(col, row, "distance", 0);

    // Get all nodes into list
    for (const row of maze) {
      for (const node of row) {
        list.current.push(node);
      }
    }

    while (list.current.length != 0) {
      stepCount.current = stepCount.current + 1;

      // Sort nodes by distance
      list.current.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);

      // Get closest node
      const closestNode = list.current.shift();

      // Done
      if (closestNode.distance === Infinity) {
        break;
      }

      if (closestNode.id == "finish") {
        console.log("FINISH");
        break;
        // reset later return resetMaze();
      }

      await setNewNode(closestNode.col, closestNode.row);
      updateMaze(closestNode.col, closestNode.row, "id", "done");
      visitedNodesInOrder.push(closestNode);

      updateUnvisitedNeighbors(closestNode);
    }
    const shortestPath = getNodesInShortestPathOrder(maze[15][15]);
    await showShortestpath(shortestPath);
    return resetMaze();
  }

  ///////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////
  /////////////////////// Recursive Back Track /////////////////////
  async function RBT_DFS(col, row) {
    clearMaze();
    backTrack(col, row);
    async function backTrack(col, row) {
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

          return backTrack(randNeighbor[0], randNeighbor[1]);
        }

        if (list.current.length > 0) {
          const lastNode = list.current.pop();
          return backTrack(lastNode[0], lastNode[1]);
        }

        return resetMaze();
      }
    }
  }

  /////////////////////// Solve ////////////////////////////////////
  async function solveRBTDFS(col, row) {
    stepCount.current = stepCount.current + 1;
    console.log(stepCount.current);

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
        updateMaze(col, row, "id", "done");
      }

      if (list.current.length > 0) {
        const lastNode = list.current.pop();
        return solveRBTDFS(lastNode[0], lastNode[1]);
      }
    }
  }
  /////////////////// Recursive Back Track /////////////////////////
  //////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////
  /////////////////////// Prim's ///////////////////////////////////

  async function prim(col, row) {
    clearMaze();
    recurse(col, row);

    async function recurse(col, row) {
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
          console.log("reset");
          console.log(list.current);
          return resetMaze();
        }

        var randWall = getRand(list.current);
        var randWallNeighbors = getNeighbors(randWall[0], randWall[1]);
        var oppWall = randWallNeighbors[randWall[2]];

        var index = list.current.indexOf(randWall);
        if (index > -1) list.current.splice(index, 1);
      } while (
        oppWall[0] == -1 ||
        oppWall[1] == -1 ||
        maze[randWall[0]][randWall[1]].visited == true
      );

      updateMaze(oppWall[0], oppWall[1], oppDir[randWall[2]], true);
      updateMaze(randWall[0], randWall[1], randWall[2], true);

      return recurse(randWall[0], randWall[1]);
    }
  }
  /////////////////////// Prim's ///////////////////////////////////
  //////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////
  //////////////////////////Recursive Division /////////////////////
  async function recurseDiv() {
    clearMaze();

    function chooseOrientation(width, height) {
      if (width < height) return "horizontal";
      else if (height < width) return "vertical";
      else {
        return Math.floor(Math.random() * 2) == 0 ? "horizontal" : "vertical";
      }
    }

    async function drawMaze(wx, wy, px, py, length, horizontal) {
      // direction
      const dx = horizontal ? 1 : 0;
      const dy = horizontal ? 0 : 1;

      for (let i = 0; i < length; i++) {
        await delay(1);
        if (wx != px || wy != py) {
          if (horizontal) {
            updateMaze(wx, wy, "bottom", false);
            updateMaze(wx, wy + 1, "top", false);
          } else {
            updateMaze(wx, wy, "right", false);
            updateMaze(wx + 1, wy, "left", false);
          }
        }
        wx += dx;
        wy += dy;
      }
    }
    async function divide(col, row, width, height, orientation) {
      if (width < 2 || height < 2) return;
      const horizontal = orientation == "horizontal";

      var wx = col + (horizontal ? 0 : Math.floor(Math.random() * (width - 2)));
      var wy =
        row + (horizontal ? Math.floor(Math.random() * (height - 2)) : 0);

      // passage
      const px = wx + (horizontal ? Math.floor(Math.random() * width) : 0);
      const py = wy + (horizontal ? 0 : Math.floor(Math.random() * height));

      // length of wall
      const length = horizontal ? width : height;

      await drawMaze(wx, wy, px, py, length, horizontal);

      var nx = col;
      var ny = row;

      var w = horizontal ? width : wx - col + 1;
      var h = horizontal ? wy - row + 1 : height;

      await divide(nx, ny, w, h, chooseOrientation(w, h));

      nx = horizontal ? col : wx + 1;
      ny = horizontal ? wy + 1 : row;

      w = horizontal ? width : col + width - wx - 1;
      h = horizontal ? row + height - wy - 1 : height;

      await divide(nx, ny, w, h, chooseOrientation(w, h));
    }
    emptyMaze();
    await divide(0, 0, 16, 16, chooseOrientation(16, 16));
    return resetMaze();
  }
  //////////////////////////Recursive Division //////////////////////////
  ///////////////////////////////////////////////////////////////////////

  const styles = {
    display: "inline-grid",
    gridTemplateColumns: `repeat(${16}, 1fr)`,
  };

  return (
    <div className="maze-container">
      <div className="maze-button-div">
        <div className="maze-generate-div">
          <p className="maze-button-header">Generate</p>

          <button
            className="maze-button"
            onClick={() => {
              setLoadingState(true);
              RBT_DFS(0, 0);
            }}
          >
            DFS
          </button>
          <button
            className="maze-button"
            onClick={() => {
              setLoadingState(true);
              recurseDiv();
            }}
          >
            Div
          </button>
          <button
            className="maze-button"
            onClick={() => {
              setLoadingState(true);
              prim(0, 0);
            }}
          >
            Prim
          </button>
        </div>

        <div className="maze-solve-div">
          <p className="maze-button-header">Solve</p>
          <button
            className="maze-button"
            onClick={() => {
              setLoadingState(true);
              solveRBTDFS(0, 0);
            }}
          >
            DFS
          </button>
          <button
            className="maze-button"
            onClick={() => {
              dijkstras(0, 0);
            }}
          >
            DIJ
          </button>
        </div>
        {loadingState && <div className="loading-overlay"></div>}
      </div>

      <div className="maze-div">
        <div style={styles} className="maze">
          {maze.map((block, rowIdx) => {
            return (
              <div key={rowIdx}>
                {block.map((node, nodeIdx) => {
                  const {
                    col,
                    row,
                    top,
                    bottom,
                    left,
                    right,
                    visited,
                    distance,
                    id,
                  } = node;
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
                      distance={distance}
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

        <div className="step-count">
          Steps:
          <p className="step-text"> {stepCount.current}</p>
        </div>
      </div>
    </div>
  );
}
