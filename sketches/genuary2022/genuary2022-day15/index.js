utils.sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 30;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weightRange: [600, 20],
          opacityFactorRange: [10, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

  // utils.events.register("windowResized", function () {
  //   // radialNoise.target = undefined;
  //   console.log("called", radialNoise.target);
  // });

  // pixelDensity(0.11)
  // noLoop();
})

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
    const { position, size, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time;
    push();
    translate(position.x, position.y);

    const shadowsCount = 30;
    const shadowIndexStep = 0.05;

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        weightRange[0],
        weightRange[1]
      );

      const f = 1//map(shadowIndex, 0, shadowsCount, 1, 0.5);

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          // sin(shadowIndex + time * 5),
          sin(shadowIndex / f + time * 5 + index / 2),

          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] / 5
        ),
        // opacityFactorRange[0],
        opacityFactorRange[1]
      );

      // const l = map(sin(time + shadowIndex), -1, 1, 0.5, 0.2)/5;
      // const indexCoefficient = shadowIndex;
      // const x = map(sin(time * -2 + indexCoefficient), -1, 1, -l, l);
      // const y = map(cos(time * 2 + indexCoefficient), -1, 1, -l, l);

      // translate(x, y);

      // const i = map(sin(time/5 + index), -1, 1, 0, 100);
      const shadowOffset = 0//radians(shadowIndex * 100);
      const vector = utils.converters.polar.vector(
        (index % 2 ? -time : time) * 0 + shadowOffset,
        map(sin(time + shadowIndex), -1, 1, 0, size * 1.5)
      );

      strokeWeight(weight);
      // stroke(utils.colors.rainbow(hueCadence + shadowIndex/16, opacityFactor));
      // stroke(color(64 / opacityFactor));

      stroke(utils.colors.rainbow(2, opacityFactor));
      point(vector.x, vector.y);

      // fill(utils.colors.rainbow(2.1, opacityFactor));
      // circle(0, 0, weight);
      
      // noiseCircle(
      //   vector.x,
      //   vector.y,
      //   utils.colors.rainbow(2.1, opacityFactor),
      //   weight / 2,
      //   1000//map(shadowIndex, 0, shadowsCount, 0, 500)
      // );
    }

    pop();
  }
}

function noiseCircle(x, y, color, size, count) {
  stroke(color);
  strokeWeight(1);
  randomSeed(size);

  for (let i = 0; i < count; i++) {
    const pointX = random(-size, size);
    const pointY = random(-size, size);

    if ((x - pointX) ** 2 + (y - pointY) ** 2 <= size ** 2) {
      point(pointX + x, pointY + y);
    }
  }
}

const getPixelIndex = (x, y, width, offset = 0, density = 1) =>
  4 * (y * density * (width * density) + x * density) + offset;

function radialNoise(step = 10, offset = 3, minStroke = 1, maxStroke = 10, stroke = color(0)) {
  if (!this.target) {
    this.target = createGraphics(width, height);
  } else if (this.target) {
    image(this.target, 0, 0);
    return;
  }

  this.target.stroke(stroke);

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const d = dist(x, y, width / 2, height / 2);

      this.target.strokeWeight(map(d, 0, width, minStroke, maxStroke));

      this.target.point(
        x + random(-offset, offset),
        y + random(-offset, offset)
      );
    }
  }
}

utils.sketch.draw(time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
  radialNoise(2, 1, 0.5, 5, color(0));
})