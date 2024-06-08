import { shapes, grid, sketch, colors, converters, debug, animation, string, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 5,
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
    defaultValue: 10,
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
  const size = (width + height)/10;
  const p = 0.01;
  const hueSpeed = time;
  const functionChangeSpeed = time;

  const opacitySpeed = options.get('opacity-speed');
  const startOpacityFactor = options.get("start-opacity-factor");
  const endOpacityFactor = options.get("end-opacity-factor");
  const opacityCount = options.get('opacity-group-count');

  let c = animation.sequence("c", time, [15, 20, 25, 30, 30])*2;

  const easingFunctions = Object.entries( easing );
  // const [ easingFunctionName ] = mappers.circularIndex( functionChangeSpeed/2, easingFunctions);
  let easingFunctionName = ""


  let textPos = createVector( 0, height / 2 - 60 )

  // textPos = createVector( 0, 0 )

  // string.write(`${round(c)}`, textPos.x, textPos.y, {
  //   // showBox: true,
  //   center: true,
  //   size: 48,
  //   stroke: 255,//color(128, 128, 255),
  //   fill: 0//color(64, 64, 360),
  // })

  iterators.angle(0, TAU, TAU / c, (angle, index) => {
    const edge = converters.polar.vector(
      angle,
      size,
      size
    );

    const a = map(cos(time), -1, 1, 1.2, 2)
    const edgeLimit = map(sin(time+index), -1, 1, 1, a)
    const extendedEdge = p5.Vector.lerp(center, edge, edgeLimit);

    iterators.vector(extendedEdge, center, p, (vector, lerpIndex) => {
      const [ name, easingFunction ] = mappers.circularIndex( functionChangeSpeed+angle/10+lerpIndex, easingFunctions);
      easingFunctionName = name;

      const hueIndex = angle*5+lerpIndex*5;
      const hueMaximum = 360//map(sin(time+angle+lerpIndex), -1, 1, 0, 360);
      const hueMinimum = 0//map(cos(time+angle+lerpIndex), -1, 1, 0, 32);

      const opacityFactor = map(
        angle+lerpIndex,
        0,
        1+TAU,
        map(
          sin(-time * opacitySpeed + angle + lerpIndex * opacityCount),
          -1,
          1,
          endOpacityFactor,
          startOpacityFactor
        ),
        endOpacityFactor
      );

      
      stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(cos(hueSpeed-hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor,
        // map(lerpIndex, 0, 1, 0, 255),
        // map(lerpIndex, 0, 1, 255, 0),
        // mappers.fn(lerpIndex, 0, 1, 255, 0, easingFunction)
      ) );

      // gColor = col

      // stroke( color(
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum, easingFunction) / opacityFactor,

      //   // map(cos(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
      //   // map(sin(hueSpeed-hueIndex), -1, 1, 360, 0) / opacityFactor,
      //   // map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
      //   // map(lerpIndex, 0, 1, 0, 255),
      //   // map(lerpIndex, 0, 1, 255, 0),
      //   // mappers.circularMap(lerpIndex, 1, 0, 255),
      //   // mappers.fn(lerpIndex, 0, 1, 255, 0, easingFunction)
      // ) );
      // strokeWeight(map(lerpIndex, 0, 1, 30, 0));
      // strokeWeight(map(lerpIndex, 0, 1, 0, 50));

      // strokeWeight(mappers.fn(lerpIndex, 0, 1, 70, 0, easingFunction));
      strokeWeight(mappers.fn(lerpIndex, 0, 1, 0, 40, easingFunction));
      // strokeWeight(mappers.fn(sin(time+lerpIndex), -1, 1, 70, 10, easingFunction));
      point( vector.x, vector.y );
    })
  } )
}

let min = Math.PI, max = Math.PI;

sketch.draw((time, center) => {
  background(0);

  const columns = animation.sequence("columns", time, [40, 20]);
  const rows = animation.sequence("rows", time/2, [20, 40]);

  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columns
  }
  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / columns);

  noiseDetail(2, 2, 1);
  // noiseSeed(50)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/columns, y/rows+time/8, z) * (TAU*4);
    const cellScale = map(angle, min, max, scale, scale*4, true )
    
    let weight = map(angle, min, max, 1, 20, true )
    weight = map(center.dist(cellVector), 1, width, -10, scale, true )

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    push();
    translate( cellVector.x, cellVector.y );

    strokeWeight(weight);
    stroke(colors.darkBlueYellow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
      // opacityFactor: 1.5,
      // opacityFactor: map(angle, min, max, 3, 1 ),
      opacityFactor: mappers.fn(center.dist(cellVector), 0, width/2, 100, 1, Object.entries( easing )[10][1] )*3
    }))

    // point(0, 0)
    strokeWeight(2);
    noFill();
    circle(0, 0, weight)
    pop();
  })

  push()
  translate(center.x, center.y);
  drawRadialPattern( 22, time );
  pop()
});
