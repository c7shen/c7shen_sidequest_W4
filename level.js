/*
Level.js

A Level represents ONE maze grid loaded from levels.json. 

Tile legend (from your original example): 
0 = floor
1 = wall
2 = start
3 = goal
4 = obstacle

Responsibilities:
- Store the grid
- Find the start tile
- Provide collision/meaning queries (isWall, isGoal, inBounds)
- Draw the tiles (including a goal highlight)
*/

class Level {
  constructor(grid, tileSize) {
    this.grid = grid;
    this.ts = tileSize;
    this.start = this.findStart();

    if (this.start) {
      this.grid[this.start.r][this.start.c] = 0;
    }
  }

  rows() {
    return this.grid.length;
  }
  cols() {
    return this.grid[0].length;
  }

  pixelWidth() {
    return this.cols() * this.ts;
  }
  pixelHeight() {
    return this.rows() * this.ts;
  }

  inBounds(r, c) {
    return r >= 0 && c >= 0 && r < this.rows() && c < this.cols();
  }

  tileAt(r, c) {
    return this.grid[r][c];
  }

  isWall(r, c) {
    const t = this.tileAt(r, c);
    return t === 1 || t === 4;
  }

  isGoal(r, c) {
    return this.tileAt(r, c) === 3;
  }

  findStart() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        if (this.grid[r][c] === 2) {
          return { r, c };
        }
      }
    }
    return null;
  }

  draw() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        const v = this.grid[r][c];

        if (v === 1)
          fill(30, 50, 60); // wall
        else if (v === 4)
          fill(160, 60, 60); // obstacle
        else fill(232); // floor

        rect(c * this.ts, r * this.ts, this.ts, this.ts);

        if (v === 3) {
          fill(255, 200, 120, 200);
          rect(c * this.ts + 4, r * this.ts + 4, this.ts - 8, this.ts - 8, 6);
        }
      }
    }
  }
}
