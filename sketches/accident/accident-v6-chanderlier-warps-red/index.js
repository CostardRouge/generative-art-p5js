let target = null;
let pixilatedCanvas = null;

function setup() {
    // utils.canvas.create(utils.presets.FILL);
    // utils.canvas.create(utils.presets.SQUARE.RETINA);
    // utils.canvas.create(utils.presets.SQUARE.HD);
    utils.canvas.create({ width: 768, height: 1368 });
    // utils.canvas.create({ width: 768/2, height: 1368/2 });
    
    utils.events.fullScreenOnDoubleClick();
    utils.events.extendCanvasOnResize();
    utils.events.pauseOnSpaceKeyPressed();
    utils.events.toggleCanvasRecordingOnKey();
    utils.events.toggleFPSCounter();
    
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

  //  for (let x = 1; x <= xCount; x++) {
  //    for (let y = 1; y <= yCount; y++) {
  //      shapes.push(
  //        new Spiral({
  //          size,
  //          start: createVector(-width / 3, 0),
  //          end: createVector(width / 3, 0),
  //          relativePosition: {
  //            x: x / (xCount + 1),
  //            y: y / (yCount + 1),
  //          },
  //        })
  //      );
  //    }
  //  }
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

  draw(time, index, target, lerpStep = 1 / 800) {
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size / 1.5//map(sin(time), -1, 1, 1, 2);

    target.push();
    target.translate(position.x, position.y);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      //       const f = 15//map(lerpIndex, 0, 1, 1, 30)
      //       const opacityFactor = map(
      //         lerpIndex,
      //         0,
      //         1,
      //         map(
      //           sin(lerpIndex*f + time * 3),
      //           -1,
      //           1,
      //           1,
      //           2
      //         ),
      //         1
      //       );

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
      //  angle = map(lerpIndex, 0, 1/5, cos(TAU*lerpIndex), sin(TAU*lerpIndex));
      // angle = map(
      //   lerpIndex,
      //   0,
      //   1.5,
      //   sin(lerpIndex) * TAU,
      //   cos(lerpIndex) * TAU
      // );
      // angle += map(
      //   lerpIndex,
      //   0,
      //   1 / map(sin(time + index), -1, 1, -8, 8),
      //   cos(lerpIndex * PI),
      //   sin(lerpIndex * PI)
      // );
      //  angle += map(
      //    lerpIndex,
      //    0,
      //    1 / map(sin(time), -1, 1, -8, 8),
      //    cos(lerpIndex * map(cos(time), -1, 1, -PI, PI)),
      //    sin(lerpIndex * map(sin(time), -1, 1, -PI, PI))
      //  );
      angle = lerpIndex * 15 * (index + 1);
      angle *= (index % 2 === 0 ? 1 : -1);
      
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-time + lerpIndex + index);
      waveIndex = angle + time * 2;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), 1, -1, -waveAmplitude, waveAmplitude);

      target.fill(
        map(sin(angle + lerpIndex), -1, 1, 0, 360) / 1,
        map(cos(angle - hueCadence), -1, 1, 0, 255) / -1,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / -1
      );

      let s = 50;
      // s = map(sin(time + waveIndex * 2), -1, 1, 20, 50);

      // target.translate(map(sin(waveIndex + index), -1, 1, -1, 1), 0);

      const c = 10 + index; // map(sin(time+waveIndex), -1, 1, 2, 5);

      for (let i = 0; i < c; i++) {
        const x = lerp(
          lerpPosition.x + xOffset*2,
          lerpPosition.x - xOffset*2,
          i / c
        );
        const y = lerp(
          lerpPosition.y + yOffset*2,
          lerpPosition.y - yOffset*2,
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
  // noSmooth()

  background(0);

  pixilatedCanvas.filter(BLUR, 2);
  pixilatedCanvas.background(0, 0, 0, 92);
  image(pixilatedCanvas, 0, 0);

  shapes.forEach((shape, index) => {
    shape.draw(-time, index, pixilatedCanvas, 1 / 300);
    shape.draw(-time, index, window, 1 / 800);
  });
});
