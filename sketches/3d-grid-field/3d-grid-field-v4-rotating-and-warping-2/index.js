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
    id: "grid-columns",
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
  }
] );

let direction = undefined;

sketch.setup((center) => {
  direction = center;
  p5.disableFriendlyErrors = true;
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

  const rows = options.get("grid-rows");
  const columns = options.get("grid-columns");

  const W = ( width / 2 ) * 2.4;
  const H = ( height / 2 ) * 2;

  const gridOptions = {
    topLeft: createVector( -W, -H ),
    topRight: createVector( W, -H ),
    bottomLeft: createVector( -W, H/2 ),
    bottomRight: createVector( W, H/2 ),
    rows,
    columns,
    centered: options.get("grid-cell-centered")
  }

  const scale = ( (width / columns) + (height / rows) ) / 2;

  noiseDetail(4, 0.1)

  const zMax = scale * 10;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center.div(2), mouseAngle);
    const xOff = rotatedX/columns;
    const yOff = rotatedY/rows;
    const angle = noise(xOff+direction.x, yOff+direction.y) * TAU;

    push();
    translate( cellVector.x, cellVector.y );

    const z = zMax * cos(angle);
    const easingFunction = mappers.circularIndex(noise(x/columns+time/8, y/rows-time/5, time/10)+time*3, easingFunctions)
    const colorFunction = colors.purple//mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: mappers.fn(z, -zMax, zMax, -PI, PI, easingFunction[1]),
      opacityFactor: map(z, -zMax, zMax, 3, 1),
    }))

    strokeWeight(scale);

    let yy = mappers.fn(y, 0, rows -1, 0, 300, easing.easeInQuint)

    translate(0, 0, z + yy )
    point( 0, 0);

    pop();
  })

  orbitControl();
});
