utils.sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weightRange: [150, 50],
          opacityFactorRange: [7, 1],
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

    const shadowsCount = 5; //map(sin(time), -1, 1, 10, 20)
    const shadowIndexStep = 0.02

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
        opacityFactorRange[0],
        opacityFactorRange[1]
      );

      const l = 5/3
      const indexCoefficient = shadowIndex;
      const x = map(sin(time*3 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time + indexCoefficient), -1, 1, -l, l);

      translate(x, y);

      const i = map(sin(time), -1, 1, 1, 70)
      const shadowOffset = radians(shadowIndex * i);
      const angleStep = TAU / 10//ceil(map(index, 0, shapes.length - 1, 5, 200));

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = utils.converters.polar.vector(
          angle + (index % 2 ? -time : time) * 1 + shadowOffset,
          size
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
utils.sketch.draw((time) => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});