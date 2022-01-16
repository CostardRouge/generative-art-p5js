utils.sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 30;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weightRange: [800, 20],
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

    const shadowsCount = 150;
    const shadowIndexStep = 0.05;

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

      const f = 1//map(shadowIndex, 0, shadowsCount, 1, 0.5);

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          // sin(shadowIndex + time * 5),
          sin(shadowIndex / f + time * 5 + index / 2),

          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] / 2
        ),
        // opacityFactorRange[0],
        opacityFactorRange[1]
      );

      const l = map(sin(time + shadowIndex), -1, 1, 0.5, 0.2)*2;
      const indexCoefficient = shadowIndex;
      const x = map(sin(time * -2 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time * 2 + indexCoefficient), -1, 1, -l, l);

      translate(x, y);

      const shadowOffset = radians( shadowIndex * 50 );
        const vector = utils.converters.polar.vector(
          (index % 2 ? -time : time) * 0 + shadowOffset,
          size
        );

        beginShape();
        strokeWeight(weight);
        // stroke(
        //   utils.colors.rainbow(hueCadence + shadowIndex + l, opacityFactor)
        // );

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
        // stroke(utils.colors.rainbow(2.1, opacityFactor));
        // print(hueCadence + angle);

        point(vector.x, vector.y);
    }

    pop();
  }
}

utils.sketch.draw(time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
})