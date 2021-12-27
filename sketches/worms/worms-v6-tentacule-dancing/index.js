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
  const size = (width + height) / 2 / (xCount + yCount) / 2;

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
    const { position, size, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 5;
    const shadowIndexStep = 0.015;

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

      const l = map(sin(time + shadowIndex), -1, 1, 1.5, 0.2);
      const indexCoefficient = shadowIndex;
      const x = map(sin(time * -2 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time + indexCoefficient), -1, 1, -l, l);

      translate(x, y);

      const i = map(sin(time+index), -1, 1, 1, 30);
      const shadowOffset = radians(shadowIndex * i);
      const angleStep = TAU / 8
      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = utils.converters.polar.vector(
          angle + (index % 2 ? -time : time) * -1 + shadowOffset,
          map(sin(time + shadowIndex), -1, 1, size * 0.1, size)
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

function draw() {
  background(0);
  shapes.forEach((shape, index) => shape.draw(utils.time.seconds(), index));
  utils.debug.fps();
}
