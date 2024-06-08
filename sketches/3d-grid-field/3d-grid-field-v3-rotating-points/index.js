import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 200,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 200,
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
  const mouseAngle = frameCount/100//map(mouseX, 0, width, -PI/2, PI/2)

  direction.add(0, 0.05)

  rotateX(radians(30))
  background(0);

  const rows = options.get("grid-rows");
  const columns = options.get("grid-columns");

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2 ),
    rows,
    columns,
    centered: options.get("grid-cell-centered")
  }

  const scale = (width / columns);

  noiseDetail(2, 0.1)

  const zMax = scale * 10;

  noFill()
  stroke(255)
  strokeWeight(3/4)

  beginShape(POINTS)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center.div(2), mouseAngle);
    const angle = noise(rotatedX/columns+direction.x, rotatedY/rows+direction.y) * TAU * 4

    const z = zMax * cos(angle);

    // stroke(colors.purple({
    //   hueOffset: 0,
    //   hueIndex: map(z, -zMax, zMax, -PI, PI),
    //   opacityFactor: map(sin(angle+time*5), -1, 1, 10, 1)
    //   // opacityFactor: map(z, -zMax, zMax, 3, 1)
    // }))

    vertex( cellVector.x, cellVector.y, z );
  })

  endShape()

  orbitControl();
});
