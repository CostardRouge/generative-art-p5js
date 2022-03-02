utils.sketch.setup(() => {
  noStroke();

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3;

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
    const { position, size: _size } = this;

    push();
    translate(position.x, position.y);

    const lerpStep = 1 / 300;

    // const dark = 3;
    // const light = 1;
    const size = _size*2

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1/75, -PI, PI);
      const t = map(sin(time - lerpIndex / 3 + index / 2), -1, 1, -4, 4);
      const waveIndex = angle + t/2;

      // const opacityFactor = map(
      //   lerpIndex,
      //   0,
      //   1,
      //   map(
      //     sin(lerpIndex + time * 5 + index / 2),
      //     -1,
      //     1,
      //     dark,
      //     dark/2
      //   ),
      //   light
      // );

      const eclipse = map(sin(time*2 + index), -1, 1, 15, 50)

      fill(
        utils.colors.rainbow(
          lerpIndex + angle - time + index / 2,
          map(lerpIndex, 0, 1, 1, eclipse),
          // opacityFactor
        )
      )

      const xOffset = map(sin(waveIndex), -1, 1, -size, size);
      const yOffset = map(cos(waveIndex), -1, 1, -size, size);
      const xOff = map(sin(time), -1, 1, -xOffset, xOffset);
      const yOff = map(cos(time), -1, 1, -yOffset, yOffset);

      circle(xOff, yOff, map(lerpIndex, 0, 1, size / (shapes.length + 1), 1, true)*1.5);
    }

    pop();
  }
}

utils.sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});