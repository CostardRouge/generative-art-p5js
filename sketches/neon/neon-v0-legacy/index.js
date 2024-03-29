const polarCoefficients = [
  [1, 1],
  [2, 1],
  [1, 3],
  [1, 2],
  [1, 1],
];

import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 3;
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
            x: 0, //x / (xCount + 1),
            y: 0, //y / (yCount + 1),
          },
        })
      );
    }
  }
} );

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
    let { position, size, start, end, weight, opacityFactor } = this;

    const hueCadence = index + time;
    const cadence = index / shapes.length + time;
    const interpolation = 0.05;
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

    // this.xPolarCoefficient = map(cos(time+index), -1, 1, -PI/4, PI/4);
    // this.yPolarCoefficient = map(sin(time), -1, 1, -PI/4, PI/4);

    const { xPolarCoefficient, yPolarCoefficient } = this;
    const waveAmplitude = size * map(sin(time), -1, 1, 1.5, -1.5);

    push();
    translate(width / 2, height / 2);

    const lerpStep = 1 / map(index, 0, shapes.length - 1, 75, 200); //map(mouseY, height, 0, 1, 64, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      push();
      translate(lerpPosition.x, lerpPosition.y);

      const angle = map(lerpIndex, 0, 1, -PI, PI);
      const yOffset = map(cos(angle + time * 2), -1, 1, -PI, PI);
      const xOffset = map(sin(angle + time), -1, 1, -PI, PI);

      const vector = createVector(
        converters.polar.get(
          sin,
          waveAmplitude,
          xOffset,
          xPolarCoefficient
        ),
        converters.polar.get(
          cos,
          waveAmplitude,
          yOffset,
          yPolarCoefficient
        )
      );

      beginShape();
      strokeWeight(weight);

      stroke(
        map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle + hueCadence), -1, 1, 0, 255) / opacityFactor,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
      );

      vertex(vector.x, vector.y);
      vertex(vector.x, vector.y);

      endShape();
      pop();
    }

    pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
