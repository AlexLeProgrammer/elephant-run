/**
 * Elephant run | main script
 * @version 1.0.0
 */

"use strict";

//#region constants

// Get the canvas
const CANVAS = document.querySelector("canvas");
const CTX = CANVAS.getContext("2d");

// Level
const LEVEL_ROTATION_ANGLE = -45;

// Player
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLAYER_DEPTH = 50;

const PLAYER_DEFAULT_SPEED = 3;

const RENDER_DISTANCE = 1000000; // Maximal distance where elements are rendered

// Delta-time
const DEFAULT_FPS = 120;

//#endregion

//#region global-variables

// Player
let playerLocation = {x: 0, y: 0, z:0};

// Inputs
let leftPressed = false;
let rightPressed = false;
let forwardPressed = false;
let backwardPressed = false;

// Camera
let cameraX = 0;
let cameraY = 0;

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
 * Rotate a point around another.
 * @param x Coordinate of the point to rotate in the X axis.
 * @param y Coordinate of the point to rotate in the Y axis.
 * @param centerX Coordinate of the center in the X axis.
 * @param centerY Coordinate of the center in the Y axis.
 * @param rotation Degrees of the rotation.
 * @return {number[]} The rotated point location.
 */
function getRotatedPoint(x, y, centerX, centerY, rotation) {
    return [
        (x - centerX) * Math.cos(degToRad(rotation)) - (y - centerY) * Math.sin(degToRad(rotation)) + centerX,
        (x - centerX) * Math.sin(degToRad(rotation)) + (y - centerY) * Math.cos(degToRad(rotation)) + centerY
    ];
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
        forwardPressed = true;
    }

    // Backward
    if (e.key === "s" ||e.key === "S" || e.key === "ArrowDown") {
        backwardPressed = true;
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
        forwardPressed = false;
    }

    // Backward
    if (e.key === "s" ||e.key === "S" || e.key === "ArrowDown") {
        backwardPressed = false;
    }
});

//#endregion
