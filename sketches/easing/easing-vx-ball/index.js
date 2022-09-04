import { canvas, sketch, converters, audio, animation, string, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 20,
    defaultValue: 10,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Opacity'
  },

  {
    id: "background-lines-count",
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 70,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 4,
    category: 'Background'
  },
  {
    id: "background-pixelated-blur",
    type: 'slider',
    min: 1,
    max: 8,
    label: 'Pixelated blur value',
    defaultValue: 4,
    category: 'Background'
  },
  {
    id: "background-pixel-density",
    type: 'slider',
    min: 0.01,
    max: 1,
    step: 0.01,
    label: 'Pixelated pixel density',
    defaultValue: 0.05,
    category: 'Background',
    onChange: value => {
      pixilatedCanvas.pixelDensity(value); 
    }
  },
] );

let vectors = []

sketch.setup( () => {
  // audio.capture.setup();

  vectors.push(
    createVector( width / 2, 200 ),
    createVector( width / 2, height / 2 ),
    createVector( width / 2, height - 200 )
  )
});


sketch.draw((time) => {
  // audio.capture.energy.compute();

  background(0);

  strokeWeight(2);
  stroke(255);
  noFill();

  vectors.forEach(vector => {
    circle( vector.x, vector.y, 50);
  });
  let moving = animation.sequence(
    "moving",
    time/2,
    vectors,
    0.05,
    // p5.Vector.lerp,
    (current, next, _amt) => {
      return p5.Vector.lerp(
        current,
        next,
        easing.easeInOutElastic(time % 1.1)
      )
    }
  )

  moving = p5.Vector.lerp(
    vectors[0],
    vectors[1],
    easing.easeInOutElastic(time/2 % 1.1)
    // map(mouseY, 0, height, 0, 1, true)
  )


  fill('red');
  noStroke();
  circle( moving.x, moving.y, 30);
});
