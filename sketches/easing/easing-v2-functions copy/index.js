import { shapes, sketch, converters, debug, animation, string, grid, mappers, iterators, options, easing } from './utils/index.js';

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

  // string.write("easing", 0, -size-64, {
  //   // showBox: true,
  //   center: true,
  //   size: 255,
  //   stroke: 255,
  //   strokeWeight: 10,
  //   fill: 0,
  //   font: string.fonts.sans
  // })

  iterators.angle(0, TAU, TAU / 22, (angle, index) => {
    const edge = converters.polar.vector(
      angle+time/10,//*cos(time/2)+sin(time/2),
      size,
      size
    );

    iterators.vector(edge, center, 1 / 150, (vector, lerpIndex) => {      
      const [ easingFunctionName, easingFunction ] = mappers.circularIndex( functionChangeSpeed+angle+lerpIndex, easingFunctions);
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

      strokeWeight(mappers.fn(lerpIndex, 0, 1, 70, 3, easingFunction));
      strokeWeight(mappers.fn(lerpIndex, 0, 1, 3, 70, easingFunction));
      point( vector.x, vector.y );
    })
  } )

  // string.write(name, 0, size+64/2 , {
  //   // showBox: true,
  //   center: true,
  //   size: 64,
  //   stroke: 0,
  //   strokeWeight: 10,
  //   fill: 255,
  //   // font: string.fonts.sans
  // })
}

sketch.draw((time) => {
  background(0);
  push();
  translate(width / 2, height / 2);
  drawRadialPattern( 22, time );
  push();

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols
  }
  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / cols);

  // noiseDetail(2, 4, 1);
  // noiseSeed()

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/cols, y/rows+time/8, z) * (TAU*4);
    // const vector = p5.Vector.fromAngle(angle);
    const cellScale = map(angle, min, max, scale, scale*4, true )
    const weight = 20
    0//map(angle, min, max, 1, 20, true )

    min = Math.min(min, angle);
    max = Math.max(max, angle);

  

    push();
    translate( cellVector.x, cellVector.y );
    // point( 0, 0);

    noFill()
    strokeWeight(1)
    stroke('red')
    circle(0, 0, scale)

    // push()

    strokeWeight(10);
    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      opacityFactor: 1.5,
      opacityFactor: map(angle, min, max, 3, 1 )
    }))

    // beginShape(LINES)
    iterators.vector(
      createVector(0, 0),
      createVector(cellScale, 0),
      1/2, (position, index) => {
        translate(position.x, position.y)

        const _angle = noise((position.x)/cols, (position.y)/rows+time/8, z) * (PI);
        const vector = p5.Vector.fromAngle(_angle)//.limit(35)

        rotate(vector.heading())

        point(0, 0)
      }
    )

    pop();
  })


});
