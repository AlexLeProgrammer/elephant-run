/**
 * Elephant run | main script
 * @version 1.0.0
 */

"use strict";

//#region constants

// Get the canvas
const CANVAS = document.querySelector("canvas");
const CTX = CANVAS.getContext("2d");

// Get the score text element
const SCORE_TEXT = document.querySelector("#score");

// Gravity
const GRAVITY_FORCE = 0.1;

// Road
const ROAD_WIDTH = 1000;
const ROAD_DEPTH = 900;
const ROAD_LOCATION = {x: -600, y: -100, z: -450};

// Player
const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 100;
const PLAYER_DEPTH = 100;

const PLAYER_DEFAULT_SPEED = 1;
const PLAYER_ACCELERATION = 0.0001;
const PLAYER_HORIZONTAL_SPEED = 6;
const PLAYER_JUMP_FORCE = 10;

const DEFAULT_PLAYER_LOCATION = {x: -200, y: 118, z: PLAYER_DEPTH / 2};

// Delta-time
const DEFAULT_FPS = 120;

// Walls
const WALL_MAX_WIDTH = 1000;
const WALL_MAX_HEIGHT = 500;
const LITTLE_WALL_MAX_HEIGHT = PLAYER_HEIGHT;

//#endregion

//#region global-variables

// Player
let playerLocation = {x: 0, y: DEFAULT_PLAYER_LOCATION.y, z: 0};
let playerYVelocity = 0;
let playerColumn = 0;
let playerGoalColumn = 0;
let playerSpeed = PLAYER_DEFAULT_SPEED;

// Inputs
let leftPressed = false;
let rightPressed = false;
let jumpPressed = false;

// Delta-time
let deltaTime = 1;
let lastTick = performance.now();

// Walls
let walls = [
    [],[],[]
];

let lastWallsStart = null;

//#endregion


/**
 * Convert degrees to radians.
 * @param degrees Number of degrees.
 * @return {number} The degrees in parameters converted in radians.
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Stroke a specified box.
 * @param x Location of the box in the X axis.
 * @param y Location of the box in the Y axis.
 * @param z Location of the box in the Z axis.
 * @param width Width of the box.
 * @param height Height of the box.
 * @param depth Depth of the box.
 */
function strokeBox(x, y, z, width, height, depth) {
    CTX.strokeStyle = "black";
    CTX.fillStyle = "white";
    let startPoint = [CANVAS.width / 2 + x - Math.cos(degToRad(45)) * z,
        CANVAS.height / 2 + y - Math.sin(degToRad(45)) * z];

    // Front side
    CTX.fillRect(startPoint[0], startPoint[1], width, height);
    CTX.strokeRect(startPoint[0], startPoint[1], width, height);

    // Top side
    let box = new Path2D();
    box.moveTo(startPoint[0], startPoint[1]);
    let leftUpPoint = [startPoint[0] - Math.cos(degToRad(45)) * (depth / 2),
        startPoint[1] - Math.sin(degToRad(45)) * (depth / 2)];
    box.lineTo(leftUpPoint[0], leftUpPoint[1]);
    box.lineTo(leftUpPoint[0] + width, leftUpPoint[1]);
    box.lineTo(startPoint[0] + width, startPoint[1]);
    box.lineTo(startPoint[0], startPoint[1]);

    // Left side
    box.moveTo(leftUpPoint[0], leftUpPoint[1]);
    box.lineTo(leftUpPoint[0], leftUpPoint[1] + height);
    box.lineTo(startPoint[0], startPoint[1] + height);
    box.lineTo(startPoint[0], startPoint[1]);
    box.closePath();

    CTX.fill(box);
    CTX.stroke(box);
}

/**
 * Create walls of a "wave".
 */
