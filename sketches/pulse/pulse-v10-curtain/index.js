function setup() {
  utils.canvas.create(utils.presets.SQUARE.HD);
  // utils.canvas.create(utils.presets.PORTRAIT.HD);
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

  noLoop()

  const xCount = 7;
  const yCount = 1;
  const size = (width + height) / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new GroundLine({
          size,
          weightRange: [150, 20],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
}

class GroundLine {
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
    translate(position.x, height / 2 - position.y + -15);

    const shadowsCount = 50; //map(sin(time), -1, 1, 10, 10)
    const shadowIndexStep = 0.1; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {

      // const shadowOffset = radians(shadowIndex * map(sin(time), -1, 1, 15, -15));

      const w = map(shadowIndex, 0, shadowsCount, -1/3, 5);
      const h = (((size * 10) / shadowsCount) * shadowIndexStep);
      translate(
        map(
          sin(time*1.5 + index / 10 + (shadowIndex / 5 + index / 4)),
          -1,
          1,
          -w,
          w
        ) + 0,
        h*2
      );

        push();
        const vector = utils.converters.polar.vector(
          0,//map(shadowIndex, 0, shadowsCount, -TAU, TAU),
          size / map(shadowIndex, 0, shadowsCount, 10, 1)
        );

        const f = map(shadowIndex, 0, shadowsCount, 1, 5);
        let opacityFactor = map(
          sin(shadowIndex / f - time * 3 + index / 2),
          -1,
          1,
          1,
          15
        );

        // opacityFactor = 1;

        beginShape();
        // strokeWeight(map(sin(time*3 + index + shadowIndex/2), -1, 1, weightRange[0], weightRange[1]));
        strokeWeight(map(sin(time+shadowIndex/3) ,-1, 1, weightRange[0], weightRange[1]));
        stroke(
          color(
            map(sin(hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(sin(hueCadence), -1, 1, 360, 0) / opacityFactor
          )
        );

        vertex(vector.x, vector.y);
        vertex(vector.x, vector.y);

        endShape();
        pop();
    }

    pop();
  }
}
utils.sketch.draw((time) => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});