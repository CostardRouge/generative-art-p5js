import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 70,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 70,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  }
] );

sketch.setup();

let min = Math.PI, max =0;

sketch.draw((time) => {
  background(0);
  
  const rows = options.get("grid-rows");
  const cols = options.get("grid-cols");

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / cols);

  // noiseDetail(2, 4, 1);
  noFill();

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();
    translate( cellVector.x, cellVector.y );

    const angle = noise(x/cols, y/rows+time/5, z) * (TAU*4);
    // const vector = p5.Vector.fromAngle(angle);

    const weight = map(angle, min, TAU, 1, 20, true );

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      opacityFactor: map(angle, min, max, 3, 1 )
    }))

    translate(scale * sin(angle), scale * cos(angle) )

    if(angle > max/2) {
      strokeWeight(weight);
      point( 0, 0);
    }
    else {
      stroke(colors.darkBlueYellow({
        hueOffset: 0,
        hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
        // opacityFactor: 1.5,
        opacityFactor: map(angle, min, max, 3, 1 )
      }))

      strokeWeight(1)
      circle(0, 0, weight)
    }
    pop();
  })
});
