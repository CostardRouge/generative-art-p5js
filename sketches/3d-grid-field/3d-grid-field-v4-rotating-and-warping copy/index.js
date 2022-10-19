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

p5.disableFriendlyErrors = true;

sketch.setup((center) => {
  direction = center;
}, { type: 'webgl' });

const easingFunctions = Object.entries(easing)

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

sketch.draw((time, center) => {
  const mouseAngle = 0//createVector(mouseX, mouseY).angleBetween(center) || 0

  direction.add(0, -0.05)

  rotateX(radians(30))
  translate(0, -100, -1000)

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

  const W = ( width / 2 ) * 2.4;
  const H = ( height / 2 ) * 2;

  const gridOptions = {
    startLeft: createVector( -W, -H ),
    startRight: createVector( W, -H ),
    endLeft: createVector( -W, H/2 ),
    endRight: createVector( W, H/2 ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const scale = (width / cols);

  noiseDetail(4, 0.1)

  const zMax = scale * 10;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center.div(2), mouseAngle);
    const xOff = rotatedX/cols;
    const yOff = rotatedY/rows;
    const angle = noise(xOff+direction.x, yOff+direction.y) * TAU;

    push();
    translate( cellVector.x, cellVector.y );

    const z = zMax * cos(angle);


    const easingFunction = mappers.circularIndex(y/rows-time, easingFunctions)
    // const colorFunction = mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])


    stroke(colors.purple({
      hueOffset: 0,
      hueIndex: mappers.fn(z, -zMax, zMax, -PI, PI, easingFunction[1]),
      opacityFactor: map(z, -zMax, zMax, 3, 1),
    }))

    strokeWeight(3);

    let yy = mappers.fn(y, 0, rows -1, 0, 300, easing.easeOutQuint)// * sin(time)

    translate(0, 0, z + yy )
    point( 0, 0);

    pop();
  })

  orbitControl();
});
