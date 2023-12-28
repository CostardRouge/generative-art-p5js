import { grid, options, iterators, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

options.add( [
  // GRID
  {
    id: "grid-show",
    type: 'switch',
    label: 'Show grid lines',
    defaultValue: true,
    category: 'Grid'
  },
  {
    id: "grid-show-char",
    type: 'switch',
    label: 'Show character in cell',
    defaultValue: true,
    category: 'Grid'
  },
  {
    id: "grid-rows-count",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 27,
    step: 1,
    defaultValue: 3,
    category: 'Grid'
  },
  {
    id: "grid-columns-count",
    type: 'slider',
    label: 'Columns',
    min: 1,
    max: 27,
    step: 1,
    defaultValue: 3,
    category: 'Grid'
  },
  {
    id: "grid-proportional-rows-count",
    type: 'switch',
    label: 'Proportional rows count (to screen height)',
    defaultValue: false,
    category: 'Grid'
  },

  // TRAJECTORY
  {
    id: "trajectory-random",
    type: 'switch',
    label: 'Random',
    defaultValue: false,
    category: 'Trajectory'
  },
  {
    id: "trajectory-lines-weight",
    type: 'slider',
    label: 'Lines weight (0 to disable)',
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 1,
    category: 'Trajectory'
  },
  {
    id: "trajectory-points-weight",
    type: 'slider',
    label: 'Points weight (0 to disable)',
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 3,
    category: 'Trajectory'
  },
  {
    id: "trajectory-points-interval",
    type: 'slider',
    label: 'Points interval',
    min: 0.01,
    max: 0.5,
    step: 0.001,
    defaultValue: 0.05,
    category: 'Trajectory'
  },

  // TRACED LINES
  {
    id: "traced-lines-extremity-dots-weight",
    type: 'slider',
    label: 'Extremity dots weight (0 to disable)',
    min: 0,
    max: 20,
    step: 1,
    defaultValue: 4,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-steps",
    type: 'slider',
    label: 'Steps',
    min: 2,
    max: 255,
    step: 1,
    defaultValue: 33,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-weight",
    type: 'slider',
    label: 'Stroke weight',
    min: 1,
    max: 20,
    step: 0.1,
    defaultValue: 4,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-smooth",
    type: 'switch',
    label: '"Smooth"',
    defaultValue: true,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-use-chunks",
    type: 'switch',
    label: 'Use chunks',
    defaultValue: false,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-chunks-count",
    type: 'slider',
    label: 'Chunks count',
    min: 1,
    max: 100,
    step: 1,
    defaultValue: 1,
    category: 'Traced lines'
  },

  // TEXT
  {
    id: "text-sample-factor",
    type: 'slider',
    label: 'Text sample factor',
    min: 0.01,
    max: 1,
    step: 0.05,
    defaultValue: 0.1,
    category: 'Text'
  },
] );

function drawGrid(xCount, yCount, color, weight = 2, offset = 0) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  for (let x = 0; x < xCount-1; x++) {
    line((xx + x * xSize), 0, (xx + x * xSize), height);   
  }

  for (let y = 0; y < yCount-1; y++) {
    line(0, (yy + y * ySize), width, (y * ySize + yy));
  }
}

