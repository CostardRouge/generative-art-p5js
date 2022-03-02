let target = null;
let capture = null;

utils.sketch.setup(() => {
  utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleCanvasRecordingOnKey();
  utils.events.toggleFPSCounter();

  // noStroke();
  stroke(0, 0, 0);

  const xCount = 1;
  const yCount = 1;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size: (width + height) / 2 / (xCount + yCount) / 3.5,
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

  // pixelDensity(1);
  // frameRate(5);

  // capture = createCapture(VIDEO);
  // capture.size(size, size);
  // capture.hide();

  target = createGraphics(width, height, P2D);
  target.pixelDensity(1);
} );

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
    const { position, size } = this;

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 60;
    // const speed = 0//map(cos(time*2), -1, 1, -PI, PI);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 0.1, -PI, PI);
      // const t = map(
      //   sin(time - lerpIndex / 3 + index / 8),
      //   -1,
      //   1,
      //   -speed,
      //   speed
      // );
      const waveIndex = angle// + t;
      const xOffset = map(sin(waveIndex), -1, 1, -size * 2, size * 2);
      const yOffset = map(cos(waveIndex), -1, 1, -size * 2, size * 2);

      const hueIndex = lerpIndex*5 + angle;
      const hueIndex2 = lerpIndex*5 + angle;
      const hueFactor = map(lerpIndex, 1, 0, 1, 3);

      target.fill(
        map(sin(hueIndex), -1, 1, 0, 255) / hueFactor,
        map(cos(hueIndex), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex), -1, 1, 255, 0) / hueFactor
      );
      target.stroke(
        map(sin(hueIndex2), -1, 1, 0, 360) / hueFactor,
        map(cos(hueIndex2), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex2), -1, 1, 255, 0) / hueFactor
      );
      target.strokeWeight(2);

      const xOff = map(sin(time), -1, 1, -xOffset, xOffset);
      const yOff = map(cos(time), -1, 1, -yOffset, yOffset);
      let s = map(lerpIndex, 0, 1, height / (shapes.length + 2), 5);

      // target.noStroke();
      target.circle(xOff, yOff, s);
    }

    target.pop();
  }
}

const getPixelIndex = (x, y, width, offset = 0, density = 1) =>
  4 * (y * density * (width * density) + x * density) + offset;
;

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

utils.sketch.draw( time => {
  target.background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, target));

  dithering(target, 1, 1);
  image(target, 0, 0);
  filter(GRAY);
});
