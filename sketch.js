// Color palette for different parts of the jellyfish
const colourPalette = ['rgba(15, 240, 252, 0.6)', '#1E88E5', '#29B6F6', '#81D4FA', '#E1F5FE']; 
// Keys representing different parts of the jellyfish
const colorKeys = ["body", "tentacle", "tentacleEnd", "tentacleEndStroke"];
let jellyfish = [];
let dots = [];
let centerSphereSize, endSphereSize, endSphereStroke;
let expansionSpeed = 2; // Control expansion speed

function setup() { 
  // Create canvas and initialize background and elements
  createCanvas(windowWidth, windowHeight);
  drawJellyfishBackground(); // Draw deep-sea background
  initializeElements(); // Initialize jellyfish and background dots
}

function drawJellyfishBackground() {
  // Set background with a gradient from dark to lighter blue
  let bgColor = color(10, 20, 60); // Deep sea dark blue
  let bgGradientColor = color(30, 70, 130); // Lighter blue gradient

  // Draw vertical gradient from top to bottom
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(bgColor, bgGradientColor, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function initializeElements() {
  // Initialize jellyfish array
  jellyfish = []; 
  const gridSize = windowWidth / 5; // Grid size
  const rows = ceil(windowHeight / gridSize); // Calculate rows
  const cols = ceil(windowWidth / gridSize); // Calculate columns

  // Traverse grid to create jellyfish positions
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let r = random(50, 100); // Random jellyfish body size
      let x = col * gridSize + random(gridSize * 0.2, gridSize * 0.8);
      let y = row * gridSize + random(gridSize * 0.2, gridSize * 0.8);

      // Ensure jellyfish stay within the canvas boundaries
      x = constrain(x, r, windowWidth - r);
      y = constrain(y, r, windowHeight - r);

      let tentacleCount = random(8, 15); // Random number of tentacles
      let overlapping = false; // Check for overlapping with other jellyfish
      for (let other of jellyfish) {
        let d = dist(x, y, other.x, other.y);
        if (d < r + other.r) {
          overlapping = true;
          break;
        }
      }

      // Only add jellyfish if it's not overlapping
      if (!overlapping) {
        let colors = Object.fromEntries(
          colorKeys.map(key => [key, colourPalette[floor(random(colourPalette.length))]])
        );
        jellyfish.push({ x, y, r, originalRadius: r, tentacleCount, colors, isExpanding: false, expansionAmount: 0 });
      }
    }
  }

  // Set angle mode to degrees
  angleMode(DEGREES);
  centerSphereSize = random(10, 30); // Size of the jellyfish body center
  endSphereSize = centerSphereSize / 2; // Size of the tentacle end circles
  endSphereStroke = endSphereSize / 3; // Stroke size for the tentacle ends

  // Initialize background dots
  initializeDots(int((width * height) / 800));
}

function draw() {
  // Draw background
  drawJellyfishBackground();
  
  // Draw all jellyfish
  for (let jelly of jellyfish) {
    if (jelly.isExpanding) {
      // If expanding, increase expansion amount
      jelly.expansionAmount += expansionSpeed;
      if (jelly.expansionAmount > jelly.originalRadius) {
        jelly.isExpanding = false;
      }
    } else if (jelly.expansionAmount > 0) {
      // Reduce expansion effect gradually when complete
      jelly.expansionAmount -= expansionSpeed / 2;
    }
    drawJellyfish(jelly.x, jelly.y, jelly.tentacleCount, jelly.r + jelly.expansionAmount, jelly.colors);
  }

  // Draw dots
  drawDots();
}

function drawJellyfish(x, y, tentacleCount, tentacleLength, colors) {
  // Draw the jellyfish body and tentacles
  push();
  translate(x, y);
  let angleStep = 360 / tentacleCount;

  // Draw the center of the jellyfish body
  fill(color(colors.body));
  noStroke();
  ellipse(0, 0, centerSphereSize, centerSphereSize);

  // Draw tentacles
  for (let i = 0; i < tentacleCount; i++) {
    drawTentacle(angleStep, tentacleLength, colors);
  }
    
  pop();
}

function drawTentacle(angle, tentacleLength, colors) {
  // Draw a single tentacle
  let segments = 15;
  let px, py;

  strokeWeight(5);
  stroke(color(colors.tentacle));

  rotate(angle);
  noFill();

  // Create a curved tentacle using a sine wave
  beginShape();
  for (let i = 0; i < segments; i++) {
    px = map(i, 0, segments, 0, tentacleLength);
    py = sin(i * 10) * 50;
    vertex(px, py);
  }
  endShape();

  // Draw a small circle at the end of the tentacle
  drawTentacleEnd(px, py, colors);
}

function drawTentacleEnd(x, y, colors) {
  // Draw the end of the tentacle with a small circle and stroke
  fill(color(colors.tentacleEnd));
  strokeWeight(endSphereStroke);
  stroke(color(colors.tentacleEndStroke));
  ellipse(x, y, endSphereSize, endSphereSize);
}

function mousePressed() {
  // Trigger expansion effect for jellyfish on mouse click
  for (let jelly of jellyfish) {
    let d = dist(mouseX, mouseY, jelly.x, jelly.y);
    if (d < jelly.r) {
      jelly.isExpanding = true; // Trigger expansion effect
      jelly.expansionAmount = 0; // Reset expansion amount
    }
  }
}

// Initialize background dots
function initializeDots(numDots) {
  dots = [];
  for (let i = 0; i < numDots; i++) {
    dots.push(createRandomDotsAttributes());
  }
}

function createRandomDotsAttributes() {
  // Generate random attributes for a single dot
  return {
    x: random(width), 
    y: random(height), 
    size: random(5, 15),
    chosenColor: randomColor(),
    noiseOffset: random(300)
  };
}

// Draw and animate background dots
function drawDots() {
  noStroke();
  for (let dot of dots) {
    let dotColor = color(dot.chosenColor);
    dotColor.setAlpha(random(150, 255));
    fill(dotColor);
      
    dot.x += map(noise(dot.noiseOffset), 0, 1, -2, 2);
    dot.y += map(noise(dot.noiseOffset + 100), 0, 1, -2, 2);

    ellipse(dot.x, dot.y, dot.size * 0.5, dot.size * 0.5);
    dot.noiseOffset += 0.01;

    if (dot.x < 0 || width < dot.x || dot.y < 0 || height < dot.y) {
      // If dot goes out of bounds, regenerate its attributes
      Object.assign(dot, createRandomDotsAttributes());
    }
  }
}

// Select a random color from the color palette
function randomColor() {
  return colourPalette[floor(random(colourPalette.length))];
}

function windowResized() {
  // Resize canvas and update element sizes on window resize
  resizeCanvas(windowWidth, windowHeight);
  initializeElements();
  endSphereStroke = min(windowWidth, windowHeight) / 250; 
}
