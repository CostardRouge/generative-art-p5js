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
// alphabet = "123456".split("")

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
  const rows = 3//columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()

  const positions = cache.store("positions", () => {
    const positions = []

    for (let yy = 0; yy < rows; yy++) {
      const y = lerp(-H/(rows/2), H/(rows/2), yy/(rows-1));
  
      for (let xx = 0; xx < columns; xx++) {
        const x = lerp(-W/(columns/2), W/(columns/2), xx/(columns-1));
  
        positions.push( createVector( x, y ) )
      }
    }

    return positions;
  })//.reverse()

  
  // drawLine(positions, POINTS)
  stroke(96)
  strokeWeight(2)

  beginShape()
  iterators.vectors(positions, ({x, y }) => {
    point(x, y)
  }, 0.05)

  // iterators.vectors([positions[0], positions[positions.length -1]], ({x, y }) => {
  //   point(x, y)
  // }, 0.05)

  endShape()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  const timeSpeed = animation.ease({
    values: [1, 2, 3],
    duration: 1,
    easingFn: easing.easeInOutCubic,
    currentTime: time
  }) 

  mappers.traceVectors(
    3,
    ( progression ) => {
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .3,
            font: string.fonts.martian,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutQuad,
        // currentTime: map(progression, 0, 1, 0, alphabet.length-1)+time,
        currentTime: map(progression, 0, 1, 0, 2)//+time
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
        // easingFn: easing.easeInOutCubic,
        currentTime: (
          +time//+timeSpeed
          +vectorsListProgression*2
          // +vectorIndexProgression/10
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
      stroke(colors.test({
        hueOffset: (
          +time
          //+timeSpeed
        ),
        // opacityFactor: 1.5,
        hueIndex: mappers.fn(noise(chunkIndex, vectorIndexProgression*2), 0, 1, -PI/2, PI/2)*8,
        opacityFactor: mappers.fn(noise(chunkIndex, vectorIndexProgression*2), 0, 1, 5, 1.5),
        // opacityFactor: mappers.fn(sin(chunkIndex*10+time+vectorIndexProgression*50), -1, 1, 5, 1.5),
      }))

      strokeWeight(5)
      endShape()

      // pop()
    },
    false,
    false,
    1
  )

  translate(0, 0, 1)

  stroke(favoriteColor)
  fill(128, 128, 255, 32)
  strokeWeight(4)
  drawLine( end )
  drawLine( start )
  drawLine( middle )

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawPoints( end )
  // drawPoints( start )

  orbitControl()
});



