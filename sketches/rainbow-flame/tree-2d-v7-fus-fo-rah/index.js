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

let t = 0;

function drawGrid(xCount, yCount, color, weight = 2, offset = 0) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  const xSpeed = 0;//t*xSize;

  // init
  const lines = cache.store( "x-lines", () => {
    const result = []
    for (let x = -1; x < xCount; x++) {
      const xPosition = (xSpeed + (xx + x * xSize));
      result.push(xPosition);
    }
    return result;
  })

  // update
  lines.forEach( ( x, index ) => {
    if (lines[index] <= 0) {
      lines[index] = width
    }

    lines[index] -= 1.5
  })

  // draw
  lines.forEach( xPosition => {

    strokeWeight(weight)
    line(xPosition, 0, xPosition, height);
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

sketch.draw( ( time, center, favoriteColor ) => {
  t = time
  background(0);

  const margin = 50;
  const start = createVector(width/2, margin*3)
  const end = createVector(width/2, height-margin*3)

  const steps = options.get("steps");

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

  let [easingFunctionName, easingFunction] = mappers.circularIndex(time*2, easingFunctions)

  for (let i = 0; i < steps; i++) {
    const stepsProgression = i / steps;
    const polarStepsProgression = map(stepsProgression, 1, 0, -PI/2, PI/2);
    const circularStepsProgression = mappers.circular(stepsProgression, 0, 1, 0, 1);
    // const branchCount = mappers.fn(cos(time+polarStepsProgression/2), -1, 1, 3, 6, easing.easeInSine);
    let branchCount = animation.ease({
        values: [3, 2, 4 , 1],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: time
      })
    branchCount = mappers.circularIndex(time/2, [3, 2, 4, 5, 1])

    for (let b = 0; b < branchCount; b++) {
      const branchProgression = b / steps;

      const position = p5.Vector.lerp(start, end, stepsProgression);
      // const wavesStrength = mappers.fn(stepsProgression, 0, 1, 0, 1, easing.easeInOutBounce);
      // const wavesStrength = mappers.fn(stepsProgression, 0, 1, 0, 1, easing.easeInOutQuad);
      const wavesStrength = mappers.circularIndex(circularStepsProgression*0+time*2, [
        mappers.fn(stepsProgression, 0, 1, 0, 1, easingFunction),
        mappers.fn(stepsProgression, 0, 1, 1, 0, easingFunction),
        mappers.fn(circularStepsProgression, 0, 1, 0, 1, easingFunction),
        mappers.fn(circularStepsProgression, 0, 1, 1, 0, easingFunction),
      ])
      
      const margin = width/3

      const wavesOffset = (
        0
        // b
        +map(b, 0, branchCount, -PI, PI)+PI/(branchCount*2)
        // -time/2
        // +wavesCount
        // +i/120
        // +circularStepsProgression
        // +polarStepsProgression
      );

      position.add(
        // animation.ease({
        //   values: [-width/4, width/4],
        //   duration: 1,
        //   easingFn: easing.easeInQuad,
        //   currentTime: wavesOffset+time
        // })*wavesStrength,
        mappers.fn(cos(wavesOffset), -1, 1, -margin, margin, easing.easeInOutQuad)*wavesStrength,
        // mappers.fn(cos(wavesOffset), -1, 1, -margin, margin, easing.easeOutQuad)*wavesStrength,
        0
      )

      // const linesCount = mappers.circularIndex(time, [
      //   mappers.fn(circularStepsProgression, 0, 1, 1, 2, easing.easeInOutQuad),
      //   mappers.fn(circularStepsProgression, 0, 1, 1, 6, easing.easeInOutQuad),
      // ])
      
      const linesCount = mappers.fn(circularStepsProgression, 0, 1, 1, 4, easing.easeInOutQuad)
      // const linesCount = mappers.fn(stepsProgression, 0, 1, 1, 4, easing.easeInOutQuad)
      // const linesCount = mappers.fn(circularStepsProgression, 0, 1, 1, 4, easing.easeInOutQuad)

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          mappers.fn(circularStepsProgression, 0, 1, 1, 70, easingFunction)
        );

        push();
        translate(position)

        mappers.circularIndex(b+time, [
          // 0,
          // rotate(time*options.get('rotation-speed')),
          rotate(mappers.fn(sin(time+b+i/30), -1, 1, -PI/3, PI/3, easing.easeInOutSine)),
          // rotate(mappers.fn(sin(time+b), -1, 1, -PI/3, PI/3, easing.easeInOutSine))

        ])

        beginShape();
        // strokeWeight(mappers.fn(circularStepsProgression, 0, 1, 10, 30, easingFunction));
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

        stroke(
          colors.rainbow({
            hueOffset: (
              0
            ),
            hueIndex: mappers.fn(sin(stepsProgression), -1, 1, -PI, PI, easing.easeInOutSine)*12,
            opacityFactor
          })
        );

        if (mappers.circularIndex(time*1.5, [1])) {
          vertex(-vector.y, vector.x)
          vertex(vector.x, -vector.y)
        }
        else {
          vertex(vector.x, vector.y)
          vertex(-vector.x, -vector.y)
        }
        endShape();
        pop()
      }
    }
  }
});
