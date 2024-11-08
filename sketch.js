// Define color palette and keys for different parts of the jellyfish
const colourPalette = ['rgba(15, 240, 252, 0.6)', '#1E88E5', '#29B6F6', '#81D4FA', '#E1F5FE'];
const colorKeys = ["body", "tentacle", "tentacleEnd", "tentacleEndStroke"];
let jellyfish = []; // Array to store jellyfish data
let dots = []; // Array to store background dots (e.g., stars)
let bubbles = []; // Array to store bubbles
let showBubbles = false; // Control bubble appearance
let centerSphereSize, endSphereSize, endSphereStroke;
let expansionSpeed = 2; // Speed of expansion when clicked

function setup() {
  createCanvas(windowWidth, windowHeight);
  drawJellyfishBackground(); // Draw gradient background
  initializeElements(); // Initialize jellyfish and dots
}

function drawJellyfishBackground() {
  // Draw a gradient background to simulate deep ocean colors
  let bgColor = color(10, 20, 60);
  let bgGradientColor = color(30, 80, 140);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(bgColor, bgGradientColor, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function initializeElements() {
  jellyfish = []; // Clear existing jellyfish data
  const gridSize = windowWidth / 5;
  const rows = ceil(windowHeight / gridSize);
  const cols = ceil(windowWidth / gridSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let r = random(50, 100);
      let x = col * gridSize + random(gridSize * 0.2, gridSize * 0.8);
      let y = row * gridSize + random(gridSize * 0.2, gridSize * 0.8);

      // Constrain position to avoid jellyfish going out of bounds
      x = constrain(x, r, windowWidth - r);
      y = constrain(y, r, windowHeight - r);

      let tentacleCount = random(8, 15); // Number of tentacles per jellyfish
      let overlapping = false;

      // Check for overlapping with other jellyfish
      for (let other of jellyfish) {
        let d = dist(x, y, other.x, other.y);
        if (d < r + other.r) {
          overlapping = true;
          break;
        }
      }

      // Add jellyfish to array if no overlap is found
      if (!overlapping) {
        let colors = Object.fromEntries(
          colorKeys.map(key => [key, colourPalette[floor(random(colourPalette.length))]])
        );
        jellyfish.push({ x, y, r, originalRadius: r, tentacleCount, colors, isExpanding: false, expansionAmount: 0 });
      }
    }
  }

  angleMode(DEGREES);
  centerSphereSize = random(10, 30); // Central body size
  endSphereSize = centerSphereSize / 2; // End sphere size of tentacles
  endSphereStroke = endSphereSize / 3; // Stroke size for tentacle ends

  initializeDots(int((width * height) / 800)); // Initialize background dots
}

function initializeBubbles(numBubbles) {
  // Initialize bubbles with random position, size, speed, and transparency
  bubbles = [];
  for (let i = 0; i < numBubbles; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(10, 20), // Smaller bubble size
      speed: random(1, 3),
      alpha: random(100, 200),
    });
  }
}

function draw() {
  drawJellyfishBackground(); // Redraw background

  // Draw each jellyfish with expansion effect if triggered
  for (let jelly of jellyfish) {
    if (jelly.isExpanding) {
      jelly.expansionAmount += expansionSpeed;
      if (jelly.expansionAmount > jelly.originalRadius) {
        jelly.isExpanding = false;
      }
    } else if (jelly.expansionAmount > 0) {
      jelly.expansionAmount -= expansionSpeed / 2;
    }
    drawJellyfish(jelly.x, jelly.y, jelly.tentacleCount, jelly.r + jelly.expansionAmount, jelly.colors);
  }

  drawDots(); // Draw background dots

  if (showBubbles) {
    drawBubbles(); // Draw bubbles if enabled
  }
}

