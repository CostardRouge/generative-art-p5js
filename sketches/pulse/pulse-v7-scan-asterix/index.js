import { shapes, sketch, converters, canvas, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "lines-count",
    type: 'number',
    label: 'Max lines count',
    min: 1,
    max: 10,
    defaultValue: 3,
    category: 'Integers'
  },
  {
    id: "start-weight",
    type: 'number',
    label: 'Start weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 200,
    category: 'Integers'
  },
  {
    id: "end-weight",
    type: 'number',
    label: 'End weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 20,
    category: 'Integers'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 5,
    category: 'Integers'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Integers'
  },
  {
    id: "size-ratio",
    type: 'number',
    label: 'Size ratio',
    min: 1,
    max: 10,
    defaultValue: 3,
    category: 'Integers'
  }
] );

sketch.setup(() => {
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
});

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
    const { position } = this;
    push();
    translate(position.x, position.y);

    const shadowsCount = 5//map(sin(time), -1, 1, 1, 5)
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
        options.get("start-weight"),
        options.get("end-weight")
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(-time * 5 + shadowIndex * 2),
          -1,
          1,
          options.get("start-opacity-factor"),
          options.get("start-opacity-factor") * 10
        ),
        options.get("end-opacity-factor")
      );

      const l = shadowIndex/2;
      const indexCoefficient = shadowIndex;
      const x = map(sin(time * 2 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time * 1 + indexCoefficient), -1, 1, -l, l);

      translate(x, y);

      const angleStep = TAU / options.get("lines-count")

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle,
          weight * options.get("size-ratio")
        );

        beginShape();
        strokeWeight(weight);

        rotate(map(sin(time+shadowIndex), -1, 1, -1, 1)/2);
        // rotate(TAU, 0, TAU, -1, 1);

        stroke(
          color(
            map(sin(shadowIndex + l), -1, 1, 0, 360) /
              opacityFactor,
            map(cos(shadowIndex + l), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(shadowIndex + l), -1, 1, 360, 0) /
              opacityFactor
          )
        );
        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);

        endShape();
        pop();
      }
    }

    pop();
  }
}

sketch.draw((time) => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
