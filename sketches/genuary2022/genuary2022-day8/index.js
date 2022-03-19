import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 30;

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

    const shadowsCount = 15;
    const shadowIndexStep = 0.01;

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
          opacityFactorRange[0]/60
        ),
        // opacityFactorRange[0],
        opacityFactorRange[1]/2
      );

      // const l = map(sin(time + shadowIndex), -1, 1, 0.5, 0.2)*2;
      // const indexCoefficient = shadowIndex;
      // const x = map(sin(time * -2 + indexCoefficient), -1, 1, -l, l);
      // const y = map(cos(time * 2 + indexCoefficient), -1, 1, -l, l);

      // translate(x, y);

      // const i = map(sin(time/5 + index), -1, 1, 0, 100);
      const shadowOffset = radians(shadowIndex * 100);
      const angleStep = TAU / 1//map(sin(time/2), -1, 1, 10, 1);
      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        // const vector = converters.polar.vector(
        //   angle + (index % 2 ? -time : time) * 0 + shadowOffset,
        //   map(sin(time + shadowIndex), -1, 1, size * 0.2, size * 1.5)
        // );

        // const s = map(sin(time + shadowIndex), -1, 1, size * 0.2, size * 1.5);


        const a = angle + (index % 2 ? -time : time) * -1 + shadowOffset;
        const w = map(sin(time), -1, 1, 10, 1);
        const h = map(cos(time), -1, 1, 10, 1);
        const vector = createVector(
          converters.polar.get(sin, size*w, a,),
          converters.polar.get(cos, size*h, a)
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
