import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

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
          weightRange: [250, 100],
          opacityFactorRange: [10, 1],
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
    const {
      position,
      shadowsCount,
      size,
      start,
      end,
      weightRange,
      opacityFactorRange,
    } = this;
    const hueCadence = index + time;

    const { xPolarCoefficient, yPolarCoefficient } = this;
    const waveAmplitude = size;

    push();
    translate(position.x, position.y);

    for (let shadowIndex = 0; shadowIndex <= shadowsCount; shadowIndex++) {
      const lerpStep = 1 / 200;
      //map(shadowIndex, 0, shadowsCount, 75, 20);
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

      for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
        const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

        push();
        translate(lerpPosition.x, lerpPosition.y);

        const angle = map(lerpIndex, 0, 0.6, -PI, PI);
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
    }

    pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
