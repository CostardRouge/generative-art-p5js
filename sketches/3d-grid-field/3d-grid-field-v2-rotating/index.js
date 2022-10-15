import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 100,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
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

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

sketch.draw((time, center) => {
  const mouseAngle = time/5//map(mouseX, 0, width, -PI/2, PI/2)

  direction.add(0, 0.05)

  // translate( center )
  rotateX(radians(30))
  rotateZ(map(sin(time), -1, 1, -PI, PI)/16)
  rotateX(map(cos(time), -1, 1, -PI, PI)/16)

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

  const W = ( width / 2 )// * 1.5;
  const H = ( height / 2 ) * 1.8;

  const gridOptions = {
    startLeft: createVector( -W, -H ),
    startRight: createVector( W, -H ),
    endLeft: createVector( -W, H ),
    endRight: createVector( W, H ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const scale = (width / cols);

  noiseDetail(6, 0.1)

  const zMax = scale * 5;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center.div(2), mouseAngle);
    const angle = noise(rotatedX/cols+direction.x, rotatedY/rows+direction.y, time/5) * TAU * 4

    push();
    translate( cellVector.x, cellVector.y );

    const z = zMax * cos(angle);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI),
      opacityFactor: map(z, -zMax, zMax, 3, 1)
    }))

    // strokeWeight(weight);
    strokeWeight(1);

    translate(scale * sin(angle), scale * cos(angle), z )
    point( 0, 0);
    // vertex( cellVector.x, cellVector.y, z );

    // vertex( cellVector.x + scale, cellVector.y  );
    // vertex( cellVector.x, cellVector.y + (height / rows), z );

    pop();
  })

  // console.log({
  //   max, min
  // });

  orbitControl();
});
