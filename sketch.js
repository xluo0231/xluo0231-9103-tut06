// Define color palette and keys for different parts of the jellyfish
const colourPalette = ['rgba(15, 240, 252, 0.6)', '#1E88E5', '#29B6F6', '#81D4FA', '#E1F5FE'];
const colorKeys = ["body", "tentacle", "tentacleEnd", "tentacleEndStroke"];
let jellyfishArray = [];
let dots = [];
let bubbles = [];
let showBubbles = false;
let centerSphereSize, endSphereSize, endSphereStroke;
let expansionSpeed = 2;

// Class Definitions

// Jellyfish class to create and manage jellyfish objects
class Jellyfish {
  constructor(x, y, r, tentacleCount, colors) {
    this.x = x; // X-position of the jellyfish
    this.y = y; // Y-position of the jellyfish
    this.r = r; // Radius of the jellyfish body
    this.originalRadius = r; // Original radius of the jellyfish body
    this.tentacleCount = tentacleCount; // Number of tentacles
    this.colors = colors; // Color scheme for the jellyfish
    this.isExpanding = false; // Whether the jellyfish is expanding
    this.expansionAmount = 0; // Amount of expansion
  }

  // Method to handle jellyfish expansion
  expand() {
    if (this.isExpanding) {
      this.expansionAmount += expansionSpeed;
      if (this.expansionAmount > this.originalRadius) {
        this.isExpanding = false;
      }
    } else if (this.expansionAmount > 0) {
      this.expansionAmount -= expansionSpeed / 2;
    }
  }

  // Method to draw the jellyfish
  draw() {
    drawJellyfish(this.x, this.y, this.tentacleCount, this.r + this.expansionAmount, this.colors);
  }

  // Method to check if a jellyfish is clicked
  isClicked(mouseX, mouseY) {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.r;  // Check if mouse is inside jellyfish radius
  }
}

// Bubble class for the bubbles that float upwards
class Bubble {
  constructor() {
    this.x = random(width); // Random x position
    this.y = random(height); // Random y position
    this.size = random(10, 20); // Random size of the bubble
    this.speed = random(1, 3); // Speed of the bubble
    this.alpha = random(100, 200); // Transparency of the bubble
  }

  // Method to move the bubble upwards
  move() {
    this.y -= this.speed;

    // Reset bubble position when it goes off-screen
    if (this.y < 0) {
      this.y = height + this.size;
      this.x = random(width);
    }
  }

  // Method to draw the bubble
  draw() {
    fill(255, this.alpha); // Set color with alpha transparency
    ellipse(this.x, this.y, this.size); // Draw ellipse for bubble
  }
}

// Dot class for the random moving dots in the background
class Dot {
  constructor() {
    this.x = random(width); // Random x position
    this.y = random(height); // Random y position
    this.size = random(5, 15); // Random size of the dot
    this.chosenColor = randomColor(); // Random color from the palette
    this.noiseOffset = random(300); // Random offset for noise function
  }

  // Method to move the dot using Perlin noise
  move() {
    this.x += map(noise(this.noiseOffset), 0, 1, -2, 2); // Horizontal movement
    this.y += map(noise(this.noiseOffset + 100), 0, 1, -2, 2); // Vertical movement
    this.noiseOffset += 0.01; // Update the noise offset
  }

  // Method to draw the dot
  draw() {
    let dotColor = color(this.chosenColor);
    dotColor.setAlpha(random(150, 255)); // Set random transparency
    fill(dotColor); // Set color
    ellipse(this.x, this.y, this.size * 0.5, this.size * 0.5); // Draw the dot
  }
}

// Utility Functions

// Function to return a random color from the palette
function randomColor() {
  return colourPalette[floor(random(colourPalette.length))];
}

// Function to set up the canvas and initialize elements
function setup() {
  createCanvas(windowWidth, windowHeight); // Create canvas with full window size
  drawJellyfishBackground(); // Draw jellyfish-like background
  initializeElements(); // Initialize jellyfish and other elements
}

// Function to draw the background with a jellyfish-inspired gradient
function drawJellyfishBackground() {
  let bgColor = color(30, 80, 140); // Light blue color
  let bgGradientColor = color(10, 20, 60); // Dark blue color

  // Draw gradient background
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1); // Map the Y position to gradient
    let c = lerpColor(bgColor, bgGradientColor, inter); // Interpolate colors
    stroke(c); // Set stroke color
    line(0, y, width, y); // Draw a line for gradient effect
  }
}

