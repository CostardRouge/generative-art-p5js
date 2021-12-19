function setup() {
  utils.canvas.create(utils.presets.FILL);
  utils.canvas.create(utils.presets.SQUARE.HD);

  //utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleCanvasRecordingOnKey();
  utils.events.toggleFPSCounter();

  noStroke();

  const xCount = 1;
  const yCount = 10;
  const size = (width + height) / 2 / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          // end: createVector(0, height / 2),
          // start: createVector(width / 2, 0),
          // end: createVector(-width / 2, 0),
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
    const { position, size, start, end } = this;
    const mult = map(sin(time), -1, 1, 3, 8);

    const waveAmplitude = mult * map(sin(time), -1, 1, 0, size);
    const angleLimit = -PI;

    push();
    translate(position.x, position.y + height / 2);

    const lerpStep = 1 / 190; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 40, -angleLimit, angleLimit);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const t = map(sin(time - lerpIndex / 8 + index / 8), -1, 1, -8, 8);
      const waveIndex = angle + t;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude*2, waveAmplitude*2);
      const yOffset = map(cos(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);

      const hueIndex = angle - time + index / 2;
      const hueFactor = map(lerpIndex, 0, 3, 1, 5);

      fill(
        map(sin(hueIndex), -1, 1, 0, 360) / hueFactor,
        map(cos(hueIndex), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex), -1, 1, 255, 0) / hueFactor
      );

      const xOff = map(sin(time), -1, 1, -xOffset, xOffset);
      const yOff = map(cos(time), -1, 1, -yOffset, yOffset);
      let s = map(lerpIndex, 0, 1, 20, height / (shapes.length + 2), 20);

      circle(lerpPosition.x + xOff, lerpPosition.y - yOff, s);
    }

    pop();
  }
}

function draw() {
  background(0);

  shapes.forEach((shape, index) => shape.draw(utils.time.seconds(), index));

  utils.debug.fps();
}
