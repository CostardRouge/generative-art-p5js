import { sketch, audio, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(
    "text-points",
    fontFamily,
    text,
    size,
    sampleFactor,
    simplifyThreshold
  )

  return cache.store( textPointsCacheKey, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return ([
      textPoints.map( ({x, y}) => {
        const testPointVector = createVector(x, y);
  
        testPointVector.add((position.x-xCenter),(position.y-yCenter))
  
        return testPointVector;
      }),
      [
        xMin-xCenter,
        yMin-yCenter,
        xMax-xMin,
        yMax-yMin,
      ],
      textPointsCacheKey
    ])
  });
}

function getAlphaFromMask({ position: { x, y }, maskPoints, distance = 0.015}) {
  const normalizedPosition = createVector(
    map(x, -width/2, width/2, 0, 1),
    map(y, -height/2, height/2, 0, 1)
  );

  return maskPoints.reduce( ( result, pointPosition ) => {
    if (true === result) {
      return result;
    }

    const normalizedPointPosition = createVector(
      map(pointPosition.x, -width /2, width/2, 0, 1),
      map(pointPosition.y, -height /2, height/2, 0, 1)
    );

    const d = normalizedPointPosition.dist(normalizedPosition);

    return Math.max(
      result,
      d > 0 && d < distance
    );
  }, 0);
}

function createGridAlphaPoints(gridOptions, textPointsMatrix) {
  return cache.store( `alpha-points-matrix`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, ( position, xy ) => {
      const alphaLayers = [];

      for ( const [ points ] of textPointsMatrix ) {
        const alpha = getAlphaFromMask({
          position,
          maskPoints: points
        })
    
        alphaLayers.push( alpha );
      }

      alphaPoints.push( {
        xy,
        position,
        layers: alphaLayers
      } );
    });

    return alphaPoints;
  });
}

events.register("post-setup", () => {
  audio.capture.setup(0, 512)
  events.register("post-draw", audio.capture.energy.recordHistory );
});

sketch.setup( undefined , { type: 'webgl'});

// events.register("post-setup", function () {
//   events.register("engine-on-key-typed", function () {
//     console.log(events.handle("engine-get-key-typed"));
//     if (!events.handle("engine-get-key-typed").includes(" ")) {
//       return;
//     }
//   });
// });

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

