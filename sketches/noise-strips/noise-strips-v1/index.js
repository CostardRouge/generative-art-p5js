import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 260,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 16,
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

events.register("post-setup", () => {
  //audio.capture.setup(0.2, 2048)
});

sketch.draw((time) => {
  background(0);

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

  const scale = (width / columns);
  const zMax = scale * 15;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;
    const angle = noise(xOff, yOff+time/8, time/10) * (TAU*4);
    const z = zMax * cos(angle);

    const weight = map(z, -zMax, zMax, 25, 50 );
    const colorFunction = mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI)*2,
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      // opacityFactor: map(sin(time+angle*2), -1, 1, 3, 1)
    }))

    push();

    translate( cellVector.x, cellVector.y );
    translate(scale * sin(angle), scale * cos(angle) )
    strokeWeight(weight);
    point( 0, 0);

    pop();
  })
});
