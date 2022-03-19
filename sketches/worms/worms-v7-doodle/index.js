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
          opacityFactorRange: [15, 1],
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

    const shadowsCount = 50;
    const shadowIndexStep = 0.05;

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const l = map(sin(time + shadowIndex), -1, 1, 0.1, 0.5);
      const x = map(cos(time + shadowIndex), -1, 1, -l, l);
      const y = map(cos(-time*2 + shadowIndex), -1, 1, -l, l);

      translate(x, y);

      const w = map(sin(time+index+shadowIndex), -1, 1, 10, 30);
      const angleStep = TAU / 4;
      for (let angle = 0; angle < TAU; angle += angleStep) {
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time : time) * -1 + radians(shadowIndex * 30),
          map(sin(time + angle), -1, 1, 1, size)
        );

        const opacityFactor = map(
          shadowIndex,
          0,
          shadowsCount,
          map(
            sin(angle+time),
            -1,
            1,
            opacityFactorRange[0],
            opacityFactorRange[0]
          ),
          opacityFactorRange[1]
        );

        fill(
          color(
            map(sin(angle + shadowIndex), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + hueCadence), -1, 1, 360, 0) / opacityFactor,
            map(sin(angle + hueCadence), -1, 1, 360, 0) / opacityFactor
          )
        );

        circle(vector.x, vector.y, w);
      }
    }

    pop();
  }
}

sketch.draw(time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
})
