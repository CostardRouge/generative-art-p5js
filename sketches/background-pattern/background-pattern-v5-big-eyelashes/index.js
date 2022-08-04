import { shapes, sketch, converters, canvas, events, colors, mappers, iterators, options, text } from './utils/index.js';

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

const drawRadialPattern = (count = 7, time, _color) => {
  noFill();
  strokeWeight(options.get("background-lines-weight"));

  const size = (width + height)/5;
  const position = createVector( 0, 0 );
  const p = options.get("background-lines-precision")
  const hueSpeed = time * options.get("hue-speed");

  const c = mappers.seq("c", time/2, [30, 60, 120, 240], 0.05)

  iterators.angle(0, TAU, TAU / c, angle => {
    const edge = converters.polar.vector(
      angle,
      size,
      size
    );

    const opacityFactor = mappers.circularMap(
      angle,
      TAU,
      map(
        sin(-time * options.get("opacity-speed") + angle * options.get("opacity-group-count") ), -1, 1,
        options.get("start-opacity-factor"),
        options.get("end-opacity-factor")
      ),
      options.get("end-opacity-factor")
    );

    beginShape();

    iterators.vector(edge, position, p, (vector, lerpIndex) => {
      const c = color(
        map(sin(hueSpeed+angle+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed-angle+lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
        map(sin(hueSpeed+angle+lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
      )

      fill( c );
      stroke( c );

      const pos = createVector(
        vector.x * (sin(time*2 + angle + lerpIndex) + 1.5),
        vector.y * (cos(time - angle+ lerpIndex) + 1.5),
      );

      // circle(pos.x, pos.y, map(sin(lerpIndex+time), -1, 1, 0, 20))
      // circle(pos.x, pos.y, map(lerpIndex, 0, 1, 0, 20))
      // strokeWeight(map(sin(lerpIndex+time), -1, 1, 0, 10))
      vertex( pos.x, pos.y );
    })

    endShape();
  } )
}

sketch.draw((time) => {
  background(0);

  translate(width / 2, height / 2);
  drawRadialPattern(
    options.get("background-lines-count"),
    time
  );
});
