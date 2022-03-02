let pixilatedCanvas = null;

utils.sketch.setup(() => {
  noStroke();

  pixilatedCanvas = createGraphics(
    utils.canvas.main.width,
    utils.canvas.main.height
  );
  pixilatedCanvas.pixelDensity(0.05);

  utils.events.register("windowResized", () => {
    pixilatedCanvas.width = utils.canvas.main.width;
    pixilatedCanvas.height = utils.canvas.main.height;
    pixilatedCanvas.pixelDensity(0.05);
  });

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 3),
          end: createVector(0, height / 3),
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
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

  draw(time, index, target, lerpStep = 1 / 800) {
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size / map(sin(time * 2), -1, 1, 1, 2);

    target.push();
    target.translate(position.x, position.y);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      let angle = map(
        lerpIndex,
        0,
        1.5,
        map(sin(time / 2), -1, 1, -TAU, TAU),
        -map(cos(time / 2), -1, 1, -TAU, TAU)
      );
      // angle = lerpIndex * 10;
      // angle = map(
      //   lerpIndex,
      //   0,
      //   1.5,
      //   sin(lerpIndex) * TAU,
      //   cos(lerpIndex) * TAU
      // );
      //  angle = map(
      //    lerpIndex,
      //    0,
      //    1 / 2,
      //    cos(TAU * lerpIndex),
      //    sin(TAU * lerpIndex)
      //  );
      angle += map(
        lerpIndex + sin(time + angle) + cos(-time * 5 + 0),
        -1,
        1,
        cos(TAU * lerpIndex),
        sin(TAU * lerpIndex)
      );
      //  angle = map(
      //    lerpIndex + sin(time),
      //    0,
      //    1/2,
      //    cos(TAU * lerpIndex),
      //    sin(TAU * lerpIndex)
      //  );
      //  angle += map(
      //    lerpIndex,
      //    0,
      //    1.5,
      //    sin(lerpIndex) * TAU,
      //    cos(lerpIndex) * TAU
      //  );
      //  angle = map(
      //    lerpIndex,
      //    0,
      //    1 / map(sin(time + index), -1, 1, -8, 8),
      //    cos(lerpIndex * PI),
      //    sin(lerpIndex * PI)
      //  );
      //  angle += map(
      //    lerpIndex,
      //    0,
      //    1 / map(sin(time) + cos(time), -1, 1, -4, 4),
      //    cos(lerpIndex * map(cos(time), -1, 1, -PI, PI)),
      //    sin(lerpIndex * map(sin(time), -1, 1, -PI, PI))
      //  );
      // angle += lerpIndex * 12;
      // angle += lerpIndex * map(sin(time), -1, 1, -PI, PI);
      angle = lerpIndex * 12;

      const f = map(lerpIndex, 0, 1, 1, 40);
      const opacityFactor = map(
        lerpIndex,
        0,
        1,
        map(sin(lerpIndex * 10 + time + f), -1, 1, 1, 10),
        1
      );

      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-time + lerpIndex + index);
      waveIndex = angle - time * 2;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), 1, -1, -waveAmplitude, waveAmplitude);

      target.fill(
        map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle - hueCadence), -1, 1, 0, 255) / opacityFactor,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
      );

      let s = map(
        sin(time * 5 + waveIndex + f + map(lerpIndex, 0, 1, 0, 10) / lerpIndex),
        -1,
        1,
        10,
        70
      );
      //sin(waveIndex + time) * 300 * cos(waveIndex + time);

      //target.translate(map(sin(waveIndex), -1, 1, -1, 1), 0);

      let c = 5; //map(sin(time*2+waveIndex), -1, 1, 0, 5)+1;
      // c = map(lerpIndex, 0, 1, 5, 0);

      for (let i = 0; i < c; i++) {
        const x = lerp(
          lerpPosition.x + xOffset * map(sin(waveIndex), -1, 1, -1, 1),
          lerpPosition.x - xOffset * 2,
          i / c
        );
        const y = lerp(
          lerpPosition.y + yOffset,
          lerpPosition.y + yOffset,
          i / c
        );

        target.circle(x, y, s);
      }

      // target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, s);
      // target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
    }

    target.pop();
  }
}

utils.sketch.draw((time) => {
  //noSmooth()

  background(0);

  pixilatedCanvas.filter(BLUR, 2);
  pixilatedCanvas.background(0, 0, 0, 8);
  image(pixilatedCanvas, 0, 0);

  shapes.forEach((shape, index) => {
    shape.draw(-time, index, pixilatedCanvas, 1 / 20);
    shape.draw(-time, index, window);
  });
});
//
