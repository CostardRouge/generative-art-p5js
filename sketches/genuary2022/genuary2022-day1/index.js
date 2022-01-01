function setup() {
  utils.canvas.create(utils.presets.FILL);
  utils.canvas.create(utils.presets.SQUARE.HD);
  // utils.canvas.create({ height: 960, width: 960 });

  utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.toggleCanvasRecordingOnKey();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleFPSCounter();

  noStroke();
  //pixelDensity(0.1);

  const xCount = 1;
  const yCount = 100;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          end: createVector(0, height / 2),
          start: createVector(width / 2, 0),
          end: createVector(-width / 2, 0),
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
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size * 8;

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 100//map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 0.5, -PI, PI);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const t = map(sin(time + lerpIndex + index / 10), -1, 1, -4, 4);
      const waveIndex = angle + t;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(
        cos(waveIndex),
        -1,
        1,
        -waveAmplitude,
        waveAmplitude
      );

      fill(
        map(sin(angle + hueCadence), 1, -1, 360, 0),
        map(cos(angle + hueCadence), 1, -1, 255, 0),
        map(sin(angle + hueCadence), 1, -1, 0, 255)
      );

      circle(lerpPosition.x - xOffset, lerpPosition.y + yOffset, 5);
    }

    pop();
  }
}

function draw() {
  background(0);

  shapes.forEach((shape, index) => shape.draw(utils.time.seconds(), index));
  utils.debug.fps();
}
