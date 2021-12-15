function setup() {
  // utils.canvas.create(utils.presets.SQUARE.HD);
  utils.canvas.create(utils.presets.IPHONE_12.PORTRAIT);
  // utils.canvas.create(utils.presets.FILL);
  //utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.fullScreenOnDoubleClick();
  utils.events.toggleCanvasRecordingOnKey();

  const xCount = 5;
  const yCount = 12;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          shadowsCount: 1,
          weightRange: [20, 75],
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
    const waveAmplitude = size //map(sin(-time), -1, 1, size, 10 * index);

    let ccc = map(sin(-time), -1, 1, 10, 1);

    push();
    const x = utils.converters.polar.get(sin, 50, index + time + ccc);
    const y = utils.converters.polar.get(cos, 50, index + time - ccc);
    translate(position.x + x, position.y +  y );


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
      const angleStep = TAU;
      const shadowOffset = radians(shadowIndex * 7);

      translate(
        0, sin(shadowOffset + time / 2) * cos(shadowOffset + time / 2)
      );


      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        translate(
          utils.converters.polar.vector(angle + time * 3 + shadowOffset, size)
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
            map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + hueCadence), -1, 1, 0, 255) / opacityFactor,
            map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
          )
        );
        vertex(vector.x, vector.y);
        vertex(nextVector.x, nextVector.y);

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

function draw() {
  background(0, 16);
  shapes.forEach((shape, index) => shape.draw(utils.time.seconds(), index));
  utils.debug.fps();
}
