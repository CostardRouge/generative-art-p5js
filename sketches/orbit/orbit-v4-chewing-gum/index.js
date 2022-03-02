utils.sketch.setup(() => {
  const xCount = 3;
  const yCount = 5;
  const size = (width + height) / (xCount + yCount) / 12;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size: size,
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
    const { position, size: s } = this;
    const size = map(sin(time*5+index), -1, 1, s/10, s)

    const hideRate = map(sin(time), -1, 1, -1, 1);

    if (
      utils.mappers.circularIndex(
        index / (shapes.length / 2) + (time + sin(time)),
        [true, true, false, false, false]
      )
    ) {
      return;
    }

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 300;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1/50, -PI, PI);
      const t = map(sin(time - lerpIndex / 1 + index / 2), -1, 1, -8, 8);
      const waveIndex = angle + t/2;
      const xOffset = map(sin(waveIndex), -1, 1, -size * 2, size * 2);
      const yOffset = map(cos(waveIndex), -1, 1, -size * 2, size * 2);

      const hueIndex = lerpIndex + angle - time;
      const hueFactor = 1//map(lerpIndex, 0, 1, 1, 2);

      fill(
        map(sin(hueIndex + index), -1, 1, 0, 360) / hueFactor,
        map(cos(hueIndex), -1, 1, 0, 255) / hueFactor,
        map(sin(hueIndex), -1, 1, 255, 0) / hueFactor
      );

      const xOff = map(sin(time), -1, 1, -xOffset, xOffset);
      const yOff = map(cos(time), -1, 1, -yOffset, yOffset);
      let s = map(lerpIndex, 0, 1, height / (shapes.length + 2), 1, true);

      circle(xOff, yOff, s);
    }

    pop();
  }
}


utils.sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
