let target = null;

function setup() {
  // utils.canvas.create(utils.presets.FILL);
  // utils.canvas.create(utils.presets.SQUARE.RETINA);

    utils.canvas.create(utils.presets.SQUARE.HD);
    utils.events.fullScreenOnDoubleClick();
    utils.events.extendCanvasOnResize();
    utils.events.pauseOnSpaceKeyPressed();
    utils.events.toggleCanvasRecordingOnKey();
    utils.events.toggleFPSCounter();
  noStroke();

  const xCount = 3;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          end: createVector(0, height / 2),
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

  target = createGraphics(width, height, P2D);
  target.pixelDensity(1);
  pixelDensity(1);
}

const getPixelIndex = (x, y, width, offset = 0, density = 1) =>
  4 * (y * density * (width * density) + x * density) + offset;
function applyCorrection(
  target,
  x,
  y,
  [redError, greenError, blueError],
  amount
) {
  const redIndex = getPixelIndex(x, y, target.width, 0);
  const greenIndex = getPixelIndex(x, y, target.width, 1);
  const blueIndex = getPixelIndex(x, y, target.width, 2);

  const oldRed = target.pixels[redIndex];
  const oldGreen = target.pixels[greenIndex];
  const oldBlue = target.pixels[blueIndex];

  target.pixels[redIndex] = oldRed + (redError * amount) / 16;
  target.pixels[greenIndex] = oldGreen + (greenError * amount) / 16;
  target.pixels[blueIndex] = oldBlue + (blueError * amount) / 16;
}

function dithering(source, factor, step = 10) {
  source.loadPixels();

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const redIndex = getPixelIndex(x, y, source.width, 0);
      const greenIndex = getPixelIndex(x, y, source.width, 1);
      const blueIndex = getPixelIndex(x, y, source.width, 2);

      const oldRed = source.pixels[redIndex];
      const oldGreen = source.pixels[greenIndex];
      const oldBlue = source.pixels[blueIndex];
      const d = 255;

      const newRed = Math.round((factor * oldRed) / d) * (d / factor);
      const newGreen = Math.round((factor * oldGreen) / d) * (d / factor);
      const newBlue = Math.round((factor * oldBlue) / d) * (d / factor);

      source.pixels[redIndex] = newRed;
      source.pixels[greenIndex] = newGreen;
      source.pixels[blueIndex] = newBlue;
      // source.pixels[blueIndex + 1] = 128;

      applyCorrection(
        source,
        x + 1,
        y,
        [oldRed - newRed, oldGreen - newGreen, oldBlue - newBlue],
        7
      );
      applyCorrection(
        source,
        x - 1,
        y + 1,
        [oldRed - newRed, oldGreen - newGreen, oldBlue - newBlue],
        3
      );
      applyCorrection(
        source,
        x,
        y + 1,
        [oldRed - newRed, oldGreen - newGreen, oldBlue - newBlue],
        5
      );
      applyCorrection(
        source,
        x + 1,
        y + 1,
        [oldRed - newRed, oldGreen - newGreen, oldBlue - newBlue],
        1
      );
    }
  }

  source.updatePixels();
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

  draw(time, index, target) {
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size / 2.5; //map(sin(time), -1, 1, size / 8, size / 7.5);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 300; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1, -PI, PI);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const cadence = map(sin(-time + lerpIndex + index), -1, 1, -4, 4);
      const waveIndex = angle * cadence;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);

      target.fill(
        map(sin(angle + hueCadence), -1, 1, 0, 360),
        map(cos(angle + hueCadence), -1, 1, 0, 255),
        map(sin(angle + hueCadence), -1, 1, 255, 0)
      );

      target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, 100);
      target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, 100);
    }

    target.pop();
  }
}

function draw() {
  const time = frameCount / 60;

  background(0);

  // target.background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));

  // dithering(target, 1, 1);
  // image(target, 0, 0);
  // filter(GRAY);

  utils.debug.fps();
}
