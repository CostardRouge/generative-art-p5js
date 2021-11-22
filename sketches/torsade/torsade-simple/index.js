function setup() {
  // utils.canvas.create({ size: "FILL" });
  utils.canvas.create({ height: 1080, width: 1080 });

  utils.events.fullScreenOnDoubleClick();
  //utils.events.extendCanvasOnResize();
  utils.events.toggleNoLoopOnSingleClick();
  //noStroke();
  pixelDensity(1);

  const xCount = 1;
  const yCount = 2;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weight: map(y, 1, yCount, 250, 75),
          opacityFactor: map(y, 1, yCount, 6, 1),
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
    let { position, size, start, end, weight, opacityFactor } = this;

    const hueCadence = index + time;
    const cadence = index / shapes.length + time;
    const interpolation = 0.05;
    // const [x, y] = circularIndex(cadence, polarCoefficients);

    // this.xPolarCoefficient = lerp(
    //   this.xPolarCoefficient || 0,
    //   x,
    //   interpolation
    // );
    // this.yPolarCoefficient = lerp(
    //   this.yPolarCoefficient || 0,
    //   y,
    //   interpolation
    // );

    // this.xPolarCoefficient = map(cos(time+index), -1, 1, -PI/4, PI/4);
    // this.yPolarCoefficient = map(sin(time), -1, 1, -PI/4, PI/4);

    const { xPolarCoefficient, yPolarCoefficient } = this;
    const waveAmplitude = size// *  map(sin(time), -1, 1, 1.5, -1.5);

    push();
    translate(position.x, position.y);

    let lerpStep = 1 / 200;//map(index, 0, shapes.length -1, 75, 200); //map(mouseY, height, 0, 1, 64, true);

    if ( index === 0) {
      lerpStep = 1 / circularIndex(cadence, [5, 10, 20, 40, 80, 100, 150, 150, 150]);
    }

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      push();
      translate(lerpPosition.x, lerpPosition.y);

      const angle = map(lerpIndex, 0, 1, -PI, PI);
      const yOffset = map(cos(angle + time * 2), -1, 1, -PI, PI);
      const xOffset = map(sin(angle + time), -1, 1, -PI, PI);

      const vector = createVector(
        getPolar(sin, waveAmplitude, xOffset, xPolarCoefficient),
        getPolar(cos, waveAmplitude, yOffset, yPolarCoefficient)
      );

      beginShape();
      strokeWeight(75);

      stroke(
        map(sin(angle + hueCadence), -1, 1, 0, 360) / 1,
        map(cos(angle + hueCadence), -1, 1, 0, 255) / 1,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / 1
      );

      vertex(vector.x, vector.y);
      vertex(vector.x, vector.y);

      endShape();
      pop();
    }

    pop();
  }
}

function draw() {
  const seconds = frameCount / 60;
  const time = seconds;

  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
  //utils.debug.fps();
}
