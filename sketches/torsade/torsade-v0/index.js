const polarCoefficients = [
  [1, 1],
  [2, 3],
  [4, 3],
  [2, 4],
  [3, 3],
  [1, 1],
];

import { shapes, sketch, converters, animation, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 4;
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
} );

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

  draw(time, index) {
    let { position, size, start, end } = this;

    const hueCadence = index + time * 3;
    // const cadence = index / shapes.length + time;
    // const interpolation = 0.09;
    // const [x, y] = mappers.circularIndex(cadence, polarCoefficients);

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

    // this.xPolarCoefficient = map(cos(time+index), -1, 1, -PI/2, PI);
    // this.yPolarCoefficient = map(sin(time), -1, 1, -PI, PI/2);

    const waveAmplitude = size;

    push();
    translate(
      position.x, // * easeInOutBack(map(sin(time+index), -1, 1, 0.2, 1)),
      position.y // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    this.xPolarCoefficient = animation.sequence("x", index+time/2, [1, 2, 4, 2, 3, 1], 0.009)
    this.yPolarCoefficient = animation.sequence("y", index+time/3, [1, 3, 3, 4, 3, 1], 0.008)

    const lerpStep = 1 / 600;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const { xPolarCoefficient, yPolarCoefficient } = this;

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
        converters.polar.get(
          sin,
          xOffset,
          angle + yPolarCoefficient,
          xPolarCoefficient
        ),
        converters.polar.get(
          cos,
          yOffset,
          angle + xPolarCoefficient,
          yPolarCoefficient
        )
      );
      const nextVector = createVector(
        converters.polar.get(sin, xOffset, angle, xPolarCoefficient),
        converters.polar.get(cos, yOffset, angle, yPolarCoefficient)
      );

      const opacityFactor = map(
        lerpIndex,
        0,
        5,
        map(
          sin(-time * (index % 2 === 0 ? -1 : 1) * 2 + lerpIndex * 50),
          -1,
          1,
          1,
          7
        ),
        1
      );

      const w = map(sin(index+time+angle/30+lerpIndex*10), -1, 1, 25, 90);

      beginShape();
      strokeWeight(75);
      strokeWeight(w);

      stroke(
        map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle + hueCadence), -1, 1, 0, 255) / opacityFactor,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor,
        map(xPolarCoefficient + yPolarCoefficient, 0, 15, 0, 255)
      );

      vertex(vector.x, nextVector.y);
      vertex(nextVector.x, vector.y);

      endShape();
      pop();
    }

    pop();
  }
}

sketch.draw( time => {
  background(0, 8);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
