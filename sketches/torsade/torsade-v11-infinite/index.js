import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
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

  draw(time, index, target) {
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size / 1.5//map(sin(time), -1, 1, 1, 2);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 350; //map(mouseY, height, 0, 1, 200, true);


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
      // angle = lerpIndex*10;
      //  angle = map(lerpIndex, 0, 1.5, sin(lerpIndex) * TAU, cos(lerpIndex) * TAU);
      //  angle = map(lerpIndex, 0, 1/5, cos(TAU*lerpIndex), sin(TAU*lerpIndex));
      //  angle = map(
      //    lerpIndex,
      //    0,
      //    1.5,
      //    sin(lerpIndex) * TAU,
      //    cos(lerpIndex) * TAU
      //  );
      //  angle = map(
      //    lerpIndex,
      //    0,
      //    1 / map(sin(time), -1, 1, -8, 8),
      //    cos(lerpIndex * PI),
      //    sin(lerpIndex * PI)
      //  );
       angle = map(
         lerpIndex,
         0,
         1 / map(sin(time), -1, 1, -8, 8),
         cos(lerpIndex * map(cos(time), -1, 1, -PI, PI)),
         sin(lerpIndex * map(sin(time), -1, 1, -PI, PI))
       );
//       angle = lerpIndex*12;
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-time + lerpIndex + index);
      waveIndex = angle + time * 2;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), 1, -1, -waveAmplitude, waveAmplitude);

      target.fill(
        map(sin(waveIndex + waveIndex), -1, 1, 0, 255) / 1,
        map(cos(angle - hueCadence), -1, 1, 0, 255) / 1,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / 1
      );

      const s = 120;
      target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, s);
      target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
// 
