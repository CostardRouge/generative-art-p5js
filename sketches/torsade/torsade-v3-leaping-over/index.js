function setup() {
  // utils.canvas.create(utils.presets.FILL);
  utils.canvas.create({ height: 960, width: 960 });

  utils.events.fullScreenOnDoubleClick();
  //utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleFPSCounter();

  noStroke();
  // pixelDensity(0.1);

  const xCount = 5;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          end: createVector(0, height / 2),
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
    this.calculateRealtivePosition();
  }

  calculateRealtivePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRealtivePosition();
  }

  draw(time, index) {
    let { position, size, start, end } = this;

    const hueCadence = index;
    const mult = map(sin(time), -1, 1, 3, 8);

    const waveAmplitude = mult * map(sin(time), -1, 1, size / 8, size);
    const angleLimit = map(sin(time), -1, 1, -PI, -PI);

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 190; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 5, -angleLimit, angleLimit);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      // const cadence = map(sin(time + lerpIndex), -1, 1, 0, 4);
      const t = map(sin(time + lerpIndex + index / 10), -1, 1, -4, 4);
      const waveIndex = angle + t;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);

      fill(
        map(sin(angle + hueCadence + t), -1, 1, 0, 360),
        map(cos(angle + hueCadence + t), -1, 1, 0, 255),
        map(sin(angle + hueCadence + t), -1, 1, 255, 0)
      );

      //circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, 100);
      circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, 100);
    }

    pop();
  }
}

function draw() {
  background(0);

  shapes.forEach((shape, index) => shape.draw(utils.time.seconds(), index));

  utils.debug.fps();
}
