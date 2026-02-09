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

// Raw JSON data (from levels.json).
let levelsData;

// Array of Level instances.
let levels = [];

// Current level index.
let li = 0;

// Player instance (tile-based).
let player;

function preload() {
  // Ensure level data is ready before setup runs.
  levelsData = loadJSON("levels.json");
}

function setup() {
  /*
  Convert raw JSON grids into Level objects.
  levelsData.levels is an array of 2D arrays. 
  */
  levels = levelsData.levels.map((grid) => {
    const lvl = new Level(copyGrid(grid), TS);
    placeRandomObstacle(lvl);
    return lvl;
  });

  // Create a player.
  player = new Player(TS);

  // Load the first level (sets player start + canvas size).
  loadLevel(0);

  noStroke();
  textFont("sans-serif");
  textSize(14);
}

function draw() {
  background(240);

  // Draw current level then player on top.
  levels[li].draw();
  player.draw();

  drawHUD();
}

function drawHUD() {
  // HUD matches your original idea: show level count and controls.
  fill(0);
  text(`Level ${li + 1}/${levels.length} — WASD/Arrows to move`, 10, 16);
}

function keyPressed() {
  /*
  Convert key presses into a movement direction. (WASD + arrows)
  */
  let dr = 0;
  let dc = 0;

  if (keyCode === LEFT_ARROW || key === "a" || key === "A") dc = -1;
  else if (keyCode === RIGHT_ARROW || key === "d" || key === "D") dc = 1;
  else if (keyCode === UP_ARROW || key === "w" || key === "W") dr = -1;
  else if (keyCode === DOWN_ARROW || key === "s" || key === "S") dr = 1;
  else return; // not a movement key

  // Try to move. If blocked, nothing happens.
  const moved = player.tryMove(levels[li], dr, dc);

  // If the player moved onto a goal tile, advance levels.
  if (moved && levels[li].isGoal(player.r, player.c)) {
    nextLevel();
  }
}

// ----- Level switching -----

function loadLevel(idx) {
  li = idx;

  const level = levels[li];

  // Place player at the level's start tile (2), if present.
  if (level.start) {
    player.setCell(level.start.r, level.start.c);
  } else {
    // Fallback spawn: top-left-ish (but inside bounds).
    player.setCell(1, 1);
  }

  // Ensure the canvas matches this level’s dimensions.
  resizeCanvas(level.pixelWidth(), level.pixelHeight());
}

function nextLevel() {
  // Wrap around when we reach the last level.
  const next = (li + 1) % levels.length;
  loadLevel(next);
}

// ----- Utility -----

function copyGrid(grid) {
  /*
  Make a deep-ish copy of a 2D array:
  - new outer array
  - each row becomes a new array

  Why copy?
  - Because Level constructor may normalize tiles (e.g., replace 2 with 0)
  - And we don’t want to accidentally mutate the raw JSON data object. 
  */
  return grid.map((row) => row.slice());
}

function pathExists(level, start, goal) {
  const visited = Array.from({ length: level.rows() }, () =>
    Array(level.cols()).fill(false),
  );

  const queue = [];
  queue.push(start);
  visited[start.r][start.c] = true;

  const dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];

  while (queue.length > 0) {
    const cur = queue.shift();

    if (cur.r === goal.r && cur.c === goal.c) return true;

    for (const d of dirs) {
      const nr = cur.r + d.r;
      const nc = cur.c + d.c;

      if (!level.inBounds(nr, nc)) continue;
      if (visited[nr][nc]) continue;
      if (level.isWall(nr, nc)) continue;

      visited[nr][nc] = true;
      queue.push({ r: nr, c: nc });
    }
  }

  return false;
}

function placeRandomObstacle(level) {
  const floors = [];

  let goal = null;

  for (let r = 0; r < level.rows(); r++) {
    for (let c = 0; c < level.cols(); c++) {
      const t = level.tileAt(r, c);
      if (t === 0) floors.push({ r, c });
      if (t === 3) goal = { r, c };
    }
  }

  // Shuffle candidate tiles
  floors.sort(() => random() - 0.5);

  for (const cell of floors) {
    // Try placing obstacle
    level.grid[cell.r][cell.c] = 4;

    if (pathExists(level, level.start, goal)) {
      return; // success!
    }

    // Undo if it blocks the path
    level.grid[cell.r][cell.c] = 0;
  }
}
