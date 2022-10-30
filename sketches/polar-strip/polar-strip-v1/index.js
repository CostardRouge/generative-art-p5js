const polarCoefficients = [
  [1, 1],
  [2, 3],
  [4, 3],
  [2, 6],
  [4, 6],
  [6, 3],
];

import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 4.5;

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

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
}

function easeInOutBack(x) {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
}

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

  draw(time, index, angleStep) {
    let { position, size } = this;

    const hueCadence = index + time;
    const offsetCadence = index + time * 3.5;
    const offsetAccelerationCadence = index + time;
    //const cadence = (index/shapes.length) + time/2;
    //const interpolation = 0.05
    //const [x, y] = mappers.circularIndex(cadence, polarCoefficients);

    this.xPolarCoefficient = 1; //lerp(this.xPolarCoefficient || 0, x, interpolation);
    this.yPolarCoefficient = 1; //lerp(this.yPolarCoefficient || 0, y, interpolation);

    const { xPolarCoefficient, yPolarCoefficient } = this;

    push();
    translate(
      position.x, //* easeInOutBack(map(sin(time+index), -1, 1, 0.2, 1)),
      position.y // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    for (let angle = 0; angle < TAU; angle += angleStep) {
      push();

      const offsetAngle = angle * 3;
      const offsetPIFactor = PI / 3;
      const xOffset = map(
        sin(offsetAngle + offsetCadence),
        -1,
        1,
        -offsetPIFactor,
        offsetPIFactor
      ); // * easeInOutBack(map(sin(offsetAccelerationCadence), -1, 1, 0.0, 1));
      const yOffset = map(
        cos(offsetAngle + offsetCadence),
        -1,
        1,
        -offsetPIFactor,
        offsetPIFactor
      ); // * easeInOutBack(map(cos(offsetAccelerationCadence), -1, 1, 0.0, 1));

      translate(converters.polar.vector(angle, size));

      const vector = createVector(
        converters.polar.get(
          sin,
          size,
          angle + yOffset,
          xPolarCoefficient
        ),
        converters.polar.get(
          cos,
          size,
          angle + xOffset,
          yPolarCoefficient
        )
      );
      const nextVector = createVector(
        converters.polar.get(
          sin,
          size,
          angle + angleStep,
          xPolarCoefficient
        ),
        converters.polar.get(
          cos,
          size,
          angle + angleStep,
          yPolarCoefficient
        )
      );

      beginShape();
      strokeWeight(size / shapes.length);

      stroke(
        map(sin(angle + hueCadence), -1, 1, 0, 360),
        map(cos(angle + hueCadence), -1, 1, 0, 360),
        map(sin(angle + hueCadence), -1, 1, 360, 0)
        //map(xPolarCoefficient + yPolarCoefficient, 0, 10, 0, 255)
      );

      vertex(vector.x, nextVector.y);
      vertex(nextVector.x, vector.y);

      endShape();
      pop();
    }

    //write(`${xPolarCoefficient} - ${yPolarCoefficient}`, -size, size + 20);

    pop();
  }
}

function write(str, x, y, size = 18) {
  const bbox = font.textBounds(str, x, y, size);

  fill(255);
  stroke(0);
  strokeWeight(0);
  textSize(size);
  text(str, x - bbox.w / 2, y + bbox.h / 2);
}

sketch.draw( time => {
  const angleAmountFactor = 192; //mappers.circularIndex(seconds, [2, 4, 8, 16, 32, 64, 128, 256]);
  const angleAmount = angleAmountFactor / shapes.length;
  const angleStep = TAU / angleAmount;

  background(0);

  //  background(
  //     map(sin(time), -1, 1, 128, 360),
  //     map(cos(time), -1, 1, 128, 360),
  //     map(sin(time), -1, 1, 360, 128),
  //    128
  //   )

  shapes.forEach((shape, index) => shape.draw(time, index, angleStep));

  // write(`TAU / ${angleAmount}`, shapes[0 ].size * 2, shapes[0 ].size );
  //write(`${angleAmountFactor}`, width /2, height/2, 72 );
} );
