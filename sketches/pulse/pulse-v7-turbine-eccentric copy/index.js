import { shapes, sketch, converters, canvas, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "start-size",
    type: 'number',
    label: 'Start size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 50,
    category: 'Integers'
  },
  {
    id: "end-size",
    type: 'number',
    label: 'End size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 15,
    category: 'Integers'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
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
    defaultValue: 6,
    category: 'Integers'
  }
] );

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
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

    const shadowsCount = 1//map(cos(index+time*3)+sin(-time/3+index), -1, 1, 1, 2, true)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const size = map(
        shadowIndex,
        0,
        shadowsCount,
        options.get("start-size"),
        options.get("end-size")
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(index -time * 5 + shadowIndex * 5), -1,  1,
          // shadowIndex, 0, shadowsCount,
          options.get("start-opacity-factor"),
          options.get("start-opacity-factor") * 5
        ),
        options.get("end-opacity-factor")
      );

      const ys = map(cos(index - time*2), -1, 1, -5, 5);
      const ySpeed = map(cos(index + time*2), -1, 1, -ys, ys);

      const xs = map(sin(index - time*2), -1, 1, -5, 5);
      const xSpeed = map(sin(index + time*2), -1, 1, xs, -xs);

      const l = shadowIndex/3;
      const indexCoefficient = shadowIndex + index;
      const x = map(sin(time + xSpeed - indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time + ySpeed - indexCoefficient), -1, 1, -l, l);

      translate(x*5, y*10);

      const angleCount = 7;
      const angleStep = TAU / angleCount;

      for (let angle = 0; angle < TAU; angle += angleStep) {
        const vector = converters.polar.vector(
          angle,
          size * options.get("size-ratio")
        );
        push();

        beginShape();
        strokeWeight(size);

        rotate(radians(time*20+shadowIndex));
        // rotate(sin(time+0+shadowIndex));

        stroke(
          color(
            map(sin(-time+shadowIndex+index+(shadowIndex/5)*10), -1, 1, 0, 360) /
              opacityFactor,
            map(cos(-time-shadowIndex+index-(shadowIndex/2.5)*5), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(-time+shadowIndex+index+(shadowIndex/1)*1), -1, 1, 360, 0) /
              opacityFactor,
              // 50
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