function createWalls() {
    let height = Math.floor(Math.random() * WALL_MAX_HEIGHT);

    let columnFull = [false, false, false];
    for (let i = 0; i < 3; i++) {
        if (Math.floor(Math.random() * 2)) {
            columnFull[i] = height > LITTLE_WALL_MAX_HEIGHT;
            walls[i].push({
                x: ROAD_WIDTH,
                y: DEFAULT_PLAYER_LOCATION.y + PLAYER_HEIGHT - height,
                width: Math.floor(Math.random() * WALL_MAX_WIDTH),
                height: height
            });
        }
    }

    if (columnFull[0] && columnFull[1] && columnFull[2]) {
        let index = Math.floor(Math.random() * 3);
        walls[index].splice(walls[index].length - 1, 1);
    } else if (!columnFull[0] && !columnFull[1] && !columnFull[2]) {
        createWalls();
    }
}

/**
 * @return {number} The distance between the nearest wall under the player.
 */
function getGroundDistance() {
    let minDist = null;
    for (let wall of walls[playerColumn]) {
        let dist = wall.y - playerLocation.y - PLAYER_HEIGHT
        if (wall.y >= playerLocation.y + PLAYER_HEIGHT &&
            DEFAULT_PLAYER_LOCATION.x + PLAYER_WIDTH > wall.x && DEFAULT_PLAYER_LOCATION.x < wall.x + wall.width &&
            (minDist === null || (dist >= 0 && dist < minDist))) {
            minDist = dist;
        }
    }

    if (minDist === null) {
         return DEFAULT_PLAYER_LOCATION.y - playerLocation.y;
    }

    return minDist;
}

/**
 * Main function, it is executed every frame.
 */
