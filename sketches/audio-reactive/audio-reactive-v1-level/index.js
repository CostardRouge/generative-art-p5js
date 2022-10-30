import { audio, shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  audio.capture.setup();

  const xCount = 3;
  const yCount = 7;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Dot({
          shadowsCount: 5,
          weightRange: [150, 15],
          opacityFactorRange: [5, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
});

class Dot {
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

  draw(time, index, micLevel) {
    const { position, shadowsCount, weightRange, opacityFactorRange } = this;

    const hueIndex = map(
      index,
      0,
      shapes.length - 1,
      -PI,
      PI
    )
    const hueSpeed = hueIndex// + time;

    for (let shadowIndex = 0; shadowIndex < shadowsCount; shadowIndex++) {
      const opacity = map(
        shadowIndex,
        0,
        shadowsCount - 1,
        128,
        255
      )

      const weight = map(
        shadowIndex,
        0,
        shadowsCount -1,
        weightRange[0],
        weightRange[1]
      ) * micLevel;

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount - 1,
        opacityFactorRange[0],
        opacityFactorRange[1]
      );

      this.color = color(
        map(sin(hueSpeed), -1, 1, 0, 360) / opacityFactor,
        map(cos(-hueSpeed), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed), -1, 1, 360, 0) / opacityFactor,
        opacity
      );
      fill(this.color);
      circle(position.x, position.y, weight);
    }
  }
}

sketch.draw( time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(
    time,
    index,
    audio.capture.audioIn.getLevel()*5
  ));
});
