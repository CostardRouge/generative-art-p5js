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

const drawRadialPattern = (count = 7, time) => {
  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const p = 0.005;
  const hueSpeed = -time*2;
  const functionChangeSpeed = time;

  const easingFunctions = Object.entries( easing );
  // const [ easingFunctionName ] = mappers.circularIndex( functionChangeSpeed/2, easingFunctions);

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,
      size,
      size
    );

    const opacityFactor = 1.5

    beginShape();

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      let [ , easingFunction ] = mappers.circularIndex( functionChangeSpeed, easingFunctions);
      [ , easingFunction ] = mappers.circularIndex( 0*functionChangeSpeed/2+angle/30+lerpIndex+(sin(time/2+lerpIndex)), easingFunctions);

      const hueIndex = angle*5+lerpIndex*10*abs(sin(time+0+lerpIndex))
      const hueMaximum = 360//map(sin(time+angle+lerpIndex), -1, 1, 0, 360);
      const hueMinimum = 0//map(cos(time+lerpIndex), -1, 1, 0, 360);


      // stroke( color(
      //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
      //   map(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
      //   map(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor,
      //   // map(lerpIndex, 0, 1, 0, 255),
      //   // map(lerpIndex, 0, 1, 255, 0),
      //   // mappers.fn(lerpIndex, 0, 1, 255, 0, easingFunction)
      // ) );

      stroke( color(
        mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
        mappers.fn(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
        mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum, easingFunction) / opacityFactor,
        mappers.fn(hueIndex, 0, 1, 0, 360, easingFunction) / opacityFactor,
        // mappers.fn(hueIndex, 0, 1, 360, 0, easingFunction) / opacityFactor,
        // map(cos(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        // map(sin(hueSpeed+hueIndex), -1, 1, 255, 0) / opacityFactor,
        // map(lerpIndex, 0, 1, 0, 255),
        // map(lerpIndex, 0, 1, 255, 0),
        // mappers.fn(lerpIndex, 0, 1, 255, 0, easingFunction)
      ) );

      // strokeWeight(map(lerpIndex, 0, 1, 70, 0));
      strokeWeight(mappers.fn(lerpIndex, 0, 1, 70, 0, easingFunction));
      point( vector.x, vector.y );

      // vertex( vector.x, vector.y );
    })

    strokeWeight(3)

    endShape();
return;
    string.write(easingFunctionName, 0, height / 2 - 60, {
      // showBox: true,
      center: true,
      size: 48,
      stroke: 0,//color(128, 128, 255),
      fill: color(64, 64, 360),
    }) 
  } )
}

sketch.draw((time) => {
  background(0);
  // debug.lines()

  translate(width / 2, height / 2);
  drawRadialPattern( 22, time );
  return

  string.write("QQQQQQQ", -width / 4, 0, {
    showBox: true,
    center: true,
    size: 30,
    stroke: color(128, 128, 255),
  }) 

  string.write("OOOOOOO", width /4 , 0, {
    showLines: true,
    showBox: true,
    center: true,
    size: 30,
    stroke: color(128, 128, 255),
  }) 
});
