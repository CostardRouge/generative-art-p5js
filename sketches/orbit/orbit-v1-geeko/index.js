import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  stroke(0, 0, 255);

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
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
    const { position, size } = this;

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 60;
    const speed = -1;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1 / 10, -PI, PI);
      const t = map(
        sin(time - lerpIndex / 3 + index / 8),
        -1,
        1,
        -speed,
        speed
      );
      const waveIndex = angle + t;
      const xOffset = map(sin(waveIndex), -1, 1, -size * 2, size * 2);
      const yOffset = map(cos(waveIndex), -1, 1, -size * 2, size * 2);

      const hueIndex = lerpIndex + angle - time;
      const hueFactor = map(lerpIndex, 0, 3, 1, 3);
      const col = color(
        map(sin(hueIndex), -1, 1, 0, 360) / hueFactor,
        map(cos(hueIndex), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex), -1, 1, 255, 0) / hueFactor
      );

      fill(col);
      stroke(
        map(sin(hueIndex-150), -1, 1, 0, 360) / hueFactor,
        map(cos(hueIndex-150), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex-150), -1, 1, 255, 0) / hueFactor
      );
      strokeWeight(2 );

      const xOff = map(sin(time), -1, 1, -xOffset, xOffset);
      const yOff = map(cos(time), -1, 1, -yOffset, yOffset);
      let s = map(lerpIndex, 0, 1, height / (shapes.length+2), 5);

      circle(xOff, yOff, s);

      this.xOff = xOff;
      this.yOff = yOff;
    }

    pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
