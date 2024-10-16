import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
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

    const shadowsCount = 7//map(sin(time), -1, 1, 2.5, 5)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        200,
        1
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(-time * 5 + shadowIndex * 4),
          -1,
          1,
          5,
          25
        ),
        1
      );

      const l = shadowIndex/3;
      const indexCoefficient = shadowIndex;
      const x = map(sin(time * 1 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time * -2 + indexCoefficient), -1, 1, -l, l);

      translate(x, y);

      const angleStep = TAU / 1

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle,
          weight*5
        );

        beginShape();
        strokeWeight(weight);
        // stroke(
        //   color(
        //     map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
        //     map(cos(angle + hueCadence), -1, 1, 360, 0) / opacityFactor,
        //     map(sin(angle + hueCadence), -1, 1, 360, 0) / opacityFactor,
        //     10
        //   )
        // );

        rotate(sin(time+shadowIndex));
        // rotate(TAU, 0, TAU, -1, 1);

        stroke(
          color(
            map(sin(hueCadence + shadowIndex + l), -1, 1, 0, 360) /
              opacityFactor,
            map(cos(hueCadence - shadowIndex + l), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueCadence + shadowIndex + l), -1, 1, 360, 0) /
              opacityFactor,
              10//map(sin(shadowIndex + time*2), -1, 1, 0, 360)
          )
        );

        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);

        

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
