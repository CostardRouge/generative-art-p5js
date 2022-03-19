import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          shadowsCount: 3,
          weightRange: [300, 75],
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

    const waveAmplitude = size; //map(sin(time), -1, 1, size, 0);

    push();
    translate(position.x, position.y);

    for (let shadowIndex = 0; shadowIndex <= shadowsCount; shadowIndex++) {
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
      const angleStep = TAU / 10; //map(shadowIndex, 0, shadowsCount, 1, 15);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const s = map(cos(time), -1, 1, 0, size * 1.5);
        translate(converters.polar.vector(angle, s));

        const vector = this.getVector(angle, time, s);
        const nextVector = this.getVector(angle + angleStep, time, s);

        beginShape();
        strokeWeight(weight);

        stroke(
          map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
          map(cos(angle + 0), -1, 1, 0, 255) / opacityFactor,
          map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
        );

        vertex(vector.x, vector.y);
        vertex(vector.x, vector.y);
        // vertex(nextVector.x, nextVector.y);
        // vertex(
        //   map(cos(time), -1, 1, -vector.x, vector.x),
        //   map(sin(time), -1, 1, -vector.x, vector.y)
        // );

        // vertex(
        //   map(sin(time), -1, 1, -nextVector.x, nextVector.x),
        //   map(cos(time), -1, 1, -nextVector.y, nextVector.y)
        // );

        endShape();
        pop();
      }
    }

    pop();
  }

  getVector(angle, time, waveAmplitude) {
    const xAngle = map(sin(angle - time / 2), -1, 1, -PI, PI);
    const yAngle = map(cos(angle + time / 2), -1, 1, -PI, PI);

    return createVector(
      converters.polar.get(sin, waveAmplitude, xAngle),
      converters.polar.get(cos, waveAmplitude, yAngle)
    );
  }
}
sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
