import { shapes, sketch, converters, iterators, events, time, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "orbit-control",
    type: 'switch',
    label: 'Orbit control',
    defaultValue: 150,
    category: 'Debug'
  },
] );

sketch.setup(() => {
  shapes.push( new Ball({
    position: createVector(0, height / 2, 0),
    color: color('red'),
    size: 40
  }) );
}, { type: 'webgl' });

class Ball {
  constructor({ position, color, size }) {
    this.position = position;
    this.color = color;
    this.size = size;
  }
  draw() {
    translate(this.position)
    fill(this.color);
    sphere(this.size);
  }
}

sketch.draw( time => {
  background(0);

  noFill();
  translate(-width / 2, -height / 2);

  shapes.forEach( shape => shape.draw() );

  debugMode();
  // debugMode(GRID);
  options.get("orbit-control") && orbitControl();
});
