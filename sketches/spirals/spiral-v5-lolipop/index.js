function setup() {
  utils.canvas.create(utils.presets.SQUARE.HD);
  // utils.canvas.create(utils.presets.IPHONE_12.PORTRAIT);
  // utils.canvas.create(utils.presets.FILL);

  // utils.canvas.create({
  //   width: 1080,
  //   height: 1080,
  //   ratio: 9 / 16,
  // });

  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.fullScreenOnDoubleClick();
  utils.events.toggleCanvasRecordingOnKey();

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 7;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          shadowsCount: 10,
          weightRange: [160, 20],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
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
    const { position, size, weightRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 10; //map(sin(time), -1, 1, 1, 10)
    const shadowIndexStep = 0.2; //map(sin(time), -1, 1, 0.2, 0.05);

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

      const shadowOffset = radians(shadowIndex * map(sin(time), -1, 1, -5, 5));
      const angleStep = TAU / 15; //map(sin(time / (1+index)), -1, 1, 3, 10);

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
            map(sin(angle + hueCadence), -1, 1, 0, 360),
            map(cos(angle + hueCadence), -1, 1, 0, 255),
            map(sin(angle + hueCadence), -1, 1, 255, 0)
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