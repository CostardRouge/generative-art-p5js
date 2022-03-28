import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

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

function easeInElastic(x) {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
}

function easeInOutBack(x) {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
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

  draw(time, index) {
    const { position, size, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 70;
    const shadowIndexStep = 0.07;

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

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(shadowIndex + time * 3),
          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] * 100
        ),
        // opacityFactorRange[0],
        opacityFactorRange[1]/2
      );

      // const l = map(sin(time + shadowIndex), -1, 1, 0.5, 0.2) / 3;
      // const x = map(easeInElastic(map(cos(time), -1, 1, 0, 1)), 0, 1, l, -l);
      // const y = map(easeInElastic(map(sin(time), -1, 1, 0, 1)), 0, 1, l, -l);

      // translate(x, y);

      const t = map(sin(time), -1, 1, -50, 50);
      const i = map(
        sin(time + shadowIndex),
        -1,
        1,
        map(cos(time), -1, 1, -t, t),
        map(sin(time), -1, 1, t, -t)
      );
      const shadowOffset = radians(i);
      const angleStep = TAU / 4//map(sin(time), -1, 1, 3, 5);
      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time : time) * 1 + shadowOffset,
          map(sin(time + shadowIndex), -1, 1, size * 0.2, size * 1.2)
        );

        beginShape();
        strokeWeight(weight);
        stroke(
          colors.rainbow(
            hueCadence + shadowIndex*2 + angle,
            opacityFactor / 2
          )
          // colors.rainbow(hueCadence + angle, opacityFactor / 2)
        );

        vertex(vector.x, vector.y);
        vertex(-vector.x, vector.y);

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