sketch.draw( (time, center) => {
  background(0);

  const cols = 30;
  const rows = cols*height/width;
  const cellSize = width/cols;

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2),
    rows,
    cols,
    centered: true
  }

  const fonts = [
    string.fonts.martian,
    // string.fonts.tilt,
    string.fonts.multicoloure,
    string.fonts.openSans,
    string.fonts.sans,
    string.fonts.serif
  ]

  const textPointsMatrix = fonts.map( font => (
    getTextPoints({
      text: "9",
      position: createVector(0, 0),
      size,
      font,
      sampleFactor,
      simplifyThreshold
    })
  ))

  const alphaPoints = createGridAlphaPoints(
    gridOptions,
    textPointsMatrix
  )

  const generalAnimationTime = time/2

  alphaPoints.forEach( ( { layers, position, xy: { x, y } }, index ) => {
    
    const switchIndex = generalAnimationTime*2+(
      +index/alphaPoints.length/5
      +position.x/cols/100
      +position.y/rows/100
    )
    
    const layer = mappers.circularIndex(
      // switchIndex,
      // generalAnimationTime+1/2,
      0,
      layers
    )


    if (!layer) {
      return;
    }

    // const layer = animation.ease({
    //   values: layers,
    //   currentTime: generalAnimationTime+1/2,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo
    // })

    const hue = noise(
      position.x/cols/2 + (
        0
        +generalAnimationTime
        //+map(sin(time), -1, 1, 0, 1)
      ),
      position.y/rows/2 + (
        0
        //+map(cos(time), -1, 1, 0, 1)
      )
    )

    const tint = colors.rainbow({
      hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*3,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    const w = cellSize//-2
    const h = cellSize//-2

    let n = noise(position.x/cols, position.y/rows + time)*2;
    // n = noise(position.y/rows/20 + time/2)*2;

    // n = mappers.circularIndex(
    //   (
    //     generalAnimationTime*2+(
    //       // +index/alphaPoints.length/5
    //       +position.x/cols/20
    //       +position.y/rows/20
    //     )
    //   ),
    //   [ 0, 1, 2, 4 ]
    // )

    // n = animation.ease({
    //   values: [ 0, 1, 2, 4 ],
    //   currentTime: (
    //     generalAnimationTime*2+(
    //       // +index/alphaPoints.length/5
    //       +position.x/cols/20
    //       +position.y/rows/20
    //     )
    //   ),
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    // });

    n = animation.ease({
      values: [ 1 ],
      currentTime: switchIndex,
      duration: 1,
      easingFn: easing.easeInOutSine,
    });

    n = mappers.circularIndex(
      (
        generalAnimationTime*3+(
          0
          +index/alphaPoints.length/5
          + position.x/cols/20
          + position.y/rows/20
        )
      ),
      [ 1, 2, 4, 3 ]
    )

    let d = cellSize//*n

    // d *= animation.ease({
    //   values: [ 5, 10, 15, 20 ],
    //   currentTime: (
    //     generalAnimationTime*2+(
    //       -index/alphaPoints.length/5
    //       +position.x/cols/10
    //       +position.y/rows/10
    //     )
    //   ),
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutSine,
    // });

    d *= mappers.circularIndex( (
      generalAnimationTime*2+(
        +index/alphaPoints.length/5
        +position.x/cols/50
        +position.y/rows/50
      )
    ),
    [ 5, 10, 15, 20 ]
  );

  d = mappers.fn(
    noise(position.x/cols/10+position.y/rows/10+time/2),
    // noise(rotatedX/rows/5, rotatedY/rows/5),
    0, 1,
    20, 500,
    easing.easeInOutBack,
    easing.easeInOutExpo,
    easing.easeInOutCirc,
    easing.easeInOutQuad,
  )

  // const xx = floor(map(x, 0, cols - 1, 0, audio.capture.bins -1))
  // const yy = floor(map(position.y, 0, rows - 1, 0, 59))

  const xx = ~~(x/cols)*(audio.capture.bins-1);
  const yy = ~~(y/rows)*(audio.capture.historyBufferSize-1);
  const line = audio.capture.history?.spectrum[yy];

  // console.log(x, cols,  x/cols, audio.capture.bins-1, xx);
  // console.log(y, rows,  y/rows, audio.capture.historyBufferSize-1, yy);

  d = (line?.[xx]) *cellSize

  // console.log(audio.capture.historyBufferSize);


  // d = 10

  // console.log(audio.capture.history);
    // const weight = map(energy, 0, 255, 1, cellSize );
  // d *= 15;
    // n = 0

  //   const gap = mappers.circularIndex( (
  //     generalAnimationTime*2+(
  //       +index/alphaPoints.length/20
  //       +position.x/cols/50
  //       +position.y/rows/50
  //     )
  //   ),
  //   [ 1.5, 2, 4, 8 ].reverse()
  // );

  // n = 2

  const gap = 1.5
  animation.ease({
      values: [ 1.5, 2, 4, 8 ].reverse(),
      currentTime: (
        generalAnimationTime*2+(
          +index/alphaPoints.length/20
          +position.x/cols/50
          +position.y/rows/50
        )
      ),
      duration: 1,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutSine,
    });

    drawGridCell(
      position.x,
      position.y,
      w,
      h,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        // rect(x, y, w, h )
        push()
        translate( x, y )
    
        const fillAlpha = 220//
        animation.ease({
          values: [ 240, 0 ],
          currentTime: switchIndex,
          duration: 1,
          easingFn: easing.easeInOutExpo,
        });
    
        fill( red, green, blue, fillAlpha )
        stroke( red, green, blue, 200 )
        box(w/gap, h/gap , -d)
    
        pop()
      }
    )
  } );

  orbitControl();
});
