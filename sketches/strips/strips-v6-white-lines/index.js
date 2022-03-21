import { shapes, options, sketch, converters } from './utils/index.js';

options.add( [
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 1000,
    step: 10,
    defaultValue: 300,
    category: 'Integers'
  },
  {
    id: "circle-weight",
    type: 'number',
    label: 'Circle weight',
    min: 5,
    max: 100,
    step: 5,
    defaultValue: 42,
    category: 'Integers'
  },
  {
    id: "lines-count",
    type: 'number',
    label: 'Lines count',
    min: 1,
    max: 25,
    defaultValue: 7,
    category: 'Integers'
  }
] );

sketch.setup(() => { 
  shapes.push(
    new Strip({
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
    let { position } = this;

    const hueCadence = index + time;

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / options.get( 'quality' );

    const l = 1//map(sin(time*2), -1, 1, 0.5, 0.9);
    for (let lerpIndex = 0; lerpIndex < l; lerpIndex += lerpStep) {

      let a = map(sin(lerpIndex+time), -1, 1, -PI, PI)//map(sin(time), -1, 1, 1, 5);
      a = map(lerpIndex, 0, 1, -PI, PI)/1.5//map(sin(time), -1, 1, 1, 5);
      let lerpPosition = converters.polar.vector(a)

      const xOffset = map(sin(a), -1, 1, -width/2.5, width/2.5);
      const yOffset = map(cos(a), -1, 1, -height/3, height/3)
      
      const innerShapesCount = options.get( 'lines-count' );

      const opacityFactor = map(
        cos(lerpIndex*15+time*5),
        -1,
        1,
        10,
        1
      );

      for (let i = 0; i < innerShapesCount; i++) {
        const x = lerp(
          lerpPosition.x - xOffset * cos(time),
          lerpPosition.x - xOffset * sin(time),
          i / innerShapesCount
        );
        const y = lerp(
          lerpPosition.y + yOffset * cos(time),
          lerpPosition.y - yOffset * sin(time),
          i / innerShapesCount
        );

        // target.fill(
        //   map(sin(0 + hueCadence - i), -1, 1, 360, 0) / opacityFactor,
        //   map(cos(0 - hueCadence + i), -1, 1, 255, 0) / opacityFactor,
        //   map(sin(0 - hueCadence + i), -1, 1, 255, 0) / opacityFactor,
        // );

        target.circle(x, y, options.get( 'circle-weight' ) );
      }
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
