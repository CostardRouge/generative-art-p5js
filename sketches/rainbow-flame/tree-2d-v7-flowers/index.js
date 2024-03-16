import { animation, cache, sketch, converters, string, events, colors, mappers, options, easing, iterators } from './utils/index.js';

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

let pixilatedCanvas;

sketch.setup( () => {
  pixilatedCanvas = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );
  pixilatedCanvas.pixelDensity(0.1);

  //pixelDensity(1);
  //noStroke();

  events.register("windowResized", () => {
    pixilatedCanvas.width = sketch?.engine?.canvas?.width;
    pixilatedCanvas.height = sketch?.engine?.canvas?.height;
    pixilatedCanvas.pixelDensity(0.05);
  });
} );

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

function drawSketch( time, center, favoriteColor, steps, givenCanvas) {
  const branchCount = 7//mappers.fn(cos(time), -1, 1, 3, bbb, easing.easeInSine);
  const branchLength = width / 2;

  for (let b = 0; b < branchCount; b++) {
    const branchProgression = b / branchCount;
    const polarBranchProgression = map(branchProgression, 0, 1, 0, TAU);

    const progression = mappers.fn(sin(time+polarBranchProgression), -1, 1, 0, 1, easing.easeInExpo);

    const branchLength_ = animation.ease({
      values: [0.1, 1],
      duration: 1,
      easingFn: easing.easeInOutExpo,
      easingFn: easing.easeInOutElastic,
      currentTime: time+branchProgression/5
    });

    // stroke(favoriteColor)
    // strokeWeight(5)
    // line(center.x, center.y, end.x, end.y)

    for (let i = 0; i < steps; i++) {
      const stepsProgression = i / steps;
      const polarStepsProgression = map(stepsProgression, 1, 0, -PI/2, PI/2);
      const circularStepsProgression = mappers.circular(stepsProgression, 0, 1, 0, 1);

      const branchLength_ = mappers.circularIndex( time+branchProgression-stepsProgression/2, [0.5, 1])

      const end = createVector(
        center.x + sin(polarBranchProgression) * branchLength * branchLength_,
        center.y + cos(polarBranchProgression) * (branchLength * branchLength_) * 1.5
      )

      const position = p5.Vector.lerp(center, end, stepsProgression);
      
      const linesCount = 4//mappers.fn(stepsProgression, 0, 1, 6, PI, easing.easeInQuad)

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const lineProgression = lineIndex / lineMax;
        const vector = converters.polar.vector(
          lineIndex,
          mappers.fn(circularStepsProgression, 0, 1, 1, options.get('lines-length'), easing.easeInOutSine),
          // mappers.fn(stepsProgression, 1, 0, 1, options.get('lines-length'), easing.easeInOutCubic),
          // mappers.fn(stepsProgression, 1, 0, 1, options.get('lines-length'), easing.easeInOutQuad),
        );

        givenCanvas.push();
        givenCanvas.translate(position)

        const rotationAngle =  animation.ease({
          values: [-PI/4, PI/4],
          duration: 1,
          easingFn: easing.easeInOutQuad,
          currentTime: time+b+branchProgression
        });

        givenCanvas.rotate(rotationAngle);

        givenCanvas.rotate(time*options.get('rotation-speed')+b+i/120*options.get('rotation-count'));
        // rotate(time*options.get('rotation-speed')+b+i/60*options.get('rotation-count'));
        // rotate(mappers.fn(sin(time+b+i/30), -1, 1, -PI/3, PI/3, easing.easeInOutSine));

        givenCanvas.beginShape();
        givenCanvas.strokeWeight(mappers.fn(stepsProgression, 1, 0, 10, 30, easing.easeInOutExpo));
        givenCanvas.strokeWeight(mappers.fn(circularStepsProgression, 0, 1, 10, 30, easing.easeInOutExpo));
        // strokeWeight(mappers.fn(stepsProgression, 1, 0, 10, 30, easing.easeInOutQuad));
        // strokeWeight(20);

        const opacitySpeed = options.get('opacity-speed');
        const opacityCount = options.get('opacity-group-count');

        let opacityFactor = mappers.circular(
          stepsProgression,
          0,
          1,
          map(
            sin( opacitySpeed + branchProgression * opacityCount ), -1, 1,
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

        givenCanvas.stroke(
          colors.rainbow({
            hueOffset: (
              0
              // +noise(branchProgression, circularStepsProgression+time)
              // +time
              // +branchProgression
              // +circularStepsProgression/2
              // +b/7
            ),
            // hueIndex: mappers.fn(circularStepsProgression, 1, 0, -PI/2, PI/2, easing.easeInOutCubic_)*8,
            // hueIndex: mappers.fn(sin(time/2+circularStepsProgression+b), -1, 1, -PI/2, PI/2, easing.easeInOutSine)*2,
            // hueIndex: mappers.fn(sin(time/2+circularStepsProgression), -1, 1, -PI, PI, easing.easeInOutSine)*2,
            // hueIndex: mappers.fn(sin(circularStepsProgression), -1, 1, -PI, PI, easing.easeInOutSine_),
            hueIndex: mappers.fn(sin(stepsProgression+progression+noise(branchProgression/10, circularStepsProgression/10)), -1, 1, -PI, PI, easing.easeInOutSine_)*8,
            // hueIndex: mappers.fn((
            //   noise(branchProgression+stepsProgression, stepsProgression)
            // ), 0, 1, -PI/2, PI/2, easing.easeInOutCubic_)*16,
            // hueIndex: map(lineIndex, lineMin, lineMax, -PI/2, PI/2)*4,
            opacityFactor
          })
        );
      
        givenCanvas.vertex(-vector.y, vector.x);
        givenCanvas.vertex(vector.x, -vector.y);

        // vertex(vector.x, vector.y);
        // vertex(-vector.x, -vector.y);
    
        givenCanvas.endShape();
        givenCanvas.pop()
      }
    }
  }
}

sketch.draw( ( time, center, favoriteColor ) => {
  t = time
  background(0);

  // noSmooth();
  pixilatedCanvas.filter(BLUR, 3);
  pixilatedCanvas.background(0, 0, 0, 1);
  image(pixilatedCanvas, 0, 0);

  // drawGrid(5, 0, favoriteColor );

  drawSketch(time, center, favoriteColor, 10, pixilatedCanvas )  
  drawSketch(time, center, favoriteColor, options.get("steps"), window) 
});
