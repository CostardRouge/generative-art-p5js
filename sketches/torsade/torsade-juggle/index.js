import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
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

    const { xPolarCoefficient, yPolarCoefficient } = this;
    const waveAmplitude = size * map(sin(time), -1, 1, -1.5, 1.5);

    push();
    translate(position.x, position.y);

    let lerpStep = 1 / 200;

    if (index === 0) {
      lerpStep =
        1 /
        mappers.circularIndex(
          cadence,
          [5, 10, 20, 40, 80, 100, 150, 150, 150]
        );
    }

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

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