function drawJellyfish(x, y, tentacleCount, tentacleLength, colors) {
  push();
  translate(x, y);
  let angleStep = 360 / tentacleCount;

  // Semi-transparent circle representing jellyfish's main body
  let backgroundColor = color(colors.tentacle);
  backgroundColor.setAlpha(80); // Semi-transparent
  fill(backgroundColor);
  noStroke();
  let backgroundSize = tentacleLength * 1.6;
  ellipse(0, 0, backgroundSize, backgroundSize);

  // Draw each tentacle
  for (let i = 0; i < tentacleCount; i++) {
    drawTentacle(angleStep, tentacleLength, colors);
  }

  // Opaque main body in the center of the jellyfish
  fill(color(colors.body));
  noStroke();
  ellipse(0, 0, centerSphereSize, centerSphereSize);

  // Smaller semi-transparent circle with white outline in the center
  let smallCircleColor = color(colors.body);
  smallCircleColor.setAlpha(150); // 0.8 opacity
  fill(smallCircleColor);
  let smallCircleSize = centerSphereSize * 4.5;
  ellipse(0, 0, smallCircleSize, smallCircleSize);

  pop();
}

function drawTentacle(angle, tentacleLength, colors) {
  // Draw each tentacle with specified length and color
  let segments = 15;
  let px, py;

  strokeWeight(5);
  stroke(color(colors.tentacle));

  rotate(angle);
  noFill();

  beginShape();
  for (let i = 0; i < segments; i++) {
    px = map(i, 0, segments, 0, tentacleLength);
    py = sin(i * 10) * 50;
    vertex(px, py);
  }
  endShape();

  drawTentacleEnd(px, py, colors); // Draw end of tentacle
}

function drawTentacleEnd(x, y, colors) {
  // Draw the rounded end of each tentacle
  fill(color(colors.tentacleEnd));
  strokeWeight(endSphereStroke);
  stroke(color(colors.tentacleEndStroke));
  ellipse(x, y, endSphereSize, endSphereSize);
}

function drawBubbles() {
  // Draw bubbles moving upwards
  noStroke();
  for (let bubble of bubbles) {
    fill(255, bubble.alpha);
    ellipse(bubble.x, bubble.y, bubble.size);

    bubble.y -= bubble.speed;

    // Reset bubble position if it moves off screen
    if (bubble.y < 0) {
      bubble.y = height + bubble.size;
      bubble.x = random(width);
    }
  }
}

function mousePressed() {
  // Trigger expansion effect if mouse clicks inside jellyfish area
  for (let jelly of jellyfish) {
    let d = dist(mouseX, mouseY, jelly.x, jelly.y);
    if (d < jelly.r) {
      jelly.isExpanding = true;
      jelly.expansionAmount = 0;
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    // Toggle bubbles on spacebar press
    showBubbles = !showBubbles;
    if (showBubbles) initializeBubbles(100); // Increase bubble count
  }
  if (key === 'c' || key === 'C') {
    // Clear bubbles on 'C' press
    bubbles = [];
    showBubbles = false;
  }
}

function initializeDots(numDots) {
  // Initialize background dots with random attributes
  dots = [];
  for (let i = 0; i < numDots; i++) {
    dots.push(createRandomDotsAttributes());
  }
}

function createRandomDotsAttributes() {
  // Generate random attributes for each dot (position, size, color)
  return {
    x: random(width), 
    y: random(height), 
    size: random(5, 15),
    chosenColor: randomColor(),
    noiseOffset: random(300)
  };
}

function drawDots() {
  // Draw and animate background dots
  noStroke();
  for (let dot of dots) {
    let dotColor = color(dot.chosenColor);
    dotColor.setAlpha(random(150, 255));
    fill(dotColor);
      
    dot.x += map(noise(dot.noiseOffset), 0, 1, -2, 2);
    dot.y += map(noise(dot.noiseOffset + 100), 0, 1, -2, 2);

    ellipse(dot.x, dot.y, dot.size * 0.5, dot.size * 0.5);
    dot.noiseOffset += 0.01;

    // Reset dot if it moves off screen
    if (dot.x < 0 || width < dot.x || dot.y < 0 || height < dot.y) {
      Object.assign(dot, createRandomDotsAttributes());
    }
  }
}

function randomColor() {
  // Select a random color from the color palette
  return colourPalette[floor(random(colourPalette.length))];
}

function windowResized() {
  // Adjust canvas and reinitialize elements when window is resized
  resizeCanvas(windowWidth, windowHeight);
  initializeElements();
  endSphereStroke = min(windowWidth, windowHeight) / 250;
}
