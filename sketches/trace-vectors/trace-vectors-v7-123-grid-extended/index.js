import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

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
alphabet = "xyz".split("")

function drawLine( points ) {
  beginShape();
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

  // const from = createVector(-W+margin, 0);
  // const to = createVector(W-margin, 0);
  const from = createVector(0, -H+margin, 0);
  const to = createVector(0, H-margin, 0);

  push()
  translate(-W, -H)
  const cols = 3;
  const rows = 3//cols * (height/width);
  drawGrid(cols, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  const c = mappers.circularIndex(time, [11, 33, 67])
  const timeSpeed = animation.ease({
    values: [1, 2, 3],
    duration: 1,
    easingFn: easing.easeInOutCubic,
    currentTime: time
  }) 

  mappers.traceVectors(
    23,
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
        duration: 1+progression/5,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutQuad,
        currentTime: map(progression, 0, 1, 0, alphabet.length-1)//+time
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 

      position.add( vector )
      // position.add( x, 0 )
      position.add( 
        animation.ease({
          values: [-W/1.5, -W/1.5, 0, 0, W/1.5, W/1.5],
          duration: 1,
          easingFn: easing.easeInOutExpo,
          currentTime: (
            +time//+timeSpeed
            +vectorIndexProgression*3+vectorsListProgression//*cos(time+vectorsListProgression)
            // +vectorsListProgression+vectorIndexProgression*cos(time+vectorIndexProgression*2)
            // +vectorIndexProgression*2*cos(time+vectorIndexProgression)
            //+noise(vectorIndexProgression*2+time, vectorsListProgression*2+time)*vectorIndexProgression
            +vectorsListProgression

          )
        }),
        // animation.ease({
        //   values: [-H/1.5, -H/1.5, 0, 0, H/1.5, H/1.5],
        //   duration: 1,
        //   easingFn: easing.easeInOutExpo,
        //   currentTime: (
        //     +time
        //     +vectorIndexProgression/2
        //     // +vectorIndexProgression*2*cos(time+vectorIndexProgression)
        //     // +noise(vectorIndexProgression*2+time, vectorsListProgression*2+time)
        //     +vectorsListProgression*3
        //   )
        // })
      )

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
        opacityFactor: mappers.fn(noise(chunkIndex*20+time, vectorIndexProgression*2), 0, 1, 5, 1.5),
      }))

      strokeWeight(10)
      endShape()

      // pop()
    },
    false,
    true,
    10
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



