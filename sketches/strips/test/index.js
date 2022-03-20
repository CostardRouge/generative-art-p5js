import { shapes, options, sketch, converters } from './utils/index.js';

options.add( [
  {
    id: "circles-count",
    type: 'number',
    label: 'Circles',
    min: 1,
    max: 1000,
    step: 10,
    defaultValue: 500,
    category: 'Integers'
  },
  {
    id: "circle-weight",
    type: 'number',
    label: 'Circle weight',
    min: 5,
    max: 100,
    step: 5,
    defaultValue: 50,
    category: 'Integers'
  },
  {
    id: "max-lines-count",
    type: 'number',
    label: 'Max lines count',
    min: 1,
    max: 25,
    defaultValue: 10,
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
    const { position } = this;
    const hueCadence = index + time;

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / options.get( 'circles-count' );

    const l = 1//map(sin(time*2), -1, 1, 0.5, 1);
    for (let lerpIndex = 0; lerpIndex < l; lerpIndex += lerpStep) {

      let a = map(lerpIndex, 0, 1, -PI, PI)/map(sin(time), -1, 1, 1, 5);
      let lerpPosition = converters.polar.vector(a, 1)

      const xOffset = map(sin(a), -1, 1, -width/2.5, width/2.5);
      const yOffset = map(cos(a), -1, 1, -height/3, height/3)
      
      const aa = map(cos(time+a), -1, 1, 0.1, 1)*1;
      const innerShapesCount = map(cos(time+aa), -1, 1, 1, options.get( 'max-lines-count' ));

      const opacityFactor = map(
        sin(lerpIndex*15-time*7),
        -1,
        1,
        5,
        1
      );

      for (let i = 0; i < innerShapesCount; i++) {
        const x = lerp(
          lerpPosition.x + xOffset * sin(time),
          lerpPosition.x - xOffset * cos(time),
          i / innerShapesCount
        );
        const y = lerp(
          lerpPosition.y + yOffset * cos(time),
          lerpPosition.y - yOffset * sin(time),
          i / innerShapesCount
        );

        // target.fill(
        //   map(sin(0 + hueCadence - i), -1, 1, 360, 0) / opacityFactor,
        //   map(cos(0 + hueCadence + i), -1, 1, 255, 128) / opacityFactor,
        //   map(sin(0 - hueCadence + i), -1, 1, 360, 64) / opacityFactor,
        // );

        target.fill(
          map(sin(0 + hueCadence - i), -1, 1, 360, 0) / opacityFactor,
          map(cos(0 + hueCadence + i), -1, 1, 255, 0) / opacityFactor,
          map(sin(0 - hueCadence + i), -1, 1, 360, 0) / opacityFactor,
        );

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
