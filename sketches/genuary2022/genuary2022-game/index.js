utils.sketch.setup(() => {
  const xCount = 5;
  const yCount = 5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          weightRange: [150, 20],
          opacityFactorRange: [10, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
}, { width: 768, height: 1368 });

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
    const { position, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time;
    push();
    const x = map(sin(time + index/4), -1, 1, 0, position.x * 2);
    const y = map(cos(time + index/4), -1, 1, 0, position.y * 2);
    translate(x % width, y % height);

    const shadowsCount = 15;
    const shadowIndexStep = 0.3;

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
          sin(shadowIndex + time),
          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0]/60
        ),
        opacityFactorRange[1]
      );

      for (let angle = 0; angle < TAU; angle += TAU / 1) {
        push();
        beginShape();
        strokeWeight(weight);
        stroke(utils.colors.rainbow(hueCadence + angle, opacityFactor));

        vertex(0, 0);
        vertex(0, 0);

        endShape();
        pop();
      }
    }

    pop();
  }
}

utils.sketch.draw(time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
})