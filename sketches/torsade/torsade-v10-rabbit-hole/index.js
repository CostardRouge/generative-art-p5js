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
  const size = (width + height) / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weightRange: [75, 20],
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

    const shadowsCount = 30; //map(sin(time), -1, 1, 10, 10)
    const shadowIndexStep = 0.05; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        weightRange[1],
        weightRange[0]
      );

      // const shadowOffset = radians(shadowIndex * map(sin(time), -1, 1, 15, -15));

      const l = 1/3;
      translate(
        map(sin(time*2), -1, 1, -l, l),
        map(cos(time), -1, 1, -l, l)
      );
      const angleStep = TAU / 15//map(sin(time), -1, 1, 3, 15);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = utils.converters.polar.vector(
          angle + (index % 2 ? -time : time) * 1 - radians(7*shadowIndex),
          size/map(shadowIndex, 0, shadowsCount, 5, 1/5)
        );

      let opacityFactor = map(sin(shadowIndex/5-time*5+angle), -1, 1, 1, 15);

        beginShape();
        strokeWeight(weight);
        // strokeWeight(map(sin(2*time+angle+shadowIndex*2),-1, 1, weightRange[0], weightRange[1]));
        stroke(
          color(
            map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
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