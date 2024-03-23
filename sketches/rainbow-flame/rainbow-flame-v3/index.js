import { animation, cache, sketch, converters, string, colors, mappers, options, easing, iterators } from './utils/index.js';

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

function drawGrid(xCount, yCount, color, weight = 2, offset = 0) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  const xSpeed = 0;//t*xSize;

  // init
  const xLines = cache.store( "x-lines", () => {
    const result = []
    for (let x = -1; x < xCount; x++) {
      const xPosition = (xSpeed + (xx + x * xSize));
      result.push(xPosition);
    }
    return result;
  })

  // update
  xLines.forEach( ( x, index ) => {
    if (xLines[index] <= 0) {
      xLines[index] = width
    }
    else if (xLines[index] > width) {
      xLines[index] = 0
    }

    xLines[index] += 1.5
  })

  // draw
  xLines.forEach( xPosition => {
    strokeWeight(weight)
    line(xPosition, 0, xPosition, height);
  })


  const ySpeed = 0;//t*xSize;

  // init
  const yLines = cache.store( "y-lines", () => {
    const result = []
    for (let y = -1; y < yCount; y++) {
      const yPosition = (ySpeed + (yy + y * ySize));
      result.push(yPosition);
    }
    return result;
  })

  // update
  yLines.forEach( ( y, index ) => {
    if (yLines[index] <= 0) {
      yLines[index] = height
    }
    else if (yLines[index] > height) {
      yLines[index] = 0
    }

    yLines[index] += 1.5
  })

  // draw
  yLines.forEach( yPosition => {
    strokeWeight(weight)
    line(0, yPosition, width, yPosition);
  })

  // for (let x = -1; x < xCount; x++) {

  //   // const xPosition = (xSpeed + (xx + x * xSize) + xW) % 0;
  //   const lines = ((xx + x * xSize) + width - xSpeed) % width;
  //   // iterators.vectors([
  //   //   createVector( xPosition, 0 ),
  //   //   createVector( xPosition, height )
  //   // ], ({x, y }) => {
  //   //   strokeWeight(6)
  //   //   point(x, y)
  //   // }, 0.05)

  //   strokeWeight(weight)
  //   line(xPosition, 0, xPosition, height);
  // }

  // for (let y = 0; y < yCount-1; y++) {
  //   strokeWeight(weight)
  //   line(0, (yy + y * ySize), width, (y * ySize + yy));

  //   iterators.vectors([
  //     createVector( 0, (yy + y * ySize) ),
  //     createVector( width, (y * ySize + yy) )
  //   ], ({x, y }) => {
  //     strokeWeight(6)
  //     point(x, y)
  //   }, 0.05)
  // }
}

