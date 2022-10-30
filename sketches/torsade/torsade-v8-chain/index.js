import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  //pixelDensity(1);

  const xCount = 1;
  const yCount = 4;
  const size = (width + height) / 2 / (xCount + yCount) / 5.5;

  // for (let x = 1; x <= xCount; x++) {
  //   for (let y = 1; y <= yCount; y++) {
  //     shapes.push(
  //       new Spiral({
  //         size,
  //         start: createVector(0, -height / 2),
  //         end: createVector(0, height / 2),
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
          start: createVector(width / 2 - 100, 0),
          end: createVector(-width / 2 + 100, 0),
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

  //colorMode(HSB);
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

    const hueCadence = index + -time * 2;
    const angleLimit = TAU; //map(sin(time), -1, 1, -TAU, TAU);
    const waveAmplitude = size / 1; //map(sin(time), -1, 1, -size, size * 4);

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 400; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 0.5, -angleLimit, angleLimit);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const waveIndex = -time * 3 * (index % 2 === 0 ? 1 : -1) + angle; //cadence * angle + index;
      const xOffset = map(sin(waveIndex), -1, 1, waveAmplitude, -waveAmplitude);
      const yOffset = map(sin(waveIndex), -1, 1, waveAmplitude, -waveAmplitude);

      fill(
        map(sin(angle + hueCadence), -1, 1, 0, 360),
        map(cos(angle + hueCadence), 1, -1, 0, 255),
        map(sin(angle + hueCadence), -1, 1, 255, 0)
      );

      //fill(150, 0, map(sin(angle), -1, 1, 0, 255));

      const v0 = (angle) => {
        const s = map(sin(angle), -1, 1, 75, 15);

        circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, -s);
        circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
      };

      const v1 = (angle) => {
        const s = map(sin(angle), -1, 1, 75, -75);

        circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, -s);
        circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
      };

      const v2 = (angle) => {
        const s = 75; //map(sin(angle), -1, 1, -50, 50);

        circle(lerpPosition.x + xOffset, lerpPosition.y - yOffset, s);
        circle(lerpPosition.x - xOffset, lerpPosition.y + yOffset, -s);
      };

      const v3 = (angle) => {
        const s = map(sin(angle), -1, 1, -75, 75);

        circle(lerpPosition.x + xOffset, lerpPosition.y - yOffset, s);
        circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, -s);
      };

      const variants = [v0, v1, v2, v3];

      // v1(angle);
      variants[index % 4](angle);
    }

    pop();
  }
}
sketch.draw( time => {
  background(0, 0, 0, 255);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
