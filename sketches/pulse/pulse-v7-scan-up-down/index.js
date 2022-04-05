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
          weightRange: [200, 20],
          opacityFactorRange: [5, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
});

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


    const shadowsCount = 5//map(sin(time), -1, 1, 1, 5)
    const shadowIndexStep = 0.02; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {

    // rotate(radians(sin(time/2)/2+shadowIndex/2000));

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
          sin(-time * 3 + shadowIndex),
          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] * 10
        ),
        opacityFactorRange[1]
      );

      const l = 0.6;
      const indexCoefficient = shadowIndex;
      const x = map(sin(time * 1 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time * 3 + indexCoefficient), -1, 1, -l, l);

      translate(x, y*3);

      const i = map(sin(time/2), -1, 1, 0, 5);
      const shadowOffset = radians(shadowIndex * i);
      const angleStep = TAU / 7//map(cos(time), -1, 1, 3, 5);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time/5 : time/5) * -1 + shadowOffset,
          map(cos(time + shadowIndex), -1, 1, size * 0.5, size)
        );

        beginShape();
        strokeWeight(weight);
        stroke(
          color(
            map(sin(shadowIndex + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(shadowIndex - hueCadence), -1, 1, 360, 0) / opacityFactor,
            map(sin(shadowIndex + hueCadence), -1, 1, 360, 0) / opacityFactor
          )
        );

        // vertex(vector.x, vector.y);
        // vertex(-vector.y, vector.x);

        vertex(vector.x, vector.y);
        vertex(vector.x, -vector.y);

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
