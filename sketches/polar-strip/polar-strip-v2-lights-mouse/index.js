const polarCoefficients = [
  [1, 1],
  [2, 3],
  // [4, 3],
  [2, 6],
  // [4, 6],
  [1, 3],
];

let pixilatedCanvas;

import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  pixilatedCanvas = createGraphics(
    canvas.main.width,
    canvas.main.height
  );
  pixilatedCanvas.pixelDensity(0.1);

  events.register("windowResized", () => {
    pixilatedCanvas.width = canvas.main.width;
    pixilatedCanvas.height = canvas.main.height;
    pixilatedCanvas.pixelDensity(0.1);
  });

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 5.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          end: createVector(0, height / 2),
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
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const cadence = index / shapes.length + time / 2;
    const interpolation = 0.05;
    const [x, y] = mappers.circularIndex(cadence, polarCoefficients);

    this.xPolarCoefficient = lerp(
      this.xPolarCoefficient || 0,
      x,
      interpolation
    );
    this.yPolarCoefficient = 3; //lerp(this.yPolarCoefficient || 0, y, interpolation);

    const { xPolarCoefficient, yPolarCoefficient } = this;

    push();
    pixilatedCanvas.push();

    translate(
      position.x, // * easeInOutBack(map(sin(time+index), -1, 1, 0.2, 1)),
      position.y // * easeInOutBack(map(cos(time+index), -1, 1, 0.2, 1))
    );

    this.xOff = lerp(this.xOff || 0, map(mouseX, 0, width, 1.5, 0), 0.3);
    this.yOff = lerp(this.yOff || 0, map(mouseY, 0, height, 1.5, 0), 0.3);

    pixilatedCanvas.translate(position.x * this.xOff, position.y * this.yOff);

    for (let angle = 0; angle < TAU; angle += angleStep) {
      push();
      translate(converters.polar.vector(angle, size));

      const xOffset =
        map(sin(angle + time), -1, 1, -PI, PI) *
        easeInOutBack(map(sin(time + index), -1, 1, 0.2, 1));
      const yOffset =
        map(cos(angle + time), -1, 1, -PI, PI) *
        easeInOutBack(map(sin(time + index), -1, 1, 0.2, 1));

      const vector = createVector(
        converters.polar.get(
          sin,
          size,
          angle + xOffset,
          xPolarCoefficient
        ),
        converters.polar.get(
          cos,
          size,
          angle + yOffset,
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
      pixilatedCanvas.beginShape();

      pixilatedCanvas.strokeWeight(size);
      strokeWeight(size);

      const c = color(
        map(sin(angle + index + hueCadence), -1, 1, 0, 360),
        map(cos(angle + index + hueCadence), -1, 1, 0, 255),
        map(sin(angle + index + hueCadence), -1, 1, 255, 0)
        //map(xPolarCoefficient + yPolarCoefficient, 0, 10, 0, 255)
      );

      stroke(c);
      pixilatedCanvas.stroke(c);

      vertex(vector.x, nextVector.y);
      vertex(nextVector.x, vector.y);

      pixilatedCanvas.endShape();
      endShape();
      pop();
    }

    //write(`${xPolarCoefficient} - ${yPolarCoefficient}`, -size, size + 20);

    pop();
    pixilatedCanvas.pop();
  }
}

function write(str, x, y, size) {
  fill(255);
  stroke(0);
  strokeWeight(0);
  textSize(size || 18);
  text(str, x, y);
}

sketch.draw( time => {
  const angleAmount = 256 / shapes.length;
  const angleStep = TAU / angleAmount;

  background(0);

  //pixilatedCanvas.background(0, 0, 0, 0.5);
  pixilatedCanvas.filter(BLUR, 3);
  image(pixilatedCanvas, 0, 0);

  shapes.forEach((shape, index) => shape.draw(time, index, angleStep));

  //  background(
  //     map(sin(time), -1, 1, 128, 360),
  //     map(cos(time), -1, 1, 128, 360),
  //     map(sin(time), -1, 1, 360, 128),
  //    64
  //   )

  // noFill()
  // stroke(255)
  // rect(bbox.x, bbox.y, bbox.w, bbox.h);
  // write(`TAU / ${angleAmount}`, shapes[0 ].size * 2, shapes[0 ].size );
} );
