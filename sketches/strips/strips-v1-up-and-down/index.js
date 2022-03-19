import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup(() => { 
  shapes.push(
    new Strip({
      size: 100,
      start: createVector(0, -height / 3),
      end: createVector(0, height / 3),
      relativePosition: {
        x: 1/2,
        y: 1/2,
      },
    })
  );
} )

class Strip {
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

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 500;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = lerpIndex * 3;

      const f = map(lerpIndex, 0, 1, 1, map(sin(time), -1, 1, 1, 5));
      const opacityFactor = map(
        lerpIndex,
        0,
        1,
        map(sin(lerpIndex * 10 + time*10 + f), -1, 1, 1, 15),
        1
      );

      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-time + lerpIndex + index);
      waveIndex = angle - time * 2;
      const xOffset = map(sin(waveIndex), -1, 1, -size, size);
      const yOffset = map(cos(waveIndex), 1, -1, -size, size)*2;

      target.fill(
        map(sin(angle + lerpIndex), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle - hueCadence), -1, 1, 64, 255) / opacityFactor,
        map(sin(angle + hueCadence), -1, 1, 255, 64) / opacityFactor
      );
      
      const innerShapesCount = 7;

      for (let i = 0; i < innerShapesCount; i++) {
        const x = lerp(
          lerpPosition.x,// - xOffset * map(sin(waveIndex), -1, 1, -1, 1),
          lerpPosition.x + xOffset * 6,
          i / innerShapesCount
        );
        const y = lerp(
          lerpPosition.y - yOffset * 10,
          lerpPosition.y + yOffset,
          i / innerShapesCount
        );

        target.circle(x, y, 100 );
      }
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
