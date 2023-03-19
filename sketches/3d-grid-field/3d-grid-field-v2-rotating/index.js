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
  const mouseAngle = time/8//map(mouseX, 0, width, -PI/2, PI/2)

  direction.add(0, 0.01)

  // translate( center )
  rotateX(radians(30))
  // rotateZ(map(sin(time), -1, 1, -PI, PI)/16)
  // rotateX(map(cos(time), -1, 1, -PI, PI)/16)

  background(0);

  const rows = options.get("grid-rows");
  const cols = options.get("grid-cols");

  const W = ( width / 2 )// * 1.5;
  const H = ( height / 2 ) * 1.5;

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

  noiseDetail(16, 0.1)

  const zMax = scale * 10;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center.div(2), mouseAngle);
    const xOff = rotatedX/cols;
    const yOff = rotatedY/rows;
    const angle = noise(xOff+direction.x, yOff+direction.y, time/5) * (TAU*4);

    push();
    translate( cellVector.x, cellVector.y );

    const z = zMax * cos(angle);

    // stroke(colors.rainbow({
    //   hueOffset: 0,
    //   hueIndex: map(z, -zMax, zMax, -PI, PI),
    //   hueIndex: map(sin(angle+time+(y/rows)*5), -1, 1, -PI, PI),
    //   opacityFactor: map(z, -zMax, zMax, 3, 1)
    // }))

    // stroke(colors.rainbow({
    //   hueOffset: 0,
    //   // hueIndex: map(z, -zMax, zMax, -PI, PI),
    //   hueIndex: map(angle, 0, TAU, -PI, PI)*2,
    //   opacityFactor: map(z, -zMax, zMax, 3, 1)
    // }))

    
    const colorFunction = mappers.circularIndex(noise(yOff+time/5, xOff, -time/2)+time*2, [colors.rainbow,colors.purple])
    // const colorFunction = mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI),
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      // opacityFactor: map(sin(time+angle*2), -1, 1, 3, 1)
    }))

    strokeWeight(3);

    translate(scale * sin(angle), scale * cos(angle), z)
    point( 0, 0);

    pop();
  })

  orbitControl();
});
