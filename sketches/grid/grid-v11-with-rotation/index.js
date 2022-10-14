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
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
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
  },
  {
    id: "grid-multiply-over-time",
    type: 'switch',
    label: 'Multiply size over time',
    defaultValue: false,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time-min",
    label: 'Multiplier min',
    type: 'slider',
    min: 1,
    max: 10,
    defaultValue: 2,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time-max",
    label: 'Multiplier max',
    type: 'slider',
    min: 1,
    max: 10,
    defaultValue: 4,
    category: 'Grid'
  },
] );

events.register("post-setup", () => {
  // audio.capture.setup(0, 512)
  // events.register("post-draw", audio.capture.energy.recordHistory );
  // midi.setup()
});

let direction = undefined;

// sketch.setup((center) => {
//   direction = center.copy();
// }, { type: 'webgl' });

sketch.setup((center) => {
  direction = center.copy();
});

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

const cache = function(key, compute, enabled = true) {
  cache.values = cache.values ?? {};

  if ( enabled !== true || undefined === cache.values[ key ] ) {
    return cache.values[ key ] = compute();
  }

  return cache.values[ key ];
}

sketch.draw((time, center) => {

  // rotateY(time)

  background(0);
  // rotateX(degrees(115))

  // ambientLight(60);

  // translate(
  //   -width /2,
  //   // -height / 2
  //   -height / 2
  // )
  let n = options.get("grid-multiply-over-time") ? mappers.fn(
    sin(time/2),
    -1,
    1,
    options.get("grid-multiply-over-time-min"),
    options.get("grid-multiply-over-time-max"),
    easing.easeInBounce
    ) : 1;

  // nrj = audio.capture.energy.average()

  // n = animation.sequence(
  //   "grid-cell-n",
  //   audio.capture.energy.byIndex( 1, "count"),
  //   [ 0.75, 1, 1.25 ],
  //   0.67
  // )

  const rows = options.get("grid-rows")*n;
  const cols = options.get("grid-cols")*n;

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const cellSize = ((width+height) / (cols+rows));
  const cellHeight = (height) / (rows);
  const cellWidth = ((width) / (cols));


  noStroke()
  noiseDetail(4, 0.3)

  // direction.add(
  //   map(mouseX, 0, width, -0.05, 0.05),
  //   map(mouseY, 0, height, 0.05, -0.05),
  // )

  const mouseAngle = map(mouseX, 0, width, -PI/2, PI/2)

  //  direction.add(
  //   0.01 * cos(time), 
  //   0.01 * sin(time)
  // )

  direction.add( 0, -0.05 )

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center, mouseAngle);

    const noiseValue =noise(rotatedX/cols, rotatedY/rows)// cache(`noise`, () => noise(rotatedX/cols + direction.x, rotatedY/rows + direction.y));
    const angle = noiseValue * TAU * 4

    const cachedColor = cache(angle.toPrecision(3), () => (
      colors.rainbow({
        hueOffset: 0,
        hueIndex: map(angle, 0, TAU, -PI/2, PI/2 ),
        opacityFactor: 1.5,
        // opacityFactor: map(energy, 0, 255, 3, 1 )
      })
    ));
    
    stroke(cachedColor)

    // box( cellVector.x, cellVector.y, map(energy, 0, 255, 0, 150) )

    // let h = map(energy, 0, 255, 0, 950);
    // h = mappers.fn(energy, 0, 255, 0, 900, Object.entries(easing)[0][1])
    

    // normalMaterial(0);
    // shininess(50);
    // translate( cellVector.x, cellVector.y, -h/2)
    // box( cellSize, cellSize, h)

    push();
    translate( cellVector.x, cellVector.y );

    // stroke(255)
    strokeWeight(10);
    point( 0, 0);

    pop();
  })

  // endShape()
  // orbitControl()
  //audio.capture.energy.draw()
});