const easingFunctions = Object.entries(easing).filter( ([name, fn]) => (
  !name.includes(["Elastic"]) &&
  !name.includes(["Bounce"]) &&
  !name.includes(["Back"]) &&
  !name.includes(["easeInBack"]) &&
  !name.includes(["easeOutQuart"]) &&
  !name.includes(["easeInOutExpo"]) &&
  !name.includes(["easeOutExpo"]) &&
  !name.includes(["Circ"])
))

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);

  const margin = 100;
  const start = createVector(width/2, margin)
  const end = createVector(width/2, height-margin)

  drawGrid(2, 4, favoriteColor );

  const steps = options.get("steps");

  // let [easingFunctionName, easingFunction] = mappers.circularIndex(time*2, easingFunctions)

  for (let i = 0; i < steps; i++) {
    const stepsProgression = i / steps;
    const polarStepsProgression = map(stepsProgression, 1, 0, -PI/2, PI/2);
    const circularStepsProgression = mappers.circular(stepsProgression, 0, 1, 0, 1, easing.easeInOutQuad );
    // const branchCount = mappers.fn(cos(time+polarStepsProgression/2), -1, 1, 3, 6, easing.easeInSine);
    let branchCount = animation.ease({
        values: [3, 2, 4 , 1],
        // values: [2,4],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: time
      })

    let [easingFunctionName, easingFunction] = mappers.circularIndex(3, easingFunctions)

    //easingFunction = easing.easeInOutExpo

    branchCount = 1//mappers.circularIndex(time/2, [3, 2, 4, 5, 1])

    for (let b = 0; b < branchCount; b++) {
      const branchProgression = b / steps;
      const position = p5.Vector.lerp(start, end, stepsProgression);

      let W = width/6
      let margin = 0//mappers.fn(stepsProgression, -1, 1, -W, W, easing.easeInOutCubic);

      margin = animation.ease({
        values: [-W, W],
        duration: 1,
        easingFn: easing.easeInOutCubic,
        currentTime: time/2+stepsProgression
      });

      position.add(
        mappers.fn(cos(time), -1, 1, -margin, margin, easing.easeInOutExpo_),
        // mappers.fn(sin(time+circularStepsProgression), -1, 1, -margin, margin, easing.easeInOutExpo ),
        // mappers.fn(stepsProgression, 0, 1, -margin, margin, easing.easeInOutExpo ),
        // mappers.fn(cos(circularStepsProgression), -1, 1, -margin, margin, easing.easeInOutExpo ),
      )
      // const linesCount = mappers.circularIndex(time, [
      //   mappers.fn(circularStepsProgression, 0, 1, 1, 2, easing.easeInOutQuad),
      //   mappers.fn(circularStepsProgression, 0, 1, 1, 6, easing.easeInOutQuad),
      // ])

      let linesCount = 4
      
      // linesCount = animation.ease({
      //   values: [5, , 2, 1, 3],
      //   duration: 1,
      //   easingFn: easing.easeInOutQuad,
      //   currentTime: time+polarStepsProgression
      // })
      
      // linesCount = mappers.fn(circularStepsProgression, 0, 1, 1, 3, easing.easeInOutQuad)
      // linesCount = mappers.fn(stepsProgression, 0, 1, 1, 4, easing.easeInOutQuad)
      // linesCount = mappers.fn(circularStepsProgression, 0, 1, 1, 4, easing.easeInOutQuad)

      const lineMin = 0;
      const lineMax = PI/2;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const lineProgression = lineIndex / lineMax;

        const gapWidth = 240
        
        // animation.ease({
        //   values: [100, 240],
        //   duration: 1,
        //   easingFn: easing.easeInOutExpo,
        //   currentTime: time/2+lineProgression
        // })
        const vector = converters.polar.vector(
          lineIndex,
          mappers.fn(circularStepsProgression, 0, 1, 1, gapWidth, easing.easeInOutQuad_),
          // mappers.fn(circularStepsProgression, 0, 1, 1, gapWidth, easing.easeInOutQuad),
          // mappers.fn(sin(circularStepsProgression), 1, -1, 1, gapWidth, easing.easeInOutSine)
        );

        push();
        translate(position)

        mappers.circularIndex(time, [
          // rotate(time/2*options.get('rotation-speed')),
          rotate(mappers.fn(cos(time+stepsProgression), -1, 1, -PI, PI, easing.easeInOutExpo)/2),
          // rotate(mappers.fn(cos(stepsProgression), -1, 1, -rotationAngle, rotationAngle, easing.easeInOutElastic)),
          // rotate(mappers.fn(sin(time+circularStepsProgression*2), -1, 1, -PI/3, PI/3, easing.easeInOutSine)),
          // rotate(mappers.fn(sin(time+stepsProgression), -1, 1, -PI/3, PI/3, easing.easeInOutCubic))
        ])

        // rotate(PI/3)

        beginShape();

        const weight = 30;
        strokeWeight(weight);

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

        stroke(
          colors.rainbow({
            hueOffset: (
              0
              //+ lineProgression/2
              + stepsProgression *2
              //+ (lineIndex/lineStep)/4
            ),
            // hueIndex: mappers.fn(sin(time/4+stepsProgression+lineIndex/8), -1, 1, -PI, PI,)*8,
            hueIndex: mappers.fn(cos(time+circularStepsProgression+lineProgression/3.5), -1, 1, -PI, PI, easing.easeInOutSine_)*4,
            // hueIndex: mappers.fn((
            //   noise(stepsProgression, stepsProgression+time/3)
            // ), 0, 1, -PI/2, PI/2, easing.easeInOutSine)*16,
            opacityFactor
          })
        );

        // opacityFactor = map(
        //   stepsProgression,
        //   0,
        //   5,
        //   mappers.fn(
        //     sin(-time * (lineProgression % 2 === 0 ? -1 : 1) * 10 + (stepsProgression) * 30),
        //     -1,
        //     1,
        //     1,
        //     5
        //   ),
        //   1
        // );

        // stroke(
        //   map(sin(lineProgression + time), -1, 1, 0, 360) / opacityFactor,
        //   map(cos(lineProgression + time), -1, 1, 0, 255) / opacityFactor,
        //   map(sin(lineProgression + time), -1, 1, 255, 0) / opacityFactor,
        //   map(lineProgression + stepsProgression, 0, 4, 0, 255)
        // );

        const xMin = 0//+weight;
        const xMax = width - weight;

        const yMin = 0//+weight;
        const yMax = height - weight;

        const cX = constrain(vector.x, xMin, xMax)
        const cY = constrain(vector.y, yMin, yMax)
        
        // if (mappers.circularIndex(time+stepsProgression, [true, false])) {
          vertex(-cY, cX)
          vertex(cX, -cY)
        // }
        // else {
          // vertex(vector.x, vector.y)
          // vertex(-vector.x, -vector.y)
        // }

        noFill()
        endShape();
        pop()
      }
    }
  }
});
