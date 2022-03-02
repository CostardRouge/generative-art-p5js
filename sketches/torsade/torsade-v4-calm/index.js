utils.sketch.setup(() => {
  const xCount = 1;
  const yCount = 5;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(width / 2, 0),
          end: createVector(-width / 2, 0),
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

    const hueCadence = index + -time;

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 500; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const angle = map(sin(lerpIndex + time/2 + index/2), -1, 1, -TAU, TAU);
      const waveIndex = angle + time;
      const xOffset = map(sin(waveIndex), -1, 1, -size, size);
      const yOffset = map(cos(waveIndex), -1, 1, -size, size);

      fill(
        map(sin(angle + hueCadence), -1, 1, 64, 360),
        map(cos(angle + hueCadence), -1, 1, 0, 255),
        map(sin(angle + hueCadence), -1, 1, 255, 64)
      );

      const s = map(sin(lerpIndex + time + index/2), -1, 1, 10, 100);
      const s2 = map(cos(lerpIndex + time + index/2), -1, 1, 10, 100);
      circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
      circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, s2);
    }

    pop();
  }
}

utils.sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});