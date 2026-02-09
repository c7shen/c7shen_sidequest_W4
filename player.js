/*
Player.js

A Player stores the avatar position in grid coordinates (row/col)
and knows how to:
- draw itself
- attempt a move (tile-by-tile) with collision rules

The Player does NOT:
- load JSON
- switch levels
Those are "game orchestration" responsibilities that belong in sketch.js. 
*/

class Player {
  constructor(tileSize) {
    this.ts = tileSize;

    // Player position in grid coordinates
    this.r = 0;
    this.c = 0;

    // Movement timing to prevent rapid movement
    this.movedAt = 0;
    this.moveDelay = 90;
  }

  // Place player at a specific grid cell
  setCell(r, c) {
    this.r = r;
    this.c = c;
  }

  // Convert grid position to pixel center
  pixelX() {
    return this.c * this.ts + this.ts / 2;
  }

  pixelY() {
    return this.r * this.ts + this.ts / 2;
  }

  draw() {
    fill(20, 120, 255);
    circle(this.pixelX(), this.pixelY(), this.ts * 0.6);
  }

  // Attempt to move the player by one tile
  tryMove(level, dr, dc) {
    const now = millis();
    if (now - this.movedAt < this.moveDelay) return false;

    const nr = this.r + dr;
    const nc = this.c + dc;

    // Prevent moving out of bounds or into walls/obstacles
    if (!level.inBounds(nr, nc)) return false;
    if (level.isWall(nr, nc)) return false;

    this.r = nr;
    this.c = nc;
    this.movedAt = now;
    return true;
  }
}
