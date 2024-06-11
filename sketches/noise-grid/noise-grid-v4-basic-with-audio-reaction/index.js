import { events, sketch, converters, animation, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

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
    id: "grid-columns",
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

events.register("post-setup", () => {
  audio.capture.setup()
  //events.register("post-draw", audio.capture.energy.recordHistory );
  // midi.setup()
});
sketch.setup();

let min = Math.PI, max =0;

sketch.draw((time) => {
  background(0);

  // nrj = audio.capture.energy.average()

  let n = animation.sequence(
    "grid-cell-n",
    audio.capture.energy.byName( "lowMid", "count"),
    [ 0.75, 1, 1.25 ],
    0.67
  )

  const rows = options.get("grid-rows");
  const columns = options.get("grid-columns");

  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columns,
    centered: options.get("grid-cell-centered")
  }

  let z = frameCount/300

  const scale = (width / columns);

  // noiseDetail(2, 4, 1);
  noFill();

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();
    translate( cellVector.x, cellVector.y );

    const angle = noise(x/columns, y/rows+time/5, z) * (TAU*4);

    // console.log(angle);
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

      strokeWeight(2)
      circle(0, 0, weight)
    }
    pop();
  })
});
