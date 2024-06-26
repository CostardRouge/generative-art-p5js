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
          shadowsCount: 10,
          weightRange: [300, 25],
          opacityFactorRange: [5, 1],
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
    const { position, size, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 3; //map(sin(time), -1, 1, 10, 20)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const indexCoefficient = shadowIndex;
      const l = map(sin(time + shadowIndex), -1, 1, 1.5, 2);
      const x = map(sin(time * -2 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time + indexCoefficient), -1, 1, -l, l);

      translate(x, y);

      const i = map(sin(time), -1, 1, 1, 70);
      const shadowOffset = radians(shadowIndex * i);
      const angleStep = TAU / map(sin(time + shadowIndex), -1, 1, 3, 10);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time : time) * 1 + shadowOffset,
          size//map(sin(time + shadowIndex), -1, 1, size*0.1, size)
        );

        const opacityFactor = map(
          shadowIndex,
          0,
          shadowsCount,
          map(
            sin(time + angle),
            -1,
            1,
            opacityFactorRange[0],
            opacityFactorRange[0] * 5
          ),
          opacityFactorRange[1]
        );

        const weight = map(
          shadowIndex,
          0,
          shadowsCount,
          map(sin(time * 2 + angle), -1, 1, weightRange[0], weightRange[0] * 5),
          weightRange[1]
        );

        beginShape();
        strokeWeight(weight);
        stroke(
          color(
            map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + hueCadence), -1, 1, 360, 0) / opacityFactor,
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
