import { events, sketch, converters, animation, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'columns',
    min: 1,
    max: 200,
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
  audio.capture.setup(0, 8192)
  events.register("post-draw", audio.capture.energy.recordHistory );
  // midi.setup()
});
sketch.setup(() => {

  // perspective(PI / 3.0, width / height, 0.1, 500);
}, { type: 'webgl' });

let min = Math.PI, max =0;
let musicActivity = 0;
let bassActivity = 0;

sketch.draw((time, center) => {

  // rotateY(time)

  background(0);
  rotateX(degrees(90))

  // ambientLight(60);

  translate(
    -width /2,
    -height / 2,
    100
  )

  // nrj = audio.capture.energy.average()

  // n = animation.sequence(
  //   "grid-cell-n",
  //   audio.capture.energy.byIndex( 1, "count"),
  //   [ 0.75, 1, 1.25 ],
  //   0.67
  // )

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

  const cellSize = ((width+height) / (columns+rows));
  const audioEnergyAverage = audio.capture.energy.average("raw");
  const bassAverage = audio.capture.energy.byIndex(2, "raw");

  musicActivity += map(audioEnergyAverage, 0, 0.5, 0, 0.01, true);
  bassActivity += map(bassAverage, 0, 1, 0, 0.01, true);

  //noStroke()
  // noFill();

  stroke(255)
  strokeWeight(1)
  // beginShape(LINES)

  noStroke()

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();

    const energy = audio.capture.energy.map(x / (columns - 1), y / (rows - 1));

    fill(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(energy, 0, 1, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      //opacityFactor: map(energy, 0, 255, 3, 1 )
    }))

    // box( cellVector.x, cellVector.y, map(energy, 0, 255, 0, 150) )

    const h = map(energy, 0, 1, 0, 250);
    translate( cellVector.x, cellVector.y, -h/2)

    // normalMaterial(0);
    // shininess(50);
    box( cellSize, cellSize, h)

    pop();
  })

  // endShape()


  orbitControl()

  // audio.capture.energy.draw()
});
