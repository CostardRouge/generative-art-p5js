import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 150,
    defaultValue: 100,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 150,
    defaultValue: 100,
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

let direction = undefined;

sketch.setup((center) => {
  direction = center;
}, { type: 'webgl' });

let min = Math.PI, max =0;

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

sketch.draw((time, center) => {
  const mouseAngle = map(mouseX, 0, width, -PI/2, PI/2)

  direction.add(0, 0.01)

  rotateX(degrees(-70))
  // rotateZ(time)

  translate(
    -width /2,
    -height / 2
  )

  background(0);

  const n = options.get("grid-multiply-over-time") ? mappers.fn(
    sin(time/2),
    -1,
    1,
    options.get("grid-multiply-over-time-min"),
    options.get("grid-multiply-over-time-max"),
    easing.easeInBounce
    ) : 1;
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

  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / cols);

  // noiseDetail(2, 1, 2) 

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center, mouseAngle);

    const angle = noise(rotatedX/cols+direction.x, rotatedY/rows+direction.y) * TAU * 4
    // const angle = noise(x/cols+direction.x, y/rows+direction.y) * (TAU*4);

    let weight = map(angle, min, TAU, 1, 20, true );

    min = Math.min(min, angle);
    max = Math.max(max, angle);
    
    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, 0, TAU, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      // opacityFactor: map(energy, 0, 255, 3, 1 )
    }))

    push();
    translate( cellVector.x, cellVector.y );

    strokeWeight(weight);

    translate(scale * sin(angle), scale * cos(angle) , scale * cos(angle) * 5 )
    point( 0, 0);

    pop();
  })

  // console.log({
  //   max, min
  // });

  orbitControl();
});
