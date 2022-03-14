utils.sketch.setup(() => { 
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
}, { width: 768, height: 1366 });
// }, utils.presets.IPHONE_12.PORTRAIT);
// }, utils.presets.PORTRAIT.HD);

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
      //const angle = lerpIndex * 6;
      //const f = map(lerpIndex, 0, 1, 1, map(sin(time), -1, 1, 1, 15));
      
      let lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      let a = map(lerpIndex, 0, 1, -PI, PI)/2//map(sin(time*2), -1, 1, 0.5, 5);
      //  lerpPosition = utils.converters.polar.vector(a, 100)

      const xOffset = map(sin(a), -1, 1, -width/3, width/3);
      const yOffset = map(cos(a), -1, 1, -height/3, height/3)
      
      const innerShapesCount = 7//map(sin(a + time*3), -1, 1, -7, 7)+1;

      let opacityFactor = map(
        cos(lerpIndex*25-time*5),
        -1,
        1,
        // map(sin(a/2), -1, 1, 1, 500),
        map(sin(lerpIndex*3+time), -1, 1, 1, 50),
        // 10,
        1
      );

      opacityFactor = map(
        map(sin(lerpIndex*2+time*3), -1, 1, -1, 1),
        -1,
        1,
        // map(sin(a/2), -1, 1, 1, 500),
        map(cos(lerpIndex*3+time), -1, 1, 1, 250),
        // 10,
        1
      );

      for (let i = 0; i < innerShapesCount; i++) {
        const x = lerp(
          lerpPosition.x + xOffset * sin(a+time),
          lerpPosition.x - xOffset * cos(a+time/2),
          i / innerShapesCount
        );
        const y = lerp(
          lerpPosition.y + yOffset * cos(time),
          lerpPosition.y - yOffset * sin(time),
          i / innerShapesCount
        );

        target.fill(
          map(sin(hueCadence + i), -1, 1, 0, 360) / opacityFactor,
          map(cos(0 + hueCadence + i), -1, 1, 255, 0) / opacityFactor,
          map(sin(0 + hueCadence + i), -1, 1, 255, 0) / opacityFactor,
          // map(opacityFactor, 1, 500, 255, 0)
        );

        const w = 40//map(sin(time+i), 1, -1,70, 10)


        // target.fill(
        //   map(sin(0 + hueCadence + i), -1, 1, 0, 255) / opacityFactor/2,
        //   map(cos(0 + hueCadence - i), -1, 1, 0, 255) / opacityFactor,
        //   map(sin(0 + hueCadence + i), -1, 1, 0, 255) / opacityFactor/2
        // );

        //utils.mappers.circularIndex(time*2+lerpIndex, [100, 50])

        // target.rect(x, y, map(sin(angle + time), -1, 1, 1, 20));
        // target.circle(x, y, map(cos(angle + time*2), -1, 1, 10, 50) );
        // if (opacityFactor < 50)
          target.circle(x, y, w );
      }
    }

    target.pop();
  }
}

utils.sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));
});