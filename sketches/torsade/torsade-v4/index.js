function setup() {
  utils.canvas.create(utils.presets.FILL);
  // utils.canvas.create({ height: 960, width: 960 });

  utils.events.fullScreenOnDoubleClick();
  //utils.events.extendCanvasOnResize();
  utils.events.toggleNoLoopOnSingleClick();
  noStroke();
  pixelDensity(0.8);

  const xCount = 1;
  const yCount = 5;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
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

    const hueCadence = index + -time;
    const coefficient = map(sin(time), -1, 1, 3, 8);
    const waveAmplitude = size //coefficient * map(sin(time), -1, 1, size / 8, size);
    const angleLimit = map(sin(time), -1, 1, 0, 1);

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 190; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const angle = map(lerpIndex, 0, 1, -PI, PI);
      const waveIndex = angle + time;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);

      fill(
        map(sin(angle + hueCadence), -1, 1, 0, 360),
        map(cos(angle + hueCadence), -1, 1, 0, 255),
        map(sin(angle + hueCadence), -1, 1, 255, 0)
      );

      // circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, 100);
      circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, 100);
    }

    pop();
  }
}

function draw() {
  const seconds = frameCount / 60;
  const time = seconds;

  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));

  //utils.debug.fps();
}