// Function to initialize jellyfish and other elements
function initializeElements() {
  jellyfishArray = [];
  const gridSize = windowWidth / 5; // Grid size for positioning jellyfish
  const rows = ceil(windowHeight / gridSize); // Number of rows
  const cols = ceil(windowWidth / gridSize); // Number of columns

  // Loop through each grid position to create jellyfish
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let r = random(50, 100); // Random radius for each jellyfish
      let x = col * gridSize + random(gridSize * 0.2, gridSize * 0.8); // Random x position
      let y = row * gridSize + random(gridSize * 0.2, gridSize * 0.8); // Random y position
      x = constrain(x, r, windowWidth - r); // Ensure jellyfish is within canvas bounds
      y = constrain(y, r, windowHeight - r); // Ensure jellyfish is within canvas bounds
      let tentacleCount = random(8, 15); // Random number of tentacles
      let overlapping = false; // Check for overlap with other jellyfish

      // Check for overlap with other jellyfish
      for (let other of jellyfishArray) {
        let d = dist(x, y, other.x, other.y);
        if (d < r + other.r) {
          overlapping = true;
          break;
        }
      }

      // If no overlap, create new jellyfish
      if (!overlapping) {
        let colors = Object.fromEntries(
          colorKeys.map(key => [key, colourPalette[floor(random(colourPalette.length))]]) // Assign random colors
        );
        jellyfishArray.push(new Jellyfish(x, y, r, tentacleCount, colors));
      }
    }
  }

  angleMode(DEGREES); // Use degrees for angle calculations
  centerSphereSize = random(10, 30); // Central body size of jellyfish
  endSphereSize = centerSphereSize / 2; // Size of end spheres on tentacles
  endSphereStroke = endSphereSize / 3; // Stroke width for end spheres
  initializeDots(int((width * height) / 800)); // Initialize background dots
}

// Function to initialize bubbles
function initializeBubbles(numBubbles) {
  bubbles = [];
  for (let i = 0; i < numBubbles; i++) {
    bubbles.push(new Bubble()); // Create new bubble objects
  }
}

// Main draw function
function draw() {
  drawJellyfishBackground(); // Draw background

  // Draw each jellyfish with expansion effect
  for (let jelly of jellyfishArray) {
    jelly.expand();
    jelly.draw();
  }

  drawDots(); // Draw the background dots

  if (showBubbles) {
    drawBubbles(); // Draw bubbles if the showBubbles flag is true
  }
}

// Function to draw a single jellyfish
function drawJellyfish(x, y, tentacleCount, tentacleLength, colors) {
  push();
  translate(x, y); // Move to jellyfish position
  let angleStep = 360 / tentacleCount; // Angle step for tentacles

  let backgroundColor = color(colors.tentacle); // Color for tentacles
  backgroundColor.setAlpha(80); // Semi-transparent tentacles
  fill(backgroundColor);
  noStroke();
  let backgroundSize = tentacleLength * 1.5; // Size of jellyfish background
  ellipse(0, 0, backgroundSize, backgroundSize); // Draw jellyfish background

  // Draw each tentacle
  for (let i = 0; i < tentacleCount; i++) {
    drawTentacle(angleStep, tentacleLength, colors);
  }

  // Draw the central body of the jellyfish
  fill(color(colors.body));
  noStroke();
  ellipse(0, 0, centerSphereSize, centerSphereSize);

  // Draw small circle on jellyfish body
  let smallCircleColor = color(colors.body);
  smallCircleColor.setAlpha(150); // Set transparency
  fill(smallCircleColor);
  let smallCircleSize = centerSphereSize * 4.5;
  ellipse(0, 0, smallCircleSize, smallCircleSize);

  pop();
}

// Function to draw each tentacle of the jellyfish
function drawTentacle(angle, tentacleLength, colors) {
  let segments = 15; // Number of segments in tentacle
  let px, py;

  strokeWeight(5);
  stroke(color(colors.tentacle)); // Tentacle color
  rotate(angle); // Rotate to draw tentacle in correct direction
  noFill();

  // Draw tentacle path
  beginShape();
  for (let i = 0; i < segments; i++) {
    px = map(i, 0, segments, 0, tentacleLength); // X position of segment
    py = sin(i * 10) * 50; // Y position of segment with sine wave motion
    vertex(px, py); // Add vertex to the tentacle path
  }
  endShape();

  // Draw the end of the tentacle
  drawTentacleEnd(px, py, colors);
}

// Function to draw the end of each tentacle
function drawTentacleEnd(x, y, colors) {
  fill(color(colors.tentacleEnd)); // End color of tentacle
  strokeWeight(endSphereStroke);
  stroke(color(colors.tentacleEndStroke)); // Stroke color for tentacle end
  ellipse(x, y, endSphereSize, endSphereSize); // Draw end sphere of tentacle
}

// Function to draw the bubbles floating upwards
function drawBubbles() {
  noStroke();
  for (let bubble of bubbles) {
    bubble.move(); // Move bubble
    bubble.draw(); // Draw bubble
  }
}

// Function to draw the background dots
function drawDots() {
  noStroke();
  for (let dot of dots) {
    dot.move(); // Move each dot
    dot.draw(); // Draw each dot
  }
}

// Key press event to control bubble visibility
function keyPressed() {
  if (key === ' ') {
    showBubbles = !showBubbles; // Toggle bubble visibility
    if (showBubbles) initializeBubbles(100); // Initialize bubbles if enabled
  }
  if (key === 'c' || key === 'C') {
    bubbles = []; // Clear bubbles
    showBubbles = false; // Disable bubble visibility
  }
}

// Initialize the dots for the background
function initializeDots(numDots) {
  dots = [];
  for (let i = 0; i < numDots; i++) {
    dots.push(new Dot()); // Create new dot objects
  }
}

// Resize canvas when the window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Resize the canvas
  initializeElements(); // Reinitialize jellyfish and elements
  endSphereStroke = min(windowWidth, windowHeight) / 250; // Adjust stroke width
}

// Mouse press event to trigger jellyfish expansion
function mousePressed() {
  for (let jelly of jellyfishArray) {
    if (jelly.isClicked(mouseX, mouseY)) {
      jelly.isExpanding = !jelly.isExpanding; // Toggle expansion on click
    }
  }
}
