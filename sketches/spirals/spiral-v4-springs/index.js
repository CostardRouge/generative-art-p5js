import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 3;
  const yCount = 3;
  const size = (width + height) / 2 / (xCount + yCount) / 5.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          shadowsCount: 100,
          weightRange: [30, 30],
          opacityFactorRange: [7, 1],
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
    const { position, shadowsCount, size, weightRange, opacityFactorRange } =
      this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    for (let shadowIndex = 0; shadowIndex <= shadowsCount; shadowIndex += 1) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        weightRange[0],
        weightRange[1]
      );
      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        opacityFactorRange[0],
        opacityFactorRange[1]
      );
      const shadowOffset = radians(shadowIndex * 7);

      const indexCoefficient = index / 8;
      const x = map(sin(time + indexCoefficient), -1, 1, -1, 1);
      const y = map(cos(time + indexCoefficient), -1, 1, -1, 1);

      translate(x, y);
      const angleStep = TAU / 3; //map(sin(time + indexCoefficient), -1, 1, 1, 3);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        translate(
          converters.polar.vector(
            angle + sin(time) * 5 + shadowOffset,
            size
          )
        );

        const vector = converters.polar.vector(angle, 5);

        beginShape();
        strokeWeight(weight);
        stroke(
          color(
            map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + hueCadence), -1, 1, 0, 255) / opacityFactor,
            map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
          )
        );

        vertex(vector.x, vector.y);
        vertex(vector.x, vector.y);

        endShape();
        pop();
      }
    }

    pop();
  }
}

sketch.draw((time) => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
