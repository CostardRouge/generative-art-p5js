import { shapes, sketch, converters, events, colors, mappers, options } from './utils/index.js';

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
    defaultValue: 2,
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
    defaultValue: 80,
    category: 'Lines'
  },
  {
    id: "ping-pong-opacity",
    type: 'switch',
    label: 'Ping Pong opacity',
    defaultValue: true,
    category: 'Opacity'
  },
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: -2,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 10,
    defaultValue: 2,
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
    id: "rotation-count",
    type: 'slider',
    label: 'Rotation count ?',
    min: -5,
    max: 5,
    defaultValue: 1,
    category: 'Rotation'
  },
  {
    id: "rotation-speed",
    type: 'slider',
    label: 'Rotation speed',
    min: -10,
    max: 10,
    defaultValue: 2,
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
  }
] );

sketch.setup( () => {
  frameRate(25);
  pixelDensity(1);
  },
  {
    width: 1080,
    height: 1920,
  }
);

const fixers = {
  "#8080ff": {
    speed: 0.75,
    index: 0
  },
  // red: {
  //   speed: 1,
  //   index: 0
  // },
  // green: {
  //   speed: 0.5,
  //   index: 0
  // },
  // blue: {
  //   speed: 0.25,
  //   index: 0
  // }
}

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

function drawGrid(xCount, yCount, time) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  strokeWeight(3)

  // stroke(
  //   128,
  //   128,
  //   255,
  //   // map(sin(time), -1, 1, 0, 100)
  // );

  stroke( 255 );

  const offset = 0;
  const xx = xSize * cos(time + xSize )
  const yy = ySize * sin(time + ySize)

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (yy + y * ySize) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

sketch.draw((time) => {
  background(0);

  // drawGrid(1, 1, time/4);
  //drawGrid(2, 2, -time/2 );
  //drawGrid(0, 0, time );

  // translate(width / 2, height / 2);

  // rotate(time*2)

  drawer(
    ( time, index ) => {
      const lerpMin = -PI//map(cos(time), -1, 1, 0.1, -PI);
      const lerpMax = PI//map(sin(time), -1, 1, 0.1, PI);
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index ) => {
      // translate(
      //   converters.polar.get(sin, width/4, lerpIndex, 1),
      //   converters.polar.get(cos, height/3, lerpIndex, 1)
      // );

      // translate(
      //   p5.Vector.fromAngle(lerpIndex, options.get('lines-length')).x,
      //   p5.Vector.fromAngle(lerpIndex, options.get('lines-length')).y
      // );

      translate(
        // width/2,
        map(cos(lerpIndex-time), -1, 1, width/2-300, width/2+300),
        map(lerpIndex, lerpMin, lerpMax,
          map(cos(time+lerpIndex), -1, 1, 150, height-150),
          map(sin(-time+lerpIndex), -1, 1, 150, height-150), true
        ),
        // map(lerpIndex, lerpMin, lerpMax, 150, height-150, true)
      );

      strokeWeight(3)
      stroke(
        128,
        128,
        255
      );

      const shapeIndex = Math.ceil(map(lerpIndex, lerpMin, lerpMax, 0, options.get('quality'), true) );

      for (const fixer in fixers) {
        const { speed, index } = fixers[fixer];

        if (shapeIndex == index) {
          stroke(fixer)
          line(-width, 0, width, 0)
          line(0, -height, 0, height)
          noFill()
          circle(0, 0, 250)
        }

        // fixers[fixer].index = Math.ceil(time*speed)%options.get('quality');
        fixers[fixer].index = Math.ceil(map(sin(time*speed), -1, 1, 0, options.get('quality'), true));
      }

      // if (lerpIndex == lerpMin) {
      //   //stroke('blue')
      //   line(-width, 0, width, 0)
      //   line(0, -height, 0, height)
      //   // string.write("end", 0, 0)
      // }
      // if (lerpIndex+lerpStep > lerpMax ) {
      //   //stroke('red')
      //   line(-width, 0, width, 0)
      //   line(0, -height, 0, height)
      //   // string.write("start", 0, 0)
      // }

      if (shapeIndex > fixers?.["#8080ff"]?.index) {
        rotate(time*options.get('rotation-speed')+lerpIndex*4*options.get('rotation-count'));
      }
      else {
        rotate(time*options.get('rotation-speed')+lerpIndex*options.get('rotation-count'));
      }
    },
    ( lerpIndex, lerpMin, lerpMax, time, index ) => {
      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');

      let opacityFactor = mappers.circularMap(
        lerpIndex,
        // angleMin,
        lerpMax*4,
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
          // map(sin(lerpIndex), -1, 1, 1, 50),
          map(cos(lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 1, 15),
          // 10,
          1
        );
      }
    
      let linesCount = options.get("max-lines-count");

      if (options.get("change-lines-count")) {
        linesCount = map(cos(lerpIndex/2-time*2), 0, 1, 1, options.get("max-lines-count"), true);
      }

      //const weight = map(cos(lerpIndex/2-time*3), 0, 1, 25, options.get("lines-weight"), true);
      const shapeIndex = Math.ceil( map(lerpIndex, lerpMin, lerpMax, 0, options.get('quality'), true) );

      let colorOn = shapeIndex < fixers?.["#8080ff"]?.index;

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          options.get('lines-length'),
          // map(sin(lerpIndex*2+time*2), -1, 1, 1, options.get('lines-length'), true)
          // map(lerpIndex, lerpMin, lerpMax, 1, options.get('lines-length'), true)
        );
        push();
    
        beginShape();
        strokeWeight(options.get("lines-weight"));

      

        const hueSpeed = -time * options.get("hue-speed");

        // //mappers.circularIndex(time, [true, false])
        // const redOn = fixers?.red?.index > shapeIndex;
        // const r = redOn ? map(sin(hueSpeed+lerpIndex*5), -1, 1, 0, 360) : 128;

        // const greenOn = fixers?.green?.index > shapeIndex;
        // const g = greenOn ? map(sin(hueSpeed-lerpIndex*5), -1, 1, 360, 0) : 128

        // const blueOn = fixers?.blue?.index > shapeIndex;
        // const b = blueOn ? map(sin(hueSpeed+lerpIndex*5), -1, 1, 360, 0) : 255

        // const finalColor = color( 
        //   r / opacityFactor,
        //   g / opacityFactor,
        //   b / opacityFactor
        // );

        // stroke( finalColor );

        // if (colorOn) {
        //   opacityFactor *= 1.5
        // }

        if (!colorOn) {
          stroke( color( 
            map(sin(hueSpeed+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
            map(sin(hueSpeed-lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
            map(sin(hueSpeed+lerpIndex*5), -1, 1, 360, 0) / opacityFactor
          ) );
        }
        else {
          stroke( color(
            128 / opacityFactor,
            map(sin(hueSpeed-lerpIndex*5), -1, 1, 128, 0) / opacityFactor*1.5,
            360 / opacityFactor
          ) );
        }

        
      
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
