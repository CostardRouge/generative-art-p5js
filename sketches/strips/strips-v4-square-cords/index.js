import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => { 
  shapes.push(
    new Strip({
      size: 50,
      start: createVector(0, -height / 3),
      end: createVector(0, height / 3),
      relativePosition: {
        x: 1/2,
        y: 1/2,
      },
    })
  );
});

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

    const lerpStep = 1 / 1000;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      //const angle = lerpIndex * 6;
      //const f = map(lerpIndex, 0, 1, 1, map(sin(time), -1, 1, 1, 15));
      
      let lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      let a = map(lerpIndex, 0, 1, -PI, PI)//map(sin(time*2), -1, 1, 0.5, 5);
      //  lerpPosition = converters.polar.vector(a, 100)

      const xOffset = map(sin(a), -1, 1, -width/2.5, width/2.5);
      const yOffset = map(cos(a), -1, 1, -height/4, height/4)
      
      const innerShapesCount = 10//map(sin(a + time*3), -1, 1, -7, 7)+1;

      let opacityFactor = map(
        cos(lerpIndex*25-time*5),
        -1,
        1,
        // map(sin(a/2), -1, 1, 1, 500),
        map(sin(lerpIndex*3+time), -1, 1, 1, 50),
        // 10,
        1
      );

      const s = 1.5

      opacityFactor = map(
        map(sin(lerpIndex*2-time*s), -1, 1, -1, 1),
        -1,
        1,
        // map(sin(a/2), -1, 1, 1, 500),
        map(cos(lerpIndex*2+time*s), -1, 1, 1, 250),
        // 10,
        1
      );

      for (let i = 0; i < innerShapesCount; i++) {
        const x = lerp(
          lerpPosition.x + xOffset+50 * sin(a+time),
          lerpPosition.x - xOffset-50 * cos(a-time*2),
          i / innerShapesCount
        );
        const y = lerp(
          lerpPosition.y + yOffset * cos(time*s-a),
          lerpPosition.y + yOffset * sin(time*s+a),
          i / innerShapesCount
        );

        target.fill(
          map(sin(hueCadence + i), -1, 1, 0, 360) / opacityFactor,
          map(cos(hueCadence + i), -1, 1, 255, 0) / opacityFactor,
          map(sin(hueCadence + i), -1, 1, 255, 0) / opacityFactor,
          // map(opacityFactor, 1, 500, 255, 0)
        );

        target.rect(x, y, 30);
      }
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
