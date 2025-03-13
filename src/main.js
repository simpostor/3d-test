// Import Three.js and the PointerLockControls module
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup PointerLockControls for first-person movement
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => {
  controls.lock();
}, false);

// Load a texture for the floor
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(20, 20);

const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Create a simple room by adding four walls
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x999999 });
const roomSize = 50;
const wallHeight = 10;
const wallThickness = 1;

// Back wall
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(roomSize, wallHeight, wallThickness),
  wallMaterial
);
backWall.position.set(0, wallHeight / 2, -roomSize / 2);
scene.add(backWall);

// Front wall
const frontWall = new THREE.Mesh(
  new THREE.BoxGeometry(roomSize, wallHeight, wallThickness),
  wallMaterial
);
frontWall.position.set(0, wallHeight / 2, roomSize / 2);
scene.add(frontWall);

// Left wall
const leftWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, roomSize),
  wallMaterial
);
leftWall.position.set(-roomSize / 2, wallHeight / 2, 0);
scene.add(leftWall);

// Right wall
const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, roomSize),
  wallMaterial
);
rightWall.position.set(roomSize / 2, wallHeight / 2, 0);
scene.add(rightWall);

// Set the initial camera position (inside the room)
// Define ground level
const groundLevel = 2;
camera.position.set(0, groundLevel, 0);

// --- Movement Controls ---
const moveSpeed = 0.15;
const keysPressed = {};

// Jump parameters
const jumpHeight = 3; // Maximum jump height above ground
const gravity = 0.01 ;  // Gravity acceleration per frame (adjust as needed)
let isJumping = false;
let verticalVelocity = 0;

// Listen for key press events (WASD, Arrow keys, and Space for jump)
document.addEventListener('keydown', (event) => {
  // Use lowercase for letter keys; arrow keys remain unchanged
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keysPressed[key] = true;
  
  // Trigger jump on Space (only if not already jumping and on ground)
  if (event.code === 'Space' && !isJumping && camera.position.y <= groundLevel + 0.001) {
    verticalVelocity = Math.sqrt(2 * gravity * jumpHeight);
    isJumping = true;
  }
});

document.addEventListener('keyup', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keysPressed[key] = false;
});

// Define room boundaries to prevent passing through walls (for horizontal movement)
const margin = 1; // Player "radius"
const boundaryLimit = roomSize / 2 - margin;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Save current horizontal position before moving
  const prevPosition = camera.position.clone();
  
  // Process horizontal movement (WASD and Arrow keys)
  if (keysPressed['w'] || keysPressed['ArrowUp']) {
    controls.moveForward(moveSpeed);
  }
  if (keysPressed['s'] || keysPressed['ArrowDown']) {
    controls.moveForward(-moveSpeed);
  }
  if (keysPressed['a'] || keysPressed['ArrowLeft']) {
    controls.moveRight(-moveSpeed);
  }
  if (keysPressed['d'] || keysPressed['ArrowRight']) {
    controls.moveRight(moveSpeed);
  }
  
  // Collision detection for horizontal movement
  if (
    camera.position.x < -boundaryLimit ||
    camera.position.x > boundaryLimit ||
    camera.position.z < -boundaryLimit ||
    camera.position.z > boundaryLimit
  ) {
    camera.position.x = prevPosition.x;
    camera.position.z = prevPosition.z;
  }
  
  // Update vertical movement for jump (simulate parabola)
  if (isJumping || camera.position.y > groundLevel) {
    camera.position.y += verticalVelocity;
    verticalVelocity -= gravity;
    if (camera.position.y <= groundLevel) {
      camera.position.y = groundLevel;
      verticalVelocity = 0;
      isJumping = false;
    }
  }
  
  renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
