import { shapes, sketch, converters, events, colors, mappers, iterators, options, string } from './utils/index.js';

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
    max: 20,
    defaultValue: 10,
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
    id: "background-lines-count",
    type: 'number',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 400,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 15,
    category: 'Background'
  },
  {
    id: "background-lines-precision",
    type: 'slider',
    min: 0.05,
    max: 1,
    step: 0.05,
    label: 'Lines precision',
    defaultValue: 0.5,
    category: 'Background'
  },
] );

sketch.setup();

const drawRadialPattern = (count = 7, time, _color) => {
  noFill();
  strokeWeight(2);

  const center = createVector( 0, 0 );
  const size = (width + height)/4;
  const p = 0.05
  const hueSpeed = time;

  iterators.angle(0, TAU, TAU / count, angle => {
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

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      stroke( color(
        map(sin(hueSpeed+angle+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
        128 / opacityFactor,
        360 / opacityFactor
      ) );

      const pos = createVector(
        vector.x * (sin(time*2 + angle + lerpIndex) + 1.5),
        vector.y * (cos(time - angle+ lerpIndex) + 1.5),
      );

      vertex( pos.x, pos.y );

    })

    endShape();
  } )
}

const drawRadialPattern2 = (count = 7, time, _color) => {
  noFill();
  // stroke(_color);
  strokeWeight(options.get("background-lines-weight"));

  const center = createVector( 0, 0 );
  const size = (width + height)/12;

  const p = options.get("background-lines-precision")
  const hueSpeed = time;

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,
      size * abs(sin(time - angle)),
      size * abs(cos(time + angle)),
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

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      stroke( color(
        map(sin(hueSpeed+angle+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
        128 / opacityFactor,
        360 / opacityFactor
      ) );

      const pos = createVector(
        vector.x * (sin(time*2 + angle + lerpIndex) + 1.5),
        vector.y * (cos(time - angle+ lerpIndex) + 1.5),
      );

      vertex( pos.x, pos.y );

    })

    endShape();
  } )


  // throw 5;
}

sketch.draw((time) => {
  background(0);

  translate(width / 2, height / 2);
  rotate(-time/4)
  drawRadialPattern(
    100,
    time
  );

  // drawRadialPattern2(
  //   options.get("background-lines-count"),
  //   time
  // );
});
