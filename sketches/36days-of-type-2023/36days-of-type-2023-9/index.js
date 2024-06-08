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

// events.register("post-setup", () => {
//   audio.capture.setup(0.2, 512)
//   events.register("post-draw", audio.capture.energy.recordHistory );
// });

sketch.setup( undefined , { type: 'webgl'});

// events.register("post-setup", function () {
//   events.register("engine-on-key-typed", function () {
//     console.log(events.handle("engine-get-key-typed"));
//     if (!events.handle("engine-get-key-typed").includes(" ")) {
//       return;
//     }
//   });
// });

function drawGridCell(_x, _y, w, h, columns, rows, drawer) {
  const xSize = w / columns;
  const ySize = h / rows;

  for (let x = 0; x <= columns; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

sketch.draw( (time, center) => {
  background(0);

  //const audioEnergyAverage = audio.capture.energy.average("raw");

  const columns = 50;
  const rows = columns*height/width;
  const cellSize = width/columns;

  // rotateX(PI/4)

  // stroke(255)
  // strokeWeight(1)

  // const cubes = cache.store("cubes", () => {
  //   return [
  //     new Cube({
  //       position: createVector(0, 0),
  //       size: cellSize,
  //       columns, rows
  //     })
  //   ]
  // });

  // push()
  // translate(-center.x, -center.y)
  // drawGrid(columns, rows, -time)
  // pop()

  // cubes.forEach( cube => cube.update(time) );
  // cubes.forEach( cube => cube.draw() );
  
  // return orbitControl();

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2),
    rows,
    columns,
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

  const rotationMax = PI*2
  const generalAnimationTime = time/2

  const {
    x: rX,
    y: rY,
    //z: rZ
  } = animation.ease({
    values: [
      createVector(), 
      createVector(0, rotationMax),
      createVector(rotationMax, rotationMax),
      createVector(rotationMax),
    ],
    currentTime: generalAnimationTime,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInOutElastic,
    // easingFn: easing.easeInOutCirc,
  })

  // rotateX(rX)
  // rotateY(rY)


  // rotateY(
  //   animation.ease({
  //     values: [ 0, PI*2 ],
  //     currentTime: generalAnimationTime,
  //     duration: 1,
  //     // lerpFn: p5.Vector.lerp,
  //     easingFn: easing.easeInOutElastic,
  //   })
  // )

  // const finalPoints = alphaPoints

  alphaPoints.forEach( ( { layers, position, xy: { x, y } }, index ) => {
    
    const switchIndex = generalAnimationTime*2+(
      +index/alphaPoints.length/5
      +position.x/columns/100
      +position.y/rows/100
    )
    
    const layer = mappers.circularIndex(
      switchIndex,
      // generalAnimationTime+1/2,
      // 0,
      layers
    )

    // const layer = animation.ease({
    //   values: layers,
    //   currentTime: generalAnimationTime+1/2,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo
    // })


    if (!layer) {
      return;
    }


    const hue = noise(
      position.x/columns/2 + (
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
      hueIndex: map(hue, 0, 1, -PI, PI)*2,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    const w = cellSize//-2
    const h = cellSize//-2

    let n = noise(position.x/columns, position.y/rows + time)*2;
    // n = noise(position.y/rows/20 + time/2)*2;

    // n = mappers.circularIndex(
    //   (
    //     generalAnimationTime*2+(
    //       // +index/alphaPoints.length/5
    //       +position.x/columns/20
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
    //       +position.x/columns/20
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
        generalAnimationTime*2+(
          0
          +index/alphaPoints.length/5
          // // +position.x/columns/20
          // +position.y/rows/20
        )
      ),
      [ 1, 2, 4 ]
    )

    //n = 3

    let d = cellSize//*n

    d = animation.ease({
      values: [ 5, 15, 25, 35 ],
      currentTime: (
        generalAnimationTime*2+(
          0
          // +(x/columns)/5
          // +(y/rows)/5
          // -index/alphaPoints.length/5
          // +position.x/columns/10
          // +position.y/rows/10
        )
      ),
      duration: 1,
      easingFn: easing.easeInOutExpo,
      easingFn: easing.easeInOutSine,
      easingFn: easing.easeInOutElastic,
    });

  //   d *= mappers.circularIndex( (
  //     generalAnimationTime*2+(
  //       +index/alphaPoints.length/5
  //       +position.x/columns/50
  //       +position.y/rows/50
  //     )
  //   ),
  //   [ 0, 5, 10, 15, 20 ]
  // );

  // d = mappers.fn(
  //   noise(position.x/columns/10+position.y/rows/10+time),
  //   0, 1,
  //   20, 500,
  //   easing.easeInOutQuad,
  // )

  // const xx = floor(map(x, 0, columns - 1, 0, audio.capture.bins -1)/3)
  // const yy = floor(map(y, 0, rows - 1, 0, audio.capture.historyBufferSize))
  // const line = audio.capture.history?.spectrum[yy];

  // // console.log(x, columns,  x/columns, audio.capture.bins-1, xx);
  // // console.log(y, rows,  y/rows, audio.capture.historyBufferSize-1, yy);

  // d = (line?.[xx]) //*cellSize

  // console.log(audioEnergyAverage);

  // d = 500*audioEnergyAverage//map(audioEnergyAverage, 0, 1, 10, 100)

  // console.log(audio.capture.historyBufferSize);

  // d = 10

    const gap = mappers.circularIndex( (
      generalAnimationTime*2+(
        +index/alphaPoints.length/20
        +position.x/columns/50
        +position.y/rows/50
      )
    ),
    [ 1.5, 2, 4, 8 ].reverse()
  );

  // const gap = animation.ease({
  //     values: [ 1.5, 2, 4, 8 ].reverse(),
  //     currentTime: (
  //       generalAnimationTime*2+(
  //         +index/alphaPoints.length/20
  //         +position.x/columns/50
  //         +position.y/rows/50
  //       )
  //     ),
  //     duration: 1,
  //     easingFn: easing.easeInOutExpo,
  //     // easingFn: easing.easeInOutSine,
  //   });

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
    
        const fillAlpha = 150
    
        fill( red, green, blue, fillAlpha )
        stroke( red, green, blue )
        box(w/gap, h/gap , -d*cellSize)
    
        pop()
      }
    )
  } );

  orbitControl();
});
