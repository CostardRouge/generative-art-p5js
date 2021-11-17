const shapes = [];
const canvasSize = 1080;
// const canvas = {
//   width: canvasSize,
//   height: canvasSize //* 1.5
// };

const canvas = {
  width: 1170 / 2,
  height: 2532 / 2, //* 1.5
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
    pixilatedCanvas.resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(canvas.width, canvas.height);
    pixilatedCanvas.resizeCanvas(canvas.width, canvas.height);
  }

  shapes.forEach((shape) => shape.onWindowResized());
}

function preload() {
  font = loadFont("assets/fonts/roboto-mono.ttf");
}

const polarCoefficients = [
  [1, 1],
  [2, 3],
  // [4, 3],
  [2, 6],
  // [4, 6],
  [1, 3],
];
let pixilatedCanvas;

function setup() {
  createCanvas(canvas.width, canvas.height);

  pixilatedCanvas = createGraphics(canvas.width, canvas.height);
  pixilatedCanvas.pixelDensity(0.05);
  //frameRate(30)
  //pixelDensity(1);
  // noSmooth();

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 5.5;

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

  draw(time, index, angleStep) {
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const cadence = index / shapes.length + time / 2;
    const interpolation = 0.05;
    const [x, y] = circularIndex(cadence, polarCoefficients);

    this.xPolarCoefficient = lerp(
      this.xPolarCoefficient || 0,
      x,
      interpolation
    );
    this.yPolarCoefficient = 3; //lerp(this.yPolarCoefficient || 0, y, interpolation);

    const { xPolarCoefficient, yPolarCoefficient } = this;

    push();
    pixilatedCanvas.push();

    translate(
      position.x, // * easeInOutBack(map(sin(time+index), -1, 1, 0.2, 1)),
      position.y // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    pixilatedCanvas.translate(
      position.x * easeInOutBack(map(sin(time + index), -1, 1, 0.3, 1)),
      position.y - 100 // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    for (let angle = 0; angle < TAU; angle += angleStep) {
      push();
      translate(getPolar(sin, size, angle), getPolar(cos, size, angle));

      const xOffset =
        map(sin(angle + time), -1, 1, -PI, PI) *
        easeInOutBack(map(sin(time + index), -1, 1, 0.2, 1));
      const yOffset =
        map(cos(angle + time), -1, 1, -PI, PI) *
        easeInOutBack(map(sin(time + index), -1, 1, 0.2, 1));

      const vector = createVector(
        getPolar(sin, size, angle + xOffset, xPolarCoefficient),
        getPolar(cos, size, angle + yOffset, yPolarCoefficient)
      );
      const nextVector = createVector(
        getPolar(sin, size, angle + angleStep, xPolarCoefficient),
        getPolar(cos, size, angle + angleStep, yPolarCoefficient)
      );

      beginShape();
      pixilatedCanvas.beginShape();

      pixilatedCanvas.strokeWeight(size);
      strokeWeight(size);

      const c = color(
        map(sin(angle + index + hueCadence), -1, 1, 0, 360),
        map(cos(angle + index + hueCadence), -1, 1, 0, 255),
        map(sin(angle + index + hueCadence), -1, 1, 255, 0)
        //map(xPolarCoefficient + yPolarCoefficient, 0, 10, 0, 255)
      );

      stroke(c);
      pixilatedCanvas.stroke(c);

      vertex(vector.x, nextVector.y);
      vertex(nextVector.x, vector.y);

      pixilatedCanvas.endShape();
      endShape();
      pop();
    }

    //write(`${xPolarCoefficient} - ${yPolarCoefficient}`, -size, size + 20);

    pop();
    pixilatedCanvas.pop();
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
  const angleAmount = 256 / shapes.length;
  const angleStep = TAU / angleAmount;

  if (frameCount % 2 == 0) {
    background(0);

    //pixilatedCanvas.background(0, 0, 0, 0.5);
    pixilatedCanvas.filter(BLUR, 3);
    image(pixilatedCanvas, 0, 0);
  }

  shapes.forEach((shape, index) => shape.draw(time, index, angleStep));

  //  background(
  //     map(sin(time), -1, 1, 128, 360),
  //     map(cos(time), -1, 1, 128, 360),
  //     map(sin(time), -1, 1, 360, 128),
  //    64
  //   )

  // noFill()
  // stroke(255)
  // rect(bbox.x, bbox.y, bbox.w, bbox.h);

  if (frameCount % 60 == 0) {
    console.log(frameRate());
  }

  // write(`TAU / ${angleAmount}`, shapes[0 ].size * 2, shapes[0 ].size );

  //fps();
}
