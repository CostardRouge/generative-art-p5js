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
}, { width: 768, height: 1366 });

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

    const lerpStep = 1 / 600;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      let a = map(lerpIndex, 0, 1, -PI, PI)
      let lerpPosition = converters.polar.vector(a, size)

      const xOffset = map(sin(a+time), -1, 1, -size, size)*2;
      const yOffset = map(cos(time+a), 1, -1, -height, height)/3;

      // const xOffset = map(sin(time), -1, 1, -width/3, width/3);
      // const yOffset = map(cos(time), -1, 1, -height/3, height/3)
      
      const innerShapesCount = 7//map(cos(a+time*2), -1, 1, 1, 7)

      const opacityFactor = map(
        cos(lerpIndex*25+time*5),
        -1,
        1,
        10,
        1
      );

      for (let i = 0; i < innerShapesCount; i++) {
        const x = lerp(
          lerpPosition.x + xOffset * sin(a*2+time),
          lerpPosition.x - xOffset * cos(a*2+time),
          i / innerShapesCount
        );
        const y = lerp(
          lerpPosition.y + yOffset * cos(time),
          lerpPosition.y - yOffset * sin(time),
          i / innerShapesCount
        );

        target.fill(
          map(sin(0 + hueCadence + i), -1, 1, 0, 360) / opacityFactor,
          map(cos(0 + hueCadence + i), -1, 1, 255, 0) / opacityFactor,
          map(sin(0 + hueCadence + i), -1, 1, 255, 0) / opacityFactor,
        );

        target.circle(x, y, 50 );
      }
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
