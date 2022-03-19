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
          shadowsCount: 250,
          weightRange: [70, 20],
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
    const waveAmplitude = size; //map(sin(-time), -1, 1, size, 10 * index);
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
      const angleStep = TAU / 1;
      const shadowOffset = radians(shadowIndex * 7);

      const indexCoefficient = index / 5;
      const l = 0.7;
      const x = map(sin(time*2 + indexCoefficient), -1, 1, -0.5, 0.5);
      const y = map(cos(time + indexCoefficient), -1, 1, -l, l);

      translate(
        x,
        y// * sin(shadowOffset + time / 2) * cos(shadowOffset + time / 2) * waveAmplitude
      );

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        translate(
          converters.polar.vector(angle + time * 3 + shadowOffset, size)
        );

        // const aS = map(sin(angle + time), -1, 1, 0, PI);
        const vector = this.getVector(angle, 0, waveAmplitude);
        // const nextVector = this.getVector(angle + 0, 0, waveAmplitude);

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
        // vertex(nextVector.x, nextVector.y);

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

sketch.draw((time) => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
