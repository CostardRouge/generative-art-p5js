import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 4.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
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

  draw(time, index, angleStep) {
    let { position, size } = this;

    const hueCadence = index + time;
    push();
    translate(position);

    for (let angle = 0; angle < TAU; angle += angleStep) {
      push();
      translate(
        converters.polar.vector(angle, size)
      );

      const xOffset =
        map(sin(angle + time), -1, 1, -PI, PI) *
        easeInOutBack(map(sin(time + index), -1, 1, 0.2, 1));
      const yOffset =
        map(cos(angle + time), -1, 1, -PI, PI) *
        easeInOutBack(map(sin(time + index), -1, 1, 0.2, 1));

      const vector = createVector(
        converters.polar.get(sin, size, angle + xOffset),
        converters.polar.get(cos, size, angle + yOffset)
      );
      const nextVector = converters.polar.vector(
        cos,
        angle + angleStep
      );

      beginShape();
      strokeWeight(150);

      stroke(
        map(sin(angle + index + hueCadence), -1, 1, 0, 360),
        map(cos(angle + index + hueCadence), -1, 1, 0, 255),
        map(sin(angle + index + hueCadence), -1, 1, 255, 0)
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
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
