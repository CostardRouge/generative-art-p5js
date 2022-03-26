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
})//, { width: 500, height: 500 });

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

    const shadowsCount = 5; //map(sin(time), -1, 1, 10, 20)
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
        weightRange[0],
        weightRange[1]*5
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(time * 7 + shadowIndex * 2),
          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] * 5
        ),
        opacityFactorRange[1] * 1.5
      );

      const l = shadowIndex/2;
      const x = map(sin(time * 1 + shadowIndex), -1, 1, -l, l)/1.7;
      const y = map(cos(time * -2 + shadowIndex), -1, 1, -l, l);

      translate(x, y);

      // const i = map(sin(time), -1, 1, 0, 2);
      const angleStep = TAU / 3//map(cos(time), -1, 1, 1, 3);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle,//angle + (index % 2 ? -time : time) * -1,
          map(cos(time + shadowIndex), -1, 1, size * 0.5, size)
        );

        beginShape();
        strokeWeight(weight/2);
        // strokeWeight(map(sin(time*2 + shadowOffset), -1, 1, weight / 4, weight));
        // stroke(
        //   color(
        //     map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
        //     map(cos(angle + hueCadence), -1, 1, 360, 0) / opacityFactor,
        //     map(sin(angle + hueCadence), -1, 1, 360, 0) / opacityFactor
        //   )
        // );

        rotate(map(cos(shadowIndex+time*2), -1, 1, -0.5, 0.5)*2);
        // rotate(TAU, 0, TAU, -1, 1);

        stroke(
          color(
            map(sin(hueCadence + shadowIndex + l), -1, 1, 0, 360) /
              opacityFactor,
            map(cos(hueCadence - shadowIndex + l), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueCadence + shadowIndex + l), -1, 1, 360, 0) /
              opacityFactor
          )
        );

        vertex(vector.x, -vector.y);
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
