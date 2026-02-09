/*
Week 4 — Example 4: Playable Maze (JSON + Level class + Player class)
Course: GBDA302
Instructors: Dr. Karen Cochrane and David Han
Date: Feb. 5, 2026

This is the "orchestrator" file:
- Loads JSON levels (preload)
- Builds Level objects
- Creates/positions the Player
- Handles input + level switching

It is intentionally light on "details" because those are moved into:
- Level.js (grid + drawing + tile meaning)
- Player.js (position + movement rules)

Based on the playable maze structure from Example 3
*/

const TS = 32;
let levelsData;
let levels = [];
let li = 0;
let player;

function preload() {
  levelsData = loadJSON("levels.json");
}

function setup() {
  createCanvas(1, 1);

  levels = levelsData.levels.map((grid) => {
    const lvl = new Level(copyGrid(grid), TS);
    placeRandomObstacle(lvl);
    return lvl;
  });

  player = new Player(TS);
  loadLevel(0);

  noStroke();
  textSize(14);
}

function draw() {
  background(240);
  levels[li].draw();
  player.draw();
  drawHUD();
}

function drawHUD() {
  fill(0);
  text(`Level ${li + 1}/${levels.length}`, 10, 16);
}

function keyPressed() {
  let dr = 0,
    dc = 0;

  if (keyCode === LEFT_ARROW || key === "a") dc = -1;
  else if (keyCode === RIGHT_ARROW || key === "d") dc = 1;
  else if (keyCode === UP_ARROW || key === "w") dr = -1;
  else if (keyCode === DOWN_ARROW || key === "s") dr = 1;
  else return;

  const moved = player.tryMove(levels[li], dr, dc);

  if (moved && levels[li].isGoal(player.r, player.c)) {
    nextLevel();
  }
}

function loadLevel(idx) {
  li = idx;
  const lvl = levels[li];

  if (lvl.start) player.setCell(lvl.start.r, lvl.start.c);
  else player.setCell(1, 1);

  resizeCanvas(lvl.pixelWidth(), lvl.pixelHeight());
}

function nextLevel() {
  loadLevel((li + 1) % levels.length);
}

// ----- Utility helpers -----

function copyGrid(grid) {
  return grid.map((row) => row.slice());
}

function placeRandomObstacle(level) {
  const floors = [];
  let goal = null;

  for (let r = 0; r < level.rows(); r++) {
    for (let c = 0; c < level.cols(); c++) {
      if (level.grid[r][c] === 0) floors.push({ r, c });
      if (level.grid[r][c] === 3) goal = { r, c };
    }
  }

  shuffle(floors, true);

  for (const cell of floors) {
    level.grid[cell.r][cell.c] = 4; // try obstacle

    if (pathExists(level, level.start, goal)) return;

    level.grid[cell.r][cell.c] = 0; // undo
  }
}

function pathExists(level, start, goal) {
  const visited = Array.from({ length: level.rows() }, () =>
    Array(level.cols()).fill(false),
  );

  const queue = [start];
  visited[start.r][start.c] = true;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const { r, c } = queue.shift();
    if (r === goal.r && c === goal.c) return true;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (!level.inBounds(nr, nc)) continue;
      if (visited[nr][nc]) continue;
      if (level.isWall(nr, nc)) continue;

      visited[nr][nc] = true;
      queue.push({ r: nr, c: nc });
    }
  }

  return false;
}
