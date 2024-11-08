const colourPalette = ['rgba(15, 240, 252, 0.6)', '#1E88E5', '#29B6F6', '#81D4FA', '#E1F5FE'];
const colorKeys = ["body", "tentacle", "tentacleEnd", "tentacleEndStroke"];
let jellyfish = [];
let dots = [];
let bubbles = [];
let showBubbles = false; // Control bubble appearance
let centerSphereSize, endSphereSize, endSphereStroke;
let expansionSpeed = 2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  drawJellyfishBackground();
  initializeElements();
}

function drawJellyfishBackground() {
  let bgColor = color(10, 30, 60);
  let bgGradientColor = color(30, 80, 130);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(bgColor, bgGradientColor, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function initializeElements() {
  jellyfish = [];
  const gridSize = windowWidth / 5;
  const rows = ceil(windowHeight / gridSize);
  const cols = ceil(windowWidth / gridSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let r = random(50, 100);
      let x = col * gridSize + random(gridSize * 0.2, gridSize * 0.8);
      let y = row * gridSize + random(gridSize * 0.2, gridSize * 0.8);

      x = constrain(x, r, windowWidth - r);
      y = constrain(y, r, windowHeight - r);

      let tentacleCount = random(8, 15);
      let overlapping = false;
      for (let other of jellyfish) {
        let d = dist(x, y, other.x, other.y);
        if (d < r + other.r) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        let colors = Object.fromEntries(
          colorKeys.map(key => [key, colourPalette[floor(random(colourPalette.length))]])
        );
        jellyfish.push({ x, y, r, originalRadius: r, tentacleCount, colors, isExpanding: false, expansionAmount: 0 });
      }
    }
  }

  angleMode(DEGREES);
  centerSphereSize = random(10, 30);
  endSphereSize = centerSphereSize / 2;
  endSphereStroke = endSphereSize / 3;

  initializeDots(int((width * height) / 800));
}

function initializeBubbles(numBubbles) {
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
  drawJellyfishBackground();
  
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

  drawDots();

  if (showBubbles) {
    drawBubbles();
  }
}

function drawJellyfish(x, y, tentacleCount, tentacleLength, colors) {
  push();
  translate(x, y);
  let angleStep = 360 / tentacleCount;

  fill(color(colors.body));
  noStroke();
  ellipse(0, 0, centerSphereSize, centerSphereSize);

  for (let i = 0; i < tentacleCount; i++) {
    drawTentacle(angleStep, tentacleLength, colors);
  }
    
  pop();
}

function drawTentacle(angle, tentacleLength, colors) {
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

  drawTentacleEnd(px, py, colors);
}

function drawTentacleEnd(x, y, colors) {
  fill(color(colors.tentacleEnd));
  strokeWeight(endSphereStroke);
  stroke(color(colors.tentacleEndStroke));
  ellipse(x, y, endSphereSize, endSphereSize);
}

function drawBubbles() {
  noStroke();
  for (let bubble of bubbles) {
    fill(255, bubble.alpha);
    ellipse(bubble.x, bubble.y, bubble.size);

    bubble.y -= bubble.speed;

    if (bubble.y < 0) {
      bubble.y = height + bubble.size;
      bubble.x = random(width);
    }
  }
}

function mousePressed() {
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
    // Toggle bubble appearance with spacebar
    showBubbles = !showBubbles;
    if (showBubbles) initializeBubbles(100); // Increase number of bubbles
  }
  if (key === 'c' || key === 'C') {
    // Clear bubbles on 'C' press
    bubbles = [];
    showBubbles = false;
  }
}

function initializeDots(numDots) {
  dots = [];
  for (let i = 0; i < numDots; i++) {
    dots.push(createRandomDotsAttributes());
  }
}

function createRandomDotsAttributes() {
  return {
    x: random(width), 
    y: random(height), 
    size: random(5, 15),
    chosenColor: randomColor(),
    noiseOffset: random(300)
  };
}

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
      Object.assign(dot, createRandomDotsAttributes());
    }
  }
}

function randomColor() {
  return colourPalette[floor(random(colourPalette.length))];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeElements();
  endSphereStroke = min(windowWidth, windowHeight) / 250;
}
