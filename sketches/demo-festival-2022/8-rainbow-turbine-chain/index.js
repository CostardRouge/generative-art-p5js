import { shapes, sketch, converters, iterators, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 1200,
    defaultValue: 400,
    category: 'Shape'
  },
  {
    id: "change-lines-count",
    type: 'switch',
    label: 'Change lines count over time',
    defaultValue: false,
    category: 'Lines'
  },
  {
    id: "max-lines-count",
    type: 'slider',
    label: 'Max lines count',
    min: 1,
    max: 10,
    step: 0.1,
    defaultValue: 3,
    category: 'Lines'
  },
  {
    id: "lines-length",
    type: 'slider',
    label: 'Lines length',
    min: 1,
    max: 100,
    defaultValue: 75,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 40,
    category: 'Lines'
  },
  {
    id: "ping-pong-opacity",
    type: 'switch',
    label: 'Ping Pong opacity',
    defaultValue: false,
    category: 'Opacity'
  },
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 0,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 10,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 6,
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
    id: "rotation-count",
    type: 'slider',
    label: 'Rotation count ?',
    min: -5,
    max: 5,
    defaultValue: 0,
    category: 'Rotation'
  },
  {
    id: "rotation-speed",
    type: 'slider',
    label: 'Rotation speed',
    min: -10,
    max: 10,
    defaultValue: 1,
    category: 'Rotation'
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
    defaultValue: 400,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 3,
    category: 'Background'
  },
  {
    id: "background-lines-precision",
    type: 'slider',
    min: 0.05,
    max: 1,
    step: 0.05,
    label: 'Lines precision',
    defaultValue: 0.15,
    category: 'Background'
  },
] );

sketch.setup();

function drawer( lerper, positioner, shaper, time, index ) {
  const [lerpMin, lerpMax, lerpStep] = lerper(time, index);
  // noStroke();

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; ) {
    push();
    positioner(lerpIndex, lerpMin, lerpMax, lerpStep, time, index);
    shaper(lerpIndex, lerpMin, lerpMax, time, index);
    pop();

    lerpIndex += lerpStep
  }
}

const drawRadialPattern = (count = 7, time, color) => {
  noFill();
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));

  const center = createVector( 0, 0 );
  const size = (width + height)/2;

  const p = options.get("background-lines-precision")

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle*2,
      size * (cos(time - angle*2)+2)*4,
    );

    beginShape();
    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      vertex( vector.x, vector.y );
    })
    endShape();
  } )
}

let v = 1;

sketch.draw((time) => {
  background(0);

  push()
  translate(width / 2, height / 2);

  drawRadialPattern(
    options.get("background-lines-count"),
    time,
    color( 128, 128, 255, 48)
  );

  pop()

  // translate(width / 2, height / 2);

  drawer(
    ( time, index ) => {
      const lerpMin = 0
      const lerpMax = PI;
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index ) => {
      
      // const size = map(sin(time/4+lerpIndex), -1, 1, -width/2, width/2);
      // const x = converters.polar.get(sin, size, lerpIndex, 1);
      // const y = converters.polar.get(cos, size*2, lerpIndex, 1);
      // translate(
      //   x,
      //   y
      // );

      translate(
        map(sin(lerpIndex-time), -1, 1, width/2-300, width/2+300),
        map(lerpIndex, lerpMin, lerpMax, 150, height-150, true)
      );
      
      rotate(options.get('rotation-speed')+lerpIndex*options.get('rotation-count')*cos(time));
    },
    ( lerpIndex, lerpMin, lerpMax, time, index ) => {
      const hueSpeed = -time * options.get("hue-speed");
      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');

      let opacityFactor = mappers.circularMap(
        lerpIndex,
        lerpMax,
        map(
          sin(-time * opacitySpeed + lerpIndex * opacityCount ), -1, 1,
          options.get("start-opacity-factor"),
          options.get("end-opacity-factor")
        ),
        options.get("end-opacity-factor")
      );

      if (options.get('ping-pong-opacity')) {
        opacityFactor = map(
          map(sin(lerpIndex*opacityCount-time*opacitySpeed), -1, 1, -1, 1),
          -1,
          1,
          map(cos(lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 1, 15),
          1
        );
      }
    
      let linesCount = options.get("max-lines-count");

      if (options.get("change-lines-count")) {
        linesCount = map(cos(lerpIndex/2+time*2), 0, 1, 1, options.get("max-lines-count"), true);
      }

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount

      const switchSpeed = time * 2 + lerpIndex//5;
      const colors = [
        color(
          map(sin(hueSpeed+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
          map(sin(hueSpeed-lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
          map(sin(hueSpeed+lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
          mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        ),
        color(
          90 / opacityFactor,
          map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0) / opacityFactor,
          360 / opacityFactor,
          mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        ),
        // color(
        //   360 / opacityFactor,
        //   90 / opacityFactor,
        //   192 / opacityFactor,
        //   mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        // ),
        // color(
        //   128 / opacityFactor,
        //   128 / opacityFactor,
        //   255 / opacityFactor,
        //   mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        // ),
        // color(
        //   360 / opacityFactor,
        //   32 / opacityFactor,
        //   64 / opacityFactor,
        //   mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        // ),
        // color(
        //   map(cos(hueSpeed-lerpIndex*4), -1, 1, 360, 0)  / opacityFactor,
        //   map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0)  / opacityFactor,
        //   90 / opacityFactor,
        //   mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        // ),
        // color(
        //   map(sin(hueSpeed+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
        //   map(sin(hueSpeed-lerpIndex*1), -1, 1, 360, 0) / opacityFactor,
        //   map(sin(hueSpeed+lerpIndex*1), -1, 1, 360, 0) / opacityFactor,
        //   mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        // ),
      ];

      const ll = mappers.circularIndex(switchSpeed, [0.2, 0.75, 1, 1.5, 2, 1])

      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        v = lerp(v, ll, 0.09)

        const vector = converters.polar.vector(
          lineIndex,
          options.get('lines-length')*v,
          );
        push();
    
        noFill();
        beginShape();
        strokeWeight(options.get("lines-weight"));

        let cc = mappers.circularIndex(switchSpeed, colors)
        cc = mappers.circularIndex(switchSpeed, colors)

        stroke( cc );

        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);
    
        endShape();
        pop()
      }
    },
    time,
    0
  )
});
