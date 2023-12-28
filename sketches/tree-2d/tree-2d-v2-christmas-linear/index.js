import { shapes, sketch, converters, events, colors, mappers, options, easing, iterators } from './utils/index.js';

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

sketch.setup( );

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

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);

  drawGrid(2, 4, favoriteColor );

  const t = map(sin(time*4), -1, 1, 0, 1,easing.easeInOutExpo)

  const margin = 50;
  const start = createVector(width/2, margin*2)
  const end = createVector(width/2, height-margin*4)

  const steps = options.get("steps");

  for (let i = 0; i < steps; i++) {
    const stepsProgression = i / steps;

    const branchCount = 6//mappers.fn(sin(time+stepsProgression), -1, 1, 0, 6, easing.easeInSine);

    for (let b = 0; b < branchCount; b++) {
      const branchProgression = b / steps;

      const position = p5.Vector.lerp(start, end, stepsProgression);

      const wavesOffset = (
        b
        -time
        +stepsProgression
        +i/120
      );
      const wavesStrength = mappers.fn(stepsProgression, 0, 1, 0, 1, easing.easeInOutElast);
      const wavesCount = mappers.fn(stepsProgression, 1, 0, 0, 2, easing.easeInOutQuart);
      const polarProgression = -map(stepsProgression, 1, 0, -PI/2, PI/2)*wavesCount;
      const margin = width/3

      position.add(
        map(sin(polarProgression+wavesOffset), -1, 1, margin, -margin)*wavesStrength,
        //-map(cos(polarProgression+wavesOffset+b), -1, 1, margin/3, -margin/3)*wavesStrength,
        0
      )

      const linesCount = mappers.fn(stepsProgression, 0, 1, 1, 3, easing.easeInOutQuad)

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          mappers.fn(stepsProgression, 0, 1, 1, options.get('lines-length'), easing.easeInQuad)
        );

        push();
        translate(position)

        //rotate(time*options.get('rotation-speed')+b+i/30*options.get('rotation-count'));
        rotate(mappers.fn(sin(time+b+i/30), -1, 1, -PI/3, PI/3, easing.easeInOutSine));

        beginShape();
        strokeWeight(mappers.fn(stepsProgression, 0, 1, 10, 30, easing.easeInOutQuad));

        const opacitySpeed = options.get('opacity-speed');
        const opacityCount = options.get('opacity-group-count');

        let opacityFactor = mappers.circular(
          stepsProgression,
          0,
          1,
          map(
            sin(opacitySpeed + branchProgression * opacityCount ), -1, 1,
            options.get("start-opacity-factor"),
            options.get("end-opacity-factor")
          ),
          options.get("end-opacity-factor")
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
          colors.rainbow({
            hueOffset: (
              time
              +branchProgression
              // +stepsProgression
              // +b/7
            ),
            hueIndex: mappers.fn(stepsProgression, 0, 1, -PI/2, PI/2, easing.easeInOutCubic_)*8,
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
