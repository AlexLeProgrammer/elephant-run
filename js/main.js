/**
 * Elephant run | main script
 * @version 1.0.0
 */

"use strict";

//#region constants

// Get the canvas
const CANVAS = document.querySelector("canvas");
const CTX = CANVAS.getContext("2d");

// Road
const ROAD_WIDTH = 1000;
const ROAD_DEPTH = 900;
const ROAD_LOCATION = {x: -600, y: -100, z: -450};

// Player
const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 100;
const PLAYER_DEPTH = 100;

const PLAYER_DEFAULT_SPEED = 1;

const DEFAULT_PLAYER_LOCATION = {x: -200, y: 118, z: PLAYER_DEPTH / 2};

// Delta-time
const DEFAULT_FPS = 120;

//#endregion

//#region global-variables

// Player
let playerLocation = {x: 0, y: 0, z: 0};
let playerColumn = 0;

// Inputs
let leftPressed = false;
let rightPressed = false;
let forwardPressed = false;
let backwardPressed = false;

// Camera
let cameraLocation = {x: 0, y: 0};

// Delta-time
let deltaTime = 1;
let lastTick = performance.now();

//#endregion

/**
 * Adapt the canvas size to the window size.
 */
function updateCanvasSize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
}

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
    let box = new Path2D();
    CTX.fillRect(startPoint[0], startPoint[1], width, height);
    CTX.strokeRect(startPoint[0], startPoint[1], width, height);

    // Top side
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
 * Main function, it is executed every frame.
 */
function tick() {
    // Delta-time
    deltaTime = (performance.now() - lastTick) / (1000 / DEFAULT_FPS);
    lastTick = performance.now();

    // Update the canvas size
    updateCanvasSize();

    // Draw the road
    strokeBox(ROAD_LOCATION.x, ROAD_LOCATION.y, ROAD_LOCATION.z, ROAD_WIDTH, CANVAS.height, ROAD_DEPTH);

    // Draw the player
    if (leftPressed) {
        playerLocation.x -= PLAYER_DEFAULT_SPEED * deltaTime;
    }

    if (rightPressed) {
        playerLocation.x += PLAYER_DEFAULT_SPEED * deltaTime;
    }

    if (forwardPressed && playerColumn > 0) {
        playerColumn--;
        playerLocation.z = ROAD_DEPTH / 6 * playerColumn;
    }

    if (backwardPressed && playerColumn < 2) {
        playerColumn++;
        playerLocation.z = ROAD_DEPTH / 6 * playerColumn;
    }

    // Reset inputs
    forwardPressed = false;
    backwardPressed = false;

    strokeBox(DEFAULT_PLAYER_LOCATION.x, DEFAULT_PLAYER_LOCATION.y,
        DEFAULT_PLAYER_LOCATION.z + playerLocation.z, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_DEPTH);

    // Center of the canvas
    CTX.fillStyle = "black";
    CTX.fillRect(CANVAS.width / 2, CANVAS.height / 2, 10, 10);
}

// Start the game
setInterval(tick);

//#region Inputs

// Detect if a key is pressed
document.addEventListener("keydown", (e) => {
    // Left
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        leftPressed = true;
    }

    // Right
    if (e.key === "d"|| e.key === "D" || e.key === "ArrowRight") {
        rightPressed = true;
    }

    // Forward
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        //forwardPressed = true;
    }

    // Backward
    if (e.key === "s" ||e.key === "S" || e.key === "ArrowDown") {
        //backwardPressed = true;
    }
});

// Detect if a key is released
document.addEventListener("keyup", (e) => {
    // Left
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        leftPressed = false;
    }

    // Right
    if (e.key === "d"|| e.key === "D" || e.key === "ArrowRight") {
        rightPressed = false;
    }

    // Forward
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        forwardPressed = true;
    }

    // Backward
    if (e.key === "s" ||e.key === "S" || e.key === "ArrowDown") {
        backwardPressed = true;
    }
});

//#endregion
