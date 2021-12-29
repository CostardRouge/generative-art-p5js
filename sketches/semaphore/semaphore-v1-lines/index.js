function setup() {
  utils.canvas.create(utils.presets.SQUARE.HD);
  // utils.canvas.create(utils.presets.IPHONE_12.PORTRAIT);
  // utils.canvas.create(utils.presets.FILL);
  //utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.fullScreenOnDoubleClick();
  utils.events.toggleCanvasRecordingOnKey();

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          shadowsCount: 10,
          weightRange: [1000, 75],
          opacityFactorRange: [7, 1],
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
    const { position, shadowsCount, size, weightRange, opacityFactorRange } =
      this;
    const hueCadence = index + time;
    const waveAmplitude = size; //map(sin(time), -1, 1, size, 0);

    push();
    translate(position.x, position.y + 100);

    for (let shadowIndex = 0; shadowIndex <= shadowsCount; shadowIndex++) {
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
      const d = map(sin(time / 4), -1, 1, 1, 9);
      const angleStep = TAU / d; // map(shadowIndex, 0, shadowsCount, 64, 300);
      const shadowOffset = radians(shadowIndex * 7);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        translate(
          utils.converters.polar.vector(angle + time + shadowOffset, size)
        );

        // const vector = this.getVector(angle, time, waveAmplitude);
        // const nextVector = this.getVector(angle + time, 0, waveAmplitude);

        const vector = this.getVector(angle, 0, waveAmplitude);
        const nextVector = this.getVector(angle + angleStep, 0, waveAmplitude);

        beginShape();
        // const wMin = weight * 2;
        // const wMax = weight * 2;
        // strokeWeight(map(sin(time + shadowIndex), -1, 1, wMin, wMax));
        strokeWeight(weight);

        stroke(
          color(
            map(sin(angle + 0 + shadowOffset), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + 0 + shadowOffset), -1, 1, 0, 255) / opacityFactor,
            map(sin(angle + 0 + shadowOffset), -1, 1, 255, 0) / opacityFactor
          )
        );

        vertex(vector.x * sin(time), vector.y * cos(time));
        vertex(nextVector.x * cos(time), nextVector.y * cos(time));
        // vertex(nextVector.x, nextVector.y);

        // vertex(
        //   map(cos(time), -1, 1, -vector.x, vector.x),
        //   map(sin(time), -1, 1, -vector.x, vector.y)
        // );

        // vertex(
        //   map(sin(time), -1, 1, -nextVector.x, nextVector.x),
        //   map(cos(time), -1, 1, -nextVector.y, nextVector.y)
        // );

        // fill(0);

        endShape();
        pop();
      }
    }

    pop();
  }

  cachedColors = {};

  getCachedColor(cacheItemKey, computeCacheValue) {
    if (undefined !== this.cachedColors[cacheItemKey]) {
      return this.cachedColors[cacheItemKey];
    }

    return (this.cachedColors[cacheItemKey] = computeCacheValue());
  }

  getVector(angle, time, waveAmplitude) {
    const xAngle = map(sin(angle - time / 2), -1, 1, -PI, PI);
    const yAngle = map(cos(angle + time / 2), -1, 1, -PI, PI);

    return createVector(
      utils.converters.polar.get(sin, waveAmplitude, xAngle),
      utils.converters.polar.get(cos, waveAmplitude, yAngle)
    );
  }
}
utils.sketch.draw((time) => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});