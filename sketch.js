const colourPalette = ['rgba(15, 240, 252, 0.6)', '#1E88E5', '#29B6F6', '#81D4FA', '#E1F5FE']; //Modify the color scheme to make it more like a jellyfish
const colorKeys = ["flower", "leaves", "endLeaves", "endLeavesStroke"];
let circles = [];
let dots = [];
let centerSphereSize, endSphereSize, endSphereStroke;
let expansionSpeed = 2; // Control the diffusion speed

function setup() {
  createCanvas(windowWidth, windowHeight);
  drawJellyfishBackground();
  initializeElements();
}

function drawJellyfishBackground() {
  let bgColor = color(10, 30, 60); // 深蓝色
  let bgGradientColor = color(30, 80, 130); // 浅蓝色

  // 背景渐变
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(bgColor, bgGradientColor, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function initializeElements() {
  circles = [];
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

      let leafCount = random(8, 15);
      let overlapping = false;
      for (let other of circles) {
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
        circles.push({ x, y, r, leafCount, colors });
      }
    }
  }

  angleMode(DEGREES);
  centerSphereSize = random(10, 30);
  endSphereSize = centerSphereSize / 2;
  endSphereStroke = endSphereSize / 3;

  initializeDots(int((width * height) / 800));
}

function draw() {
  drawJellyfishBackground(); // Redraw the background every frame
  for (let i = 0; i < circles.length; i++) {
    drawFlower(circles[i].x, circles[i].y, circles[i].leafCount, circles[i].r, circles[i].colors);
  }
  drawDots();
}

function drawFlower(x, y, leafCount, leafLength, colors) {
  push();
  translate(x, y);
  let angleStep = 360 / leafCount;

  fill(color(colors.flower));
  noStroke();
  ellipse(0, 0, centerSphereSize, centerSphereSize);

  for (let i = 0; i < leafCount; i++) {
    drawLeaves(angleStep, leafLength, colors);
  }

  pop();
}

function drawLeaves(angle, leafLength, colors) {
  let segments = 15;
  let px, py;

  strokeWeight(5);
  stroke(color(colors.leaves));
  rotate(angle);
  noFill();

  beginShape();
  for (let i = 0; i < segments; i++) {
    px = map(i, 0, segments, 0, leafLength);
    py = sin(i * 10) * 50;
    vertex(px, py);
  }
  endShape();

  drawEndLeaf(px, py, colors);
}

function drawEndLeaf(x, y, colors) {
  fill(color(colors.endLeaves));
  strokeWeight(endSphereStroke);
  stroke(color(colors.endLeavesStroke));
  ellipse(x, y, endSphereSize, endSphereSize);
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
    fill(dot.chosenColor);
    dot.x += map(noise(dot.noiseOffset), 0, 1, -2, 2);
    dot.y += map(noise(dot.noiseOffset + 100), 0, 1, -2, 2);
    ellipse(dot.x, dot.y, dot.size * 0.5, dot.size * 0.5);
    dot.noiseOffset += 0.01;

    if (dot.x < 0 || width < dot.x || dot.y < 0 || height < dot.y) {
      dot = createRandomDotsAttributes();
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