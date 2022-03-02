let pixilatedCanvas;

utils.sketch.setup(() => {
  pixilatedCanvas = createGraphics(
    utils.canvas.main.width,
    utils.canvas.main.height
  );
  pixilatedCanvas.pixelDensity(0.05);

  // pixelDensity(1);
  noStroke();

  utils.events.register("windowResized", () => {
    pixilatedCanvas.width = utils.canvas.main.width;
    pixilatedCanvas.height = utils.canvas.main.height;
    pixilatedCanvas.pixelDensity(0.1);
  });

  for (let i = 0; i < 3; i++) {
    shapes.push(
      new GlowingFish({
        vectors: {
          start: createVector(width / 2, height / 2),
          end: createVector(width / 2, height / 2),
        },
      })
    );
  }
}, { height: 80, width: 800, /*ratio: 800/80*/ } );

class GlowingFish {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativeVectors();
  }

  calculateRelativeVectors() {
    this.relativeVectors = {};

    for (const key in this.vectors) {
      this.relativeVectors[key] = createVector(
        this.vectors[key].x / width,
        this.vectors[key].y / height
      );
    }
  }

  adjustVectors() {
    for (const key in this.vectors) {
      this.vectors[key].x = lerp(0, width, this.relativeVectors[key].x);
      this.vectors[key].y = lerp(0, height, this.relativeVectors[key].y);
    }
  }

  onWindowResized() {
    this.adjustVectors();
  }

  move(time, index, circleSize) {
    const {
      vectors: { start, end },
    } = this;

    const x =
      utils.converters.polar.get(sin, circleSize, time / 2 + index, 1) +
      width / 2;
    const y =
      utils.converters.polar.get(cos, circleSize, time + index) +
      height / 2;

    const target = createVector(
      constrain(x, 50, width - 50),
      constrain(y, 30, 50)
    );

    this.vectors.start = p5.Vector.lerp(start, target, 0.07);
    this.vectors.end = p5.Vector.lerp(end, target, 0.02);
  }

  draw(time, index) {
    this.drawShape(time, index, pixilatedCanvas, 1);
    this.drawShape(time, index, window, 1 / 64);
  }

  drawShape(time, index, givenCanvas, lerpStep) {
    const {
      vectors: { start, end },
    } = this;

    const lerpMin = 0;
    const lerpMax = 1 + lerpStep;
    const hueCadence = index + time;
    const amplitudeCadence = time + index;
    const amplitude = 20//map(sin(time * index), -1, 1, 20, 20);
    const xAmplitude = map(sin(amplitudeCadence), -1, 1, -amplitude, amplitude);
    const yAmplitude = map(cos(amplitudeCadence), -1, 1, -amplitude, amplitude);
    const weight = map(index, 0, shapes.length - 1, 30, 15);
    const circleSize = map(sin(amplitudeCadence), -1, 1, 0, width);

    this.move(time, index, circleSize);

    push();

    givenCanvas.beginShape(LINES);

    for (let lerpIndex = lerpMin; lerpIndex < lerpMax; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const angle = map(lerpIndex, lerpMin, lerpMax, -PI/2, PI/2);
      const hueIndex = angle + -hueCadence;

      givenCanvas.strokeWeight(weight);
      this.colorShape(givenCanvas, hueIndex, angle);

      const offsetCadence = angle + time + index;
      const xOffset = map(sin(offsetCadence), -1, 1, -xAmplitude, xAmplitude);
      const yOffset = map(cos(offsetCadence), -1, 1, -yAmplitude, yAmplitude);

      givenCanvas.vertex(lerpPosition.x + yOffset, lerpPosition.y - yOffset);
      givenCanvas.vertex(lerpPosition.x - xOffset, lerpPosition.y + yOffset);
    }
    givenCanvas.endShape();

    pop();
  }

  colorShape(givenCanvas, hueIndex, index, angle) {
    givenCanvas.stroke(
      map(sin(hueIndex), -1, 1, 0, 360),
      map(cos(hueIndex), -1, 1, 0, 255),
      map(sin(hueIndex), -1, 1, 360, 0)
    );
  }
}

utils.sketch.draw( time => {
  noSmooth()
  background(0);
  pixilatedCanvas.filter(BLUR, 1);
  pixilatedCanvas.background(0, 0, 0, 8);
  image(pixilatedCanvas, 0, 0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
