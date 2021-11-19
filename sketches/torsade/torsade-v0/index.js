const shapes = [];
const canvasSize = 1080;
const canvas = {
  width: canvasSize,
  height: canvasSize, // * 1.5
};
let stop = false;

function mousePressed() {
  stop = !stop;

  if (stop) {
    noLoop();
  } else {
    loop();
  }
}

function doubleClicked() {
  fullscreen(!fullscreen());
}

function windowResized() {
  if (fullscreen()) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(canvas.width, canvas.height);
  }

  shapes.forEach((shape) => shape.onWindowResized());
}

function preload() {
  font = loadFont("assets/fonts/roboto-mono.ttf");
}

const polarCoefficients = [
  [1, 1],
  [2, 3],
  [4, 3],
  [2, 4],
  [3, 3],
  [1, 1],
];

function setup() {
  createCanvas(canvas.width, canvas.height);
  // createCanvas(windowWidth, windowHeight);
  // frameRate(30)
  //pixelDensity(0.004)

  const xCount = 3
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          end: createVector(0, height / 2),
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
}

function circularIndex(index, values) {
  const valuesIndex = floor(index % values.length);
  return values[valuesIndex];
}

function getPolar(func, size, angle, coefficient = 1) {
  return size * func(angle * coefficient);
}

function getPolarVector(angle, sizeX, sizeY = sizeX) {
  return createVector(getPolar(sin, sizeX, angle), getPolar(cos, sizeY, angle));
}

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
}

function easeInOutBack(x) {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
}

class Spiral {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRealtivePosition();
  }

  calculateRealtivePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRealtivePosition();
  }

  draw(time, index) {
    let { position, size, start, end } = this;

    const hueCadence = index + time * 3;
    const cadence = index / shapes.length + time;
    const interpolation = 0.09;
    const [x, y] = circularIndex(cadence, polarCoefficients);

    this.xPolarCoefficient = lerp(
      this.xPolarCoefficient || 0,
      x,
      interpolation
    );
    this.yPolarCoefficient = lerp(
      this.yPolarCoefficient || 0,
      y,
      interpolation
    );

    // this.xPolarCoefficient = map(cos(time+index), -1, 1, -PI/2, PI);
    // this.yPolarCoefficient = map(sin(time), -1, 1, -PI, PI/2);

    const { xPolarCoefficient, yPolarCoefficient } = this;
    const waveAmplitude = size;

    push();
    translate(
      position.x, // * easeInOutBack(map(sin(time+index), -1, 1, 0.2, 1)),
      position.y // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    // size = easeOutElastic(map(sin(time), -1, 1, 0, 1)) * size
    // const lerpStep = 1/10;
    const lerpStep = 1 / 300; //map(mouseY, height, 0, 1, 64, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      push();
      translate(lerpPosition.x, lerpPosition.y);

      const angle = map(lerpIndex, 0, 1, -PI, PI);

      const yOffset = map(
        cos(angle + index + time * 2),
        -1,
        1,
        -waveAmplitude,
        waveAmplitude
      );
      const xOffset = map(
        sin(angle + index + time),
        -1,
        1,
        waveAmplitude,
        -waveAmplitude
      );

      const vector = createVector(
        getPolar(sin, xOffset, angle + yPolarCoefficient, xPolarCoefficient),
        getPolar(cos, yOffset, angle + xPolarCoefficient, yPolarCoefficient)
      );
      const nextVector = createVector(
        getPolar(sin, xOffset, angle, xPolarCoefficient),
        getPolar(cos, yOffset, angle, yPolarCoefficient)
      );

      beginShape();
      strokeWeight(75);

      stroke(
        map(sin(angle + hueCadence), -1, 1, 0, 360),
        map(cos(angle + hueCadence), -1, 1, 0, 255),
        map(sin(angle + hueCadence), -1, 1, 255, 0)
        //map(xPolarCoefficient + yPolarCoefficient, 0, 15, 0, 255)
      );

      vertex(vector.x, nextVector.y);
      vertex(nextVector.x, vector.y);

      endShape();
      pop();
    }

    //write(`${xPolarCoefficient} - ${yPolarCoefficient}`, -size, size + 20);

    pop();
  }
}

function circularIndex(index, values) {
  const valuesIndex = floor(index % values.length);

  return values[abs(valuesIndex)];
}

function circularMap(index, length, min, max) {
  return map(abs((index % length) - length / 2), 0, length / 2, max, min);
}

function circularValueOn(index, scale, values) {
  return values[ceil(circularMap(index, scale, 0, values.length - 1))];
}

function write(str, x, y, size) {
  fill(255);
  stroke(0);
  strokeWeight(0);
  textSize(size || 18);
  text(str, x, y);
}

function fps() {
  fill(255);
  stroke(0);
  strokeWeight(0);
  textSize(18);
  text(frameRate(), 10, 22);
}

function draw() {
  const seconds = frameCount / 60;
  const time = seconds;

  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));

  //fps();
}
