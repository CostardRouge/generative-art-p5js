import { shapes, sketch, converters, debug, animation, string, mappers, iterators, options, easing } from './utils/index.js';

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
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 70,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 4,
    category: 'Background'
  },
] );

sketch.setup();

let name = ""

const drawRadialPattern = (count = 7, time) => {
  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const hueSpeed = time;
  const functionChangeSpeed = time;
  const easingFunctions = Object.entries( easing );

  string.write("JustBe", 0, -size-64, {
    // showBox: true,
    center: true,
    size: 255,
    strokeWeight: 10,
    stroke: color(252, 237, 224),
    fill: color(227, 175, 74),
    font: string.fonts.sans
  })

  iterators.angle(0, TAU, TAU / 22, (angle, index) => {
    const edge = converters.polar.vector(
      angle+time/10,//*cos(time/2)+sin(time/2),
      size,
      size
    );

    iterators.vector(edge, center, 1 / 150, (vector, lerpIndex) => {      
      const [ easingFunctionName, easingFunction ] = mappers.circularIndex( functionChangeSpeed+angle/20+lerpIndex, easingFunctions);
      name = easingFunctionName.replace("o", "*");

      const hueIndex = index*5+lerpIndex*5;
      const hueMaximum = 360;
      const hueMinimum = 0;

      const opacityFactor = 1.5
      
      stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor
      ) );

      // stroke( color(
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(cos(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum, easingFunction) / opacityFactor,
      //   map(lerpIndex, 0, 1, 255, 0),
      // ) );

      strokeWeight(mappers.fn(lerpIndex, 0, 1, 70, 3, easingFunction));
      point( vector.x, vector.y );
    })
  } )

  string.write("temple", 0, size+64/2 , {
    // showBox: true,
    center: true,
    size: 64,
    strokeWeight: 10,
    stroke: color(252, 237, 224),
    fill: color(227, 175, 74),
    // font: string.fonts.sans
  })
}

sketch.draw((time) => {
  background(19, 26, 139);
  // background(252, 237, 224);
  // background(227, 175, 74);
  translate(width / 2, height / 2);
  drawRadialPattern( 22, time );
});
