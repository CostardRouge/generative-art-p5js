import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          weightRange: [0, 10],
          opacityFactorRange: [5, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
})

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
    const newQuantityValue = mappers.circularIndex(time/2, [5, 3, 1,  4, 2]);
    // const newQuantityValue = mappers.circularIndex(time/2, [1,2,3,4,5]);

    this.quantity = lerp(this.quantity || 5, newQuantityValue, 0.05)

    const { position, size, weightRange, opacityFactorRange } = this;
    const hueCadence = index + time*2;
    push();
    translate(position.x, 0);

    const shadowsCount = 7//map(sin(time), -1, 1, 5, 20)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        weightRange[0],
        weightRange[1]*5
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(time * 7 + shadowIndex * 2),
          -1,
          1,
          opacityFactorRange[0],
          opacityFactorRange[0] * 5
        ),
        opacityFactorRange[1] * 1.5
      );

      const index = shadowIndex*5;
      const x = sin(time + shadowIndex)*2;
      const y = map(cos(time*2 + shadowIndex), -1, 1, 0, 3);

      translate(x, y);

      const angleStep = TAU / this.quantity//

      for (let angle = 0; angle < TAU; angle += angleStep) {
        // const angleIndex = mappers.circularIndex(angle, [0, 1, 2]);
        const hide = mappers.circularIndex(time/2+angle/2, [true, false]);
        // const hide = false//mappers.circularIndex(angle+time/2, [true, false]);

        push();
        const vector = converters.polar.vector(
          angle + (index % 2 ? -time : time) * -1,
          size
        );
        const c = map(shadowIndex, 0, shadowsCount, 1, 3);

        beginShape();
        strokeWeight(weight);
        stroke(
          color(
            map(sin(angle + shadowIndex*c + hueCadence), -1, 1, 0, 360) / opacityFactor,
            map(cos(angle + shadowIndex*c - hueCadence), -1, 1, 360, 0) / opacityFactor,
            map(sin(angle + shadowIndex*c + hueCadence), -1, 1, 360, 0) / opacityFactor,
            hide ? 10 : undefined
          )
        );

        rotate(-map(cos(shadowIndex*2+time), -1, 1, -0.5, 0.5));
        // rotate(TAU, 0, TAU, -1, 1);

        // stroke(
        //   color(
        //     map(sin(hueCadence + shadowIndex + angle), -1, 1, 0, 360) /
        //       opacityFactor,
        //     map(cos(hueCadence - shadowIndex + angle), -1, 1, 360, 0) /
        //       opacityFactor,
        //     map(sin(hueCadence + shadowIndex + angle), -1, 1, 360, 0) /
        //       opacityFactor,
        //       hide ? 10 : undefined
        //   )
        // );

        vertex(vector.x, -vector.y);
        vertex(vector.y, vector.x);

        endShape();
        pop();
      }
    }

    pop();
  }
}

function drawGrid(xCount, yCount, time) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  strokeWeight(3)

  stroke(
    128,
    128,
    255,
    // map(sin(time), -1, 1, 0, 100)
  );

  // stroke(
  //   color(
  //     map(sin(time), -1, 1, 0, 360) /
  //       1,
  //     map(sin(time*10), -1, 1, 360, 0) /
  //       1,
  //     map(sin(time), -1, 1, 360, 0) /
  //       1,
  //       // 50
  //   )
  // );

  const offset = -2;
  const xx = xSize * time
  const yy = ySize * time

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (y * ySize + yy) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

sketch.draw((time) => {
  background(0);
  //drawGrid(0, map(sin(time), -1, 1, 1, 1.01), time/4);
  drawGrid(0, 3, time/4);
  // drawGrid(4, 6, time/4);

  // const t = mappers.circularIndex(time, [-1, 1]);
  const timeSpeed = 1//cos(time/2)

  shapes.forEach((shape, index) => shape.draw(time + timeSpeed, index));



});



