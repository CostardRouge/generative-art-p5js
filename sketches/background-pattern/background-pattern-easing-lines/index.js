import { shapes, sketch, converters, events, colors, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 10,
    defaultValue: 6,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Opacity'
  },
  {
    id: "hue-speed",
    type: 'slider',
    label: 'Hue speed',
    min: -10,
    max: 10,
    defaultValue: 2,
    category: 'Colors'
  },

  {
    id: "background-lines-count",
    type: 'number',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 100,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 1,
    category: 'Background'
  },
  {
    id: "background-lines-precision",
    type: 'slider',
    min: 0.1,
    max: 1,
    step: 0.1,
    label: 'Lines precision',
    defaultValue: 0.1,
    category: 'Background'
  },
] );

sketch.setup();

sketch.draw(time => {
  const hueSpeed = 1//time * options.get("hue-speed");

  background(0);

  const weight = 3;
  const columns = 7;

  strokeWeight(weight)
  stroke(255)
  noFill()

  const columnSize = width / columns
  const halfColumnSize = (columnSize /2 )
  const columnPadding = weight + halfColumnSize;
  const precision = 0.01;

  for (let i = 0; i < columns; i++) {
    const x = ( i * columnSize ) + halfColumnSize;
    const top = createVector( x, 0);
    const bottom = createVector(x, height);

    const opacityFactor = 1
    // mappers.circularMap(
    //   i,
    //   columns,
    //   map(
    //     sin(-time * options.get("opacity-speed") + i * options.get("opacity-group-count") ), -1, 1,
    //     options.get("start-opacity-factor"),
    //     options.get("end-opacity-factor")
    //   ),
    //   options.get("end-opacity-factor")
    // );
    // const hue = color(
    //   map(sin(hueSpeed+i), -1, 1, 0, 360) / opacityFactor,
    //   map(sin(hueSpeed-i), -1, 1, 360, 0) / opacityFactor,
    //   map(sin(hueSpeed+i), -1, 1, 360, 0) / opacityFactor,
    // )

    // stroke( hue );
    // hue.setAlpha( 50)
    // fill( hue );

    beginShape()
    iterators.vector(top, bottom, precision, ( position, lerpIndex ) => {
      const driftBound = (halfColumnSize + columnPadding) * sin(time + i);
      const driftX = map( easing.easeInOutBack((lerpIndex) % 1), 0, 1, -driftBound, driftBound);

      vertex( position.x + driftX, position.y );
    });
    endShape()
  }
});
