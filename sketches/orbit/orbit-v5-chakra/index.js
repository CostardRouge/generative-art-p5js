function setup() {
  // utils.canvas.create(utils.presets.FILL);
  // utils.canvas.create(utils.presets.SQUARE.HD);
  utils.canvas.create({ width: 768, height: 1368 });


  //utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleCanvasRecordingOnKey();
  utils.events.toggleFPSCounter();

  noStroke();

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 6;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
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
    const { position, size } = this;

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 2000;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1 /10, PI, -PI);
      const t = map(sin(time / 2 - lerpIndex / 8 + index), -1, 1, -8, 8);
      const waveIndex = angle + t;
      const xOffset = map(sin(waveIndex), -1, 1, -size * 2, size * 2);
      const yOffset = map(cos(waveIndex), -1, 1, -size * 2, size * 2);

      const hueIndex = lerpIndex + angle - time + index / 3;
      let hueFactor = map(lerpIndex, 0, 1, 5, 1);

      fill(
        map(sin(hueIndex), -1, 1, 0, 360) / hueFactor,
        map(cos(-hueIndex), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex), -1, 1, 255, 0) / hueFactor
      );

      const xOff =
        map(sin(time), 1, 0, -xOffset, xOffset) *
        map(cos(time), -1, 1, 0.3, 0.1);
      const yOff =
        map(cos(time), 0, 1, -yOffset, yOffset) * map(sin(time), -1, 1, 0, 0.8);
      let s = map(
        lerpIndex,
        0,
        1,
        (height) / (shapes.length + 2),
        map(sin(angle*2+time) * cos(angle*2+time), -1, 1, -20, 70)
      );

      circle(xOff, yOff, s);
    }

    pop();
  }
}

function draw() {
  background(0);

  shapes.forEach((shape, index) => shape.draw(utils.time.seconds(), index));

  utils.debug.fps();
}