function cross( {x, y} , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

function traceLine(start, end, range, progression, rangePositionDrawer) {
  const [_rangeStart, _rangeMin, _rangeEnd] = range;

  const rangeStart = p5.Vector.lerp(start, end, _rangeStart);
  const rangeMin = p5.Vector.lerp(start, end, _rangeMin);
  const rangeEnd = p5.Vector.lerp(start, end, _rangeEnd);

  const final = p5.Vector.lerp(rangeMin, rangeEnd, progression)

  rangePositionDrawer?.(rangeMin, _rangeMin)
  rangePositionDrawer?.(rangeEnd, _rangeEnd)
  rangePositionDrawer?.(rangeStart, _rangeStart)

  line(rangeStart.x, rangeStart.y, final.x, final.y)
}

function drawLine( points, type ) {
  beginShape(type);
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape(CLOSE)
}

sketch.setup( undefined, { type: "webgl" } );

const text = "123456789".split("")

let gt = 0;

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);

  const W = width/2;
  const H = height/2;

  const cols = options.get("grid-columns-count");
  const rows = options.get("grid-proportional-rows-count") ? cols * (height/width) : options.get("grid-rows-count");

  const {
    draw: drawTextGrid,
    vectors: positions
  } = grid.prepare({ rows, cols });

  if (options.get("grid-show")) {
    push()
    stroke(255, 0, 0)
    strokeWeight(1)
    translate(-W, -H)
    
    drawTextGrid( ({ x, y }, _, i) => {
      // const tint = colors.rainbow({
      //   hueOffset: time+i/(cols*rows),
      //   hueIndex: map(i, 0, rows*cols, -PI/2, PI/2)
      // })

      // stroke(tint)
      // point(x, y)
    })

    pop()
  }

  const randomTrajectory = options.get("trajectory-random");

  const trajectory = cache.store(`trajectory-${text}-${randomTrajectory}`, () => (
    [...positions].sort( () => .5 - Math.random() )
  ));


  const trajectoryLinesWeight = options.get("trajectory-lines-weight");
  
  if (trajectoryLinesWeight) {
  // console.log(trajectory);

    push()
    stroke(255, 0, 0)
    translate(-W, -H)
    
    trajectory.forEach( cell => {
      point(cell.x, cell.y)
    })

    pop()

    // stroke(255)
    // strokeWeight(trajectoryLinesWeight)
    // drawLine(positions, POINTS)


    // beginShape()

    // drawTextGrid( ({ x, y }, _, i) => {

    //   vertex(x, y)
    // })

    // noFill()
    // stroke(255, 0, 0)
    // endShape()

  }

  return;

  const directionSpeed = 0.025;
  const direction = mappers.fn(sin(time/2), -1, 1, -directionSpeed, directionSpeed, easing.easeInOutElastic);
  const directionNormalized = map(direction, -directionSpeed, directionSpeed, 0, 1);

  gt += (
    direction
  );

  push()
  strokeWeight(1)
  const redishColor = color(255, 64, 64);
  const directionColor = lerpColor(
    favoriteColor,
    redishColor,
    map(abs(direction), 0, directionSpeed, 0, 1)
  )
  const _start = createVector(-width/2+50, height/2-50)
  const _end = createVector(width/2-50, height/2-50)

  stroke(directionColor)
  traceLine(
    _start,
    _end,
    [.5, 0, 1],
    directionNormalized,
    ( position, id ) => cross(position, 20)
  )

  stroke(255)
  iterators.vectors([_start, _end], ({x, y }) => {
    point(x, y)
  }, 0.1)
  pop()


  
  const letterSize = W/1.5

  

  

  const commonCacheKey = `${columns}-${rows}-${width}-${height}`;

  const cases = cache.store(`cases-${text}-${commonCacheKey}`, () => {
    const result = [];
    let i = 0;

    for (let yy = 0; yy < rows; yy++) {
      const y = lerp(-H/(rows/2), H/(rows/2), yy/(rows-1));

      for (let xx = 0; xx < columns; xx++) {
        const x = lerp(-W/(columns/2), W/(columns/2), xx/(columns-1));

        const letterIndex = i++;
        const letter = text[ letterIndex % text.length ];
  
        result.push({
          letter,
          letterIndex,
          position: createVector( x, y )
        })
      }
    }

    return result;
  });

  if (options.get("grid-show-char")) {
    push()
    cases.forEach( ( { position, letter } ) => {
      const { x, y } = position;
  
      string.write(letter, x, y, {
        center: true,
        size: 20,
        stroke: 255,
        fill: directionColor,
        font: string.fonts.martian
      })
    } );
    pop()
  }

  const randomLetterOrder = cache.store(`order-${commonCacheKey}-${text}-${randomTrajectory}`, () => (
    cases.map( ( { letterIndex } ) => letterIndex ).sort( () => .5 - Math.random() )
  ));

  // const randomLetterOrder = [6,1,8,3,5]

  const randomPositions = cache.store(`positions-${commonCacheKey}-${randomTrajectory}`, () => (
    randomTrajectory ?
      randomLetterOrder.map( ( letterIndex ) => cases[ letterIndex ].position ) :
      randomLetterOrder.map( ( _, index ) => cases[ index ].position )
  ))

  stroke(96)

  const trajectoryPointsWeight = options.get("trajectory-points-weight");
  
  if (trajectoryPointsWeight) {
    const trajectoryPointsInterval = options.get("trajectory-points-interval");

    strokeWeight(trajectoryPointsWeight)
    
    beginShape()
    iterators.vectors(randomPositions, ({x, y }) => {
      point(x, y)
    }, trajectoryPointsInterval)

    iterators.vectors([randomPositions[0], randomPositions[randomPositions.length -1]], ({x, y }) => {
      point(x, y)
    }, trajectoryPointsInterval)

    endShape()
  }

  translate(0, 0, 1)

  const start = [];
  const end = [];

  mappers.traceVectors(
    options.get("traced-lines-steps"),
    ( progression ) => (
      animation.ease({
        values: (
          randomTrajectory ?
            randomLetterOrder.map( letterIndex => (
              string.getTextPoints({
                text: text[ letterIndex % text.length ],
                size: letterSize,
                position: center,
                sampleFactor: options.get("text-sample-factor"),
                font: string.fonts.martian,
              })
            ) ) :
          text.map( letter => (
            string.getTextPoints({
              text: letter,
              size: letterSize,
              position: center,
              sampleFactor: options.get("text-sample-factor"),
              font: string.fonts.martian,
            })
          ) )
        ),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuad, 
        currentTime: progression+gt,
        // currentTime: progression+gt
      })
    ),
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const positionTime = (
        +gt
        +vectorsListProgression
        // +vectorIndexProgression/9
      )
      const position = animation.ease({
        values: randomPositions,
        duration: 1,
        lerpFn: p5.Vector.lerp,
        // easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutBack,
        // easingFn: easing.easeInOutSine,
        currentTime: positionTime
      })

      position.add( vector )

      if (vectorsListProgression==1 ) {
        end.push( position)
      }

      if (vectorsListProgression==0) {
        start.push( position )
      }

      vertex( position.x, position.y, position.z )
    },
    ( vectorIndexProgression, chunkIndex = 1 ) => {

      const chunkColor = colors.rainbow({
        hueOffset: (
          // +gt
          0
        ),
        // opacityFactor: 1.5,
        hueIndex: mappers.fn(noise(chunkIndex, vectorIndexProgression*2), 0, 1, -PI/2, PI/2)*16,
        opacityFactor: mappers.fn(noise(chunkIndex, vectorIndexProgression), 0, 1, 2.5, 1.5),
        // opacityFactor: mappers.fn(sin(chunkIndex*0+time+vectorIndexProgression*10), -1, 1, 5, 1.5),
      })

      const _chunkColor = lerpColor(
        chunkColor,
        color(255, 16, 16),
        map(abs(direction), 0, directionSpeed, 0, 1)
      )

      stroke(_chunkColor)

      strokeWeight(options.get("traced-lines-weight"))
      // rotateZ(PI/6)
      noFill()
      endShape()

      // pop()
    },
    options.get("traced-lines-smooth"),
    options.get("traced-lines-use-chunks"),
    options.get("traced-lines-chunks-count")
  )

  if (options.get("traced-lines-extremity-dots-weight")) {
    translate(0, 0, 1)

    stroke(directionColor)
    fill(128, 128, 255, 32)
    strokeWeight(options.get("traced-lines-extremity-dots-weight"))
    drawLine( end, POINTS )
    drawLine( start, POINTS )  
  }
  
  orbitControl()
});



