import { shapes, sketch } from './utils/index.js';

sketch.setup(() => {
  noStroke();

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
}, { width: 768, height: 1366 });

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
    const waveAmplitude = size // map(sin(time*2), -1, 1, 1, 3);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 500; //map(mouseY, height, 0, 1, 200, true);

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
        10,
        map(sin(time / 2), -1, 1, -TAU, TAU),
        map(cos(time / 2), -1, 1, -TAU*5, TAU)
      );
      // angle += lerpIndex * 6;
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(time/2 + lerpIndex + index);

      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), 1, -1, -waveAmplitude, waveAmplitude)*0.5;

      let s = sin(waveIndex + time) * 70 * cos(waveIndex + time);
      s = map(sin(time + waveIndex*2+lerpIndex), -1, 1, 20, 50);

      // target.translate(map(sin(waveIndex), -1, 1, -1, 1), 0);

      const a = map(cos(waveIndex), -1, 1, 1, 10);
      const c = map(sin(waveIndex), -1, 1, 1, a);

      for (let i = 0; i < c; i++) {
        const x = lerp(
          lerpPosition.x + xOffset*2,
          lerpPosition.x - xOffset*2,
          i / c
        );
        const y = lerp(
          lerpPosition.y + yOffset,
          lerpPosition.y - yOffset,
          i / c
        );

        target.fill(
          map(sin(angle + hueCadence + i), -1, 1, 0, 360) / 1,
          map(cos(angle - hueCadence - i), -1, 1, 128, 255) / 1,
          map(sin(angle + hueCadence + i), -1, 1, 255, 0) / 1
        );

        target.circle(x, y, s);
      }

      // target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, s);
      // target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
// 
