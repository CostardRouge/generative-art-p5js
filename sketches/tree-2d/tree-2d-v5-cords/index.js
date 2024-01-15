import { animation, sketch, converters, string, colors, mappers, options, easing, iterators } from './utils/index.js';

options.add( [
  {
    id: "steps",
    type: 'slider',
    label: 'Steps',
    min: 1,
    max: 1200,
    defaultValue: 400,
    category: 'Shape'
  },
  {
    id: "change-lines-count",
    type: 'switch',
    label: 'Change lines count over time',
    defaultValue: true,
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
    defaultValue: 80,
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
    defaultValue: 3,
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

sketch.setup( );

function easeValue(time, values, functions) {
  return functions.map( fn => (
    animation.ease({
      values,
      duration: 1,
      easingFn: fn,
      currentTime: time
    })
  ))
}

const easingFunctions = Object.values( easing ).slice(0, -9);

function drawGrid(xCount, yCount, color, weight = 2, offset = 0) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  for (let x = 0; x < xCount-1; x++) {

    // const c = noise(x, t*2);

    // if (c > 0.5) {
      iterators.vectors([
        createVector( (xx + x * xSize), 0 ),
        createVector( (xx + x * xSize), height )
      ], ({x, y }) => {
        strokeWeight(6)
        point(x, y)
      }, 0.05)
    // }
    // else {
      strokeWeight(weight)
      line((xx + x * xSize), 0, (xx + x * xSize), height);
    // }
  }

  for (let y = 0; y < yCount-1; y++) {
    strokeWeight(weight)
    line(0, (yy + y * ySize), width, (y * ySize + yy));

    iterators.vectors([
      createVector( 0, (yy + y * ySize) ),
      createVector( width, (y * ySize + yy) )
    ], ({x, y }) => {
      strokeWeight(6)
      point(x, y)
    }, 0.05)
  }
}


// console.log(easingFunctions);

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);

  const bbb = mappers.fn(sin(time), -1, 1, 3, 6, easing.easeInQuad);

  drawGrid(0, bbb, favoriteColor );

  const margin = 50;
  const start = createVector(width/2, margin*3)
  const end = createVector(width/2, height-margin*3)

  // const start = createVector(margin*2, height/2)
  // const end = createVector(width-margin*2, height/2)

  const steps = options.get("steps");

  // string.write("d", 50, 50, {
  //   center: true,
  //   size: 22,
  //   stroke: 255,
  //   fill: favoriteColor,
  //   font: string.fonts.martian
  // })



  for (let i = 0; i < steps; i++) {
    const stepsProgression = i / steps;
    const polarStepsProgression = map(stepsProgression, 1, 0, -PI/2, PI/2);
    const circularStepsProgression = mappers.circular(stepsProgression, 0, 1, 0, 1);
    const easedWaveStrengths = easeValue(circularStepsProgression, [0, 1], easingFunctions);

    const branchCount = mappers.fn(cos(time+polarStepsProgression/2), -1, 1, 3, bbb, easing.easeInSine);

    for (let b = 0; b < branchCount; b++) {
      const branchProgression = b / steps;

      const position = p5.Vector.lerp(start, end, stepsProgression);

      const wavesStrength = map(sin(time+polarStepsProgression), -1, 1, 0, 1);

      // animation.ease({
      //   values: easedWaveStrengths,
      //   duration: 1,
      //   // easingFn: easing.easeInOutExpo,
      //   easingFn: easing.easeInOutBack,
      //   easingFn: easing.easeOutCirc,
      //   // easingFn: easing.easeInOutElastic,
      //   currentTime: (
      //     time*1.5
      //     +b/5
      //     // +stepsProgression*2
      //     // +circularStepsProgression
      //     // +mappers.circular(stepsProgression, 0, 1, 0, 1)
      //   )
      // })
      // const wavesCount = mappers.circular(stepsProgression, 1, 0, 0, 8, easing.easeInOutSine);
      const margin = width/3

      const wavesOffset = (
        // b
        +map(b, 0, branchCount, -PI, PI)
        -time/2
        // +wavesCount
        // +i/120
        // +circularStepsProgression
        // +polarStepsProgression
      );

      const a = margin/2//map(sin(time+b), -1, 1, margin, -margin)

      position.add(
        map(sin(wavesOffset), -1, 1, margin, -margin)*wavesStrength,
        map(cos(wavesOffset), -1, 1, a, -a)*wavesStrength,
        0
      )

      const linesCount = bbb///mappers.fn(circularStepsProgression, 0, 1, 1, 4, easing.easeInOutQuad)

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          60
          // mappers.fn(stepsProgression, 0, 1, 1, options.get('lines-length'), easing.easeInQuad),
          // 1
          // mappers.circular(stepsProgression, 0, 1, 1, options.get('lines-length'), easing.easeInOutSine)
        );

        push();
        translate(position)

        rotate(time*options.get('rotation-speed')+b+i/60*options.get('rotation-count'));
        // rotate(mappers.fn(sin(time+b+i/30), -1, 1, -PI/3, PI/3, easing.easeInOutSine));

        beginShape();
        // strokeWeight(mappers.fn(circularStepsProgression, 0, 1, 10, 30, easing.easeInOutExpo));
        strokeWeight(20);

        const opacitySpeed = options.get('opacity-speed');
        const opacityCount = options.get('opacity-group-count');

        let opacityFactor = mappers.circular(
          stepsProgression,
          0,
          1,
          map(
            sin(opacitySpeed + branchProgression * opacityCount ), -1, 1,
            options.get("start-opacity-factor"),
            1.3
          ),
          1.3
        );
  
        if (options.get('ping-pong-opacity')) {
          opacityFactor = map(
            map(sin(stepsProgression*opacityCount-time*opacitySpeed), -1, 1, -1, 1),
            -1,
            1,
            // map(sin(lerpIndex), -1, 1, 1, 50),
            map(cos(stepsProgression*opacityCount+time*opacitySpeed), -1, 1, 1, 15),
            // 10,
            1
          );
        }

        stroke(
          colors.test({
            hueOffset: (
              0
              +time
              // +branchProgression
              // +circularStepsProgression
              // +b/7
            ),
            // hueIndex: mappers.fn(circularStepsProgression, 1, 0, -PI/2, PI/2, easing.easeInOutCubic_)*8,
            // hueIndex: mappers.fn(sin(time/2+circularStepsProgression+b), -1, 1, -PI/2, PI/2, easing.easeInOutSine)*2,
            // hueIndex: mappers.fn(sin(time/2+circularStepsProgression), -1, 1, -PI, PI, easing.easeInOutSine)*2,
            hueIndex: mappers.fn(sin(circularStepsProgression), -1, 1, -PI, PI, easing.easeInOutSine_),
            // hueIndex: mappers.fn((
            //   noise(branchProgression, stepsProgression)
            // ), 0, 1, -PI/2, PI/2, easing.easeInOutCubic_)*16,
            // hueIndex: map(lineIndex, lineMin, lineMax, -PI/2, PI/2)*4,
            opacityFactor
          })
        );
      
        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);
    
        endShape();
        pop()
      }
    }
  }
});
