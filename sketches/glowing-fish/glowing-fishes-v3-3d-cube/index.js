const polarCoefficients = [
  [1, 1],
  [2, 3],
  [4, 3],
  [2, 6],
  [4, 6],
  [6, 3],
];

function setup() {
  utils.canvas.create(utils.presets.FILL);
  utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  // frameRate(30)
  //pixelDensity(0.004)

  const xCount = 2;
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
    this.calculateRelativePosition();
  }

  calculateRelativePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRelativePosition();
  }

  draw(time, index, angleStep) {
    let { position, size, start, end } = this;

    const hueCadence = index + time / 2;
    const cadence = index / shapes.length + time / 2;
    const interpolation = 0.05;
    const [x, y] = utils.mappers.circularIndex(cadence, polarCoefficients);

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

    const { xPolarCoefficient, yPolarCoefficient } = this;
    const waveAmplitude = size / 2;

    push();
    translate(
      position.x, // * easeInOutBack(map(sin(time+index), -1, 1, 0.2, 1)),
      position.y // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    //size = easeOutElastic(map(sin(time), -1, 1, 0, 0.1)) * size
    // const lerpStep = 1/10;
    const lerpStep = 1 / 200; //map(mouseY, height, 0, 1, 64, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      push();
      translate(lerpPosition.x, lerpPosition.y);

      const angle = map(lerpIndex, 0, 1, -PI / 2, PI / 2);

      const yOffset = map(
        sin(angle + index + time * 2),
        -1,
        1,
        -waveAmplitude,
        waveAmplitude
      );
      const xOffset = map(
        cos(angle + index + time * 2),
        -1,
        1,
        waveAmplitude,
        -waveAmplitude
      );

      const vector = createVector(
        utils.converters.polar.get(
          sin,
          xOffset,
          angle + yPolarCoefficient,
          xPolarCoefficient
        ),
        utils.converters.polar.get(
          cos,
          yOffset,
          angle + xPolarCoefficient,
          yPolarCoefficient
        )
      );
      const nextVector = createVector(
        utils.converters.polar.get(
          sin,
          size + yOffset,
          angle + angleStep,
          xPolarCoefficient
        ),
        utils.converters.polar.get(
          cos,
          size + xOffset,
          angle + angleStep,
          yPolarCoefficient
        )
      );

      beginShape();
      strokeWeight(75);

      stroke(
        map(sin(angle + index + hueCadence), -1, 1, 0, 255),
        map(cos(angle + index + hueCadence), -1, 1, 0, 255),
        map(sin(angle + index + hueCadence), -1, 1, 255, 0)
        //map(xPolarCoefficient + yPolarCoefficient, 0, 10, 0, 255)
      );

      vertex(vector.x, nextVector.y);
      vertex(nextVector.x, vector.y);

      endShape();
      pop();
    }

    utils.text.write(
      `${xPolarCoefficient} - ${yPolarCoefficient}`,
      -size,
      size + 20
    );

    pop();
  }
}

function draw() {
  const seconds = frameCount / 60;
  const time = seconds;
  const angleAmount = 512 / shapes.length;
  const angleStep = TAU / angleAmount;

  background(0);

  //  background(
  //     map(sin(time), -1, 1, 128, 255),
  //     map(cos(time), -1, 1, 128, 255),
  //     map(sin(time), -1, 1, 255, 128),
  //    128
  //   )

  shapes.forEach((shape, index) => shape.draw(time, index, angleStep));

  // write(`TAU / ${angleAmount}`, shapes[0 ].size * 2, shapes[0 ].size );

  utils.debug.fps();
}
