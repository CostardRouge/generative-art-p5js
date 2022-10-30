import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weightRange: [400, 20],
          opacityFactorRange: [10, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
})

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
    const { position, size, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 10;
    const shadowIndexStep = 0.03;

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        weightRange[0],
        weightRange[1]
      );

      const r = map(shadowIndex, 0, shadowsCount, 1, 5);
      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(shadowIndex * r + time * 5),
          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] * 10
        ),
        opacityFactorRange[1]
      );

      const angleStep = TAU / 5
      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time : time) * 0,
          size //map(sin(time + shadowIndex), -1, 1, size * 0.1, size * 1.5)
        );

        beginShape();
        strokeWeight(weight);
        stroke(colors.rainbow(hueCadence + angle, opacityFactor));

        vertex(vector.x, vector.y);
        vertex(vector.x, vector.y);

        endShape();
        pop();
      }
    }

    pop();
  }
}

sketch.draw(time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
})
