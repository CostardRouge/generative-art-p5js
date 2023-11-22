import { midi, events, iterators, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

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

sketch.setup( undefined, { type: "webgl" } );

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
alphabet = "123456789".split("") 

let gt = 0;

function drawLine( points, type ) {
  beginShape(type);
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape(CLOSE)
}

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2;

  const letterSize = W/1.5//1.25;
  const margin = letterSize/2;

  push()
  translate(-W, -H)
  const columns = 3;
  const rows = 3///columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()

  const cases = cache.store("cases", () => {
    const cases = []

    for (let yy = 0; yy < rows; yy++) {
      const y = lerp(-H/(rows/2), H/(rows/2), yy/(rows-1));

      for (let xx = 0; xx < columns; xx++) {
        const x = lerp(-W/(columns/2), W/(columns/2), xx/(columns-1));
  
        cases.push( createVector( x, y ) )
      }
    }

    return cases;
  })

  push()
  cases.forEach( ({x, y}, index) => {
    string.write(index+1, x, y, {
      center: true,
      size: 14,
      stroke: 255,
      fill: favoriteColor,
      font: string.fonts.martian
    })
  })

  pop()

  const positions = cache.store("positions", () => {
     // return positions//.sort( ({x, y}, {x: xx, y: yy}) => x-xx - y-yy);

    // return [
    //   cases[0],
    //   cases[2],
    //   cases[6],
    //   cases[8],
    // ]

    // return [
    //   cases[1],
    //   cases[2],
    //   cases[6],
    //   cases[8],
    // ]

    return [
      cases[1],
      cases[5],
      cases[7],
      cases[3],
    ]
  })
  stroke(96)
  strokeWeight(2)
  // drawLine(positions, 2)

  // beginShape()
  // iterators.vectors(positions, ({x, y }) => {
  //   point(x, y)
  // }, 0.05)

  // iterators.vectors([positions[0], positions[positions.length -1]], ({x, y }) => {
  //   point(x, y)
  // }, 0.05)

  endShape()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  gt += mappers.circularIndex(time, [0, 0, .0075, .015])

  mappers.traceVectors(
    5,
    ( progression ) => {
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .5,
            font: string.fonts.martian,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutSine,
        easingFn: easing.easeInOutQuad,
        currentTime: map(progression, 0, 1, 0, 4)//+time
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = animation.ease({
        values: positions,
        duration: 1,
        lerpFn: p5.Vector.lerp,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCirc,
        easingFn: easing.easeInOutCubic,
        currentTime: (
          +time
          +gt
          +vectorsListProgression*2
        )
      })

      position.add( vector )

      if (vectorsListProgression==1 ) {
        end.push( position)
      }

      if (vectorsListProgression==0) {
        start.push( position )
      }

      if (vectorsListProgression==0.5) {
        middle.push( position )
      }

      vertex( position.x, position.y, position.z )
    },
    ( vectorIndexProgression, chunkIndex = 1 ) => {
      stroke(colors.rainbow({
        hueOffset: (
          +time
        ),
        // opacityFactor: 1.5,
        hueIndex: mappers.fn(noise(chunkIndex, vectorIndexProgression*3), 0, 1, -PI/2, PI/2)*16,
        opacityFactor: mappers.fn(noise(chunkIndex, vectorIndexProgression*2), 0, 1, 4, 1.5),
        // opacityFactor: mappers.fn(sin(chunkIndex*0+time+vectorIndexProgression*10), -1, 1, 5, 1.5),
      }))

      strokeWeight(5)
      endShape()

      // pop()
    },
    0,
    false,
    1
  )

  translate(0, 0, 1)

  stroke(favoriteColor)
  fill(128, 128, 255, 32)
  strokeWeight(2)
  drawLine( end, POINTS )
  drawLine( start, POINTS )
  drawLine( middle, POINTS )

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawPoints( end )
  // drawPoints( start )

  orbitControl()
});