function tick() {
    // Delta-time
    deltaTime = (performance.now() - lastTick) / (1000 / DEFAULT_FPS);
    lastTick = performance.now();

    // Create new wall
    if (Math.floor(playerLocation.x) !== lastWallsStart && Math.floor(playerLocation.x) % (WALL_MAX_WIDTH * 2) === 0) {
        createWalls();
        lastWallsStart = Math.floor(playerLocation.x);
    }

    // Move
    for (let column of walls) {
        for (let wall of column) {
            wall.x -= playerSpeed * deltaTime;
        }
    }

    // Move the position of the player
    playerLocation.x += playerSpeed * deltaTime;

    // Accelerate
    playerSpeed += PLAYER_ACCELERATION;

    // Search if the player want to move in another column
    if (leftPressed && playerGoalColumn < 2 && playerColumn >= playerGoalColumn) {
        playerGoalColumn++;
    }

    if (rightPressed && playerGoalColumn > 0 && playerColumn <= playerGoalColumn) {
        playerGoalColumn--;
    }

    // Gravity + jump
    let groundDistance = getGroundDistance();
    if (groundDistance === 0) {
        if (jumpPressed) {
            playerYVelocity = -PLAYER_JUMP_FORCE;
        } else {
            playerYVelocity = 0;
        }
    } else if ((playerYVelocity + GRAVITY_FORCE) * deltaTime > groundDistance) {
        playerLocation.y += groundDistance;
        playerYVelocity = 0;
    } else {
        playerYVelocity += GRAVITY_FORCE;
    }

    playerLocation.y += playerYVelocity * deltaTime;

    // Reset inputs
    leftPressed = false;
    rightPressed = false;
    jumpPressed = false;

    // Change column
    if (Math.floor(playerLocation.z) !== Math.floor(ROAD_DEPTH / 6 * playerGoalColumn)) {
        if (Math.floor(playerLocation.z) < Math.floor(ROAD_DEPTH / 6 * playerGoalColumn)) {
            playerLocation.z += PLAYER_HORIZONTAL_SPEED * deltaTime;
        } else {
            playerLocation.z -= PLAYER_HORIZONTAL_SPEED * deltaTime;
        }
    } else {
        playerColumn = playerGoalColumn;
    }

    // Check if the player is in a wall
    for (let wall of walls[playerColumn]) {
        if (DEFAULT_PLAYER_LOCATION.x + PLAYER_WIDTH > wall.x &&
            DEFAULT_PLAYER_LOCATION.x < wall.x + wall.width &&
            playerLocation.y + PLAYER_HEIGHT > wall.y && playerLocation.y < wall.y + wall.height) {
            // Stop the game
            clearInterval(loop);
        }
    }

    // Delete walls out of range
    for (let column of walls) {
        for (let i = column.length - 1; i >= 0; i--) {
            let range = CANVAS.width < ROAD_WIDTH ? -ROAD_WIDTH : -CANVAS.width;
            if (column[i].x + column[i].width < range) {
                column.splice(i, 1);
            }
        }
    }

    //#region Display

    // Adapt the canvas size to the window size
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // Display the score
    let score = Math.floor(playerLocation.x / 20);
    let scoreString = "";
    if (score < 10000) {
        scoreString += "0";
        if (score < 1000) {
            scoreString += "0";
            if (score < 100) {
                scoreString += "0";
                if (score < 10) {
                    scoreString += "0";
                }
            }
        }
    }

    SCORE_TEXT.innerHTML = scoreString + score;

    // Draw the road
    strokeBox(ROAD_LOCATION.x, ROAD_LOCATION.y, ROAD_LOCATION.z, ROAD_WIDTH, CANVAS.height, ROAD_DEPTH);

    // Draw walls behind the player
    for (let wall of walls[2]) {
        strokeBox(wall.x, wall.y, ROAD_DEPTH / 6 * 2, wall.width, wall.height, ROAD_DEPTH / 3);
    }

    if (playerColumn < 2) {
        for (let wall of walls[1]) {
            strokeBox(wall.x, wall.y, ROAD_DEPTH / 6, wall.width, wall.height, ROAD_DEPTH / 3);
        }
    }

    if (playerColumn === 0) {
        for (let wall of walls[0]) {
            strokeBox(wall.x, wall.y, 0, wall.width, wall.height, ROAD_DEPTH / 3);
        }
    }

    // Draw the player
    strokeBox(DEFAULT_PLAYER_LOCATION.x, playerLocation.y,
        DEFAULT_PLAYER_LOCATION.z + playerLocation.z, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_DEPTH);

    // Draw the walls in front of the player
    for (let wall of walls[2]) {
        if (wall.x + wall.width - DEFAULT_PLAYER_LOCATION.x < 0) {
            strokeBox(wall.x, wall.y, ROAD_DEPTH / 6 * 2, wall.width, wall.height, ROAD_DEPTH / 3);
        }
    }

    for (let wall of walls[1]) {
        if (wall.x + wall.width - DEFAULT_PLAYER_LOCATION.x < 0 || playerColumn === 2) {
            strokeBox(wall.x, wall.y, ROAD_DEPTH / 6, wall.width, wall.height, ROAD_DEPTH / 3);
        }
    }

    for (let wall of walls[0]) {
        if (wall.x + wall.width - DEFAULT_PLAYER_LOCATION.x < 0 || playerColumn > 0) {
            strokeBox(wall.x, wall.y, 0, wall.width, wall.height, ROAD_DEPTH / 3);
        }
    }

    //#endregion
}

/*
walls[0] = [{x: ROAD_WIDTH - 500, y: DEFAULT_PLAYER_LOCATION.y + PLAYER_HEIGHT - 100, width: 500, height: 100}];
walls[1] = [{x: ROAD_WIDTH - 500, y: DEFAULT_PLAYER_LOCATION.y + PLAYER_HEIGHT - 100, width: 500, height: 100}];
walls[2] = [{x: ROAD_WIDTH - 500, y: DEFAULT_PLAYER_LOCATION.y + PLAYER_HEIGHT - 100, width: 500, height: 100}];
*/

// Start the game
let loop = setInterval(tick);

//#region Inputs

// Detect if a key is released
document.addEventListener("keyup", (e) => {
    // Left
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        leftPressed = true;
    }

    // Right
    if (e.key === "d"|| e.key === "D" || e.key === "ArrowRight") {
        rightPressed = true;
    }

    // Jump
    if (e.key === " " || e.key === "ArrowUp") {
        jumpPressed = true;
    }
});

//#endregion
