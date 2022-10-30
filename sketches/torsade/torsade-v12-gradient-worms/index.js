import { shapes, sketch, converters, events, colors, mappers, time as gt } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 10;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  // for (let x = 1; x <= xCount; x++) {
  //   for (let y = 1; y <= yCount; y++) {
  //     shapes.push(
  //       new Spiral({
  //         size,
  //         start: createVector(0, -height / 2),
  //         end: createVector(0, height / 2),
  //         // start: createVector(width / 2, 0),
  //         // end: createVector(-width / 2, 0),
  //         relativePosition: {
  //           x: x / (xCount + 1),
  //           y: y / (yCount + 1),
  //         },
  //       })
  //     );
  //   }
  // }

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(-width / 3, 0),
          end: createVector(width / 3, 0),
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

  draw(time, index) {
    let { position, size, start, end } = this;

    const tt = gt.seconds();
    const hueCadence = index + tt;
    const mult = map(sin(time), -1, 1, 8, 4);

    const waveAmplitude = mult * map(sin(time), -1, 1, size / 2, size);
    const angleLimit =
      map(sin(time), -1, 1, -PI, -PI)// / map(sin(time), -1, 1, 1, 5);

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 500; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1, -angleLimit, angleLimit);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      // const cadence = map(sin(time + lerpIndex), -1, 1, 0, 4);
      const t = map(sin(time + lerpIndex + index / 5), -1, 1, -4, 4);
      const waveIndex = angle + t;
      const xOffset =
        map(sin(waveIndex * lerpIndex), -1, 1, -waveAmplitude, waveAmplitude) +
        0;
      const yOffset = map(
        cos(waveIndex - lerpIndex),
        -1,
        1,
        -waveAmplitude,
        waveAmplitude
      );

       const f = map(lerpIndex, 0, 1, 1, 10);
       const opacityFactor = map(
         lerpIndex,
         0,
         1,
         map(sin(lerpIndex * f + tt*3), -1, 1, 1, 200),
         1
       );

      fill(
        map(sin(angle + hueCadence), 1, -1, 360, 0) / opacityFactor,
        map(cos(angle - hueCadence), 1, -1, 255, 0) / opacityFactor,
        map(sin(angle + hueCadence), 1, -1, 0, 255) / opacityFactor
      );

      const d = map(sin(time + waveIndex * 2), -1, 1, 30, 100);

      circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, d);
    }

    pop();
  }
}

sketch.draw( time => {
  background(0);
  const timeSpeed = map(sin(time), -1, 1, 0, 2);

  shapes.forEach((shape, index) => shape.draw(time + timeSpeed, index));
});
