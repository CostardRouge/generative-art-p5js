import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 2;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          shadowsCount: 10,
          weightRange: [160, 20],
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
    const { position, size, weightRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 5; //map(sin(time), -1, 1, 10, 10)
    const shadowIndexStep = 0.02; //map(sin(time), -1, 1, 0.2, 0.05);

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
      // let opacityFactor = map(
      //   shadowIndex,
      //   0,
      //   shadowsCount,
      //   opacityFactorRange[0],
      //   opacityFactorRange[1]
      // );

      //opacityFactor = map(sin(shadowIndex), -1, 1, -5, 5);
      let opacityFactor = map(shadowIndex, 0, shadowsCount, 3, 1);

      const shadowOffset = radians(shadowIndex * map(sin(time), -1, 1, 1, -30));
      const angleStep = TAU / map(sin(time), -1, 1, 3, 15);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time : time) * 1 + shadowOffset,
          size/map(shadowIndex, 0, shadowsCount, 5, 1)
        );

        beginShape();
        strokeWeight(weight);
        stroke(
          color(
            map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(sin(angle + hueCadence), -1, 1, 360, 0) / opacityFactor
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
