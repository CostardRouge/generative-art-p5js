import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

function easeArrayIndexes({
  range = 1,
  speed,
  length,
  progression,
  easingFn = easing.easeInOutExpo
}) {
  
  const arrayStartIndex = animation.ease({
    values: Array(length-range).fill(undefined).map((_, index) => index),
    duration: 1,
    currentTime: speed,
    easingFn
  });

  const arrayEndIndex = animation.ease({
    values: Array(length-range).fill(undefined).map((_, index) => index + range),
    duration: 1,
    currentTime: speed,
    easingFn
  });

  return mappers.fn(progression, 0, 1, arrayStartIndex, arrayEndIndex, easingFn);
}

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
alphabet = "abc123xyz".split("")
alphabet = "abc".split("")

function drawLine( points ) {
  // beginShape(POINTS);
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
  const from = createVector(0, -H/1.5, 0);
  const to = createVector(0, H/1.5, 0);

  push()
  translate(-W, -H)
  const columns = 3;
  const rows = 3//columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  mappers.traceVectors(
    77,
    ( progression ) => {
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .15,
            font: string.fonts.martian,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutExpo,
        currentTime: map(progression, 0, 1, 0, alphabet.length-1),
        // currentTime: map(progression, 0, 1, 0, 2)+time,
        // currentTime: easeArrayIndexes({
        //   range: 3,
        //   speed: time/4+progression,
        //   length: 9,
        //   progression: progression,
        //   easingFn: easing.easeInOutExpo
        // })
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
        // 0,
        animation.ease({
          values: [-W/1.5, -W/1.5, 0, 0, W/1.5, W/1.5],
          // values: [-H/1.5, -H/1.5, 0, 0, H/1.5, H/1.5],
          duration: 1,
          easingFn: easing.easeInOutBack,
          // easingFn: easing.easeInOutElastic,
          currentTime: (
            +time
            // +vectorIndexProgression+vectorsListProgression*cos(time+vectorsListProgression*2)
            +noise(vectorIndexProgression*10)
            -vectorsListProgression
          )
        }),
        // animation.ease({
        //   values: [-H/1.5, -H/1.5, 0, 0, H/1.5, H/1.5],
        //   duration: 1,
        //   easingFn: easing.easeInOutExpo,
        //   currentTime: (
        //     +time
        //     // +vectorIndexProgression/2
        //     // +vectorIndexProgression*2*cos(time+vectorIndexProgression)
        //     // +noise(vectorIndexProgression*2+time, vectorsListProgression*2+time)
        //     +vectorsListProgression
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
    (vectorIndexProgression, chunkIndex ) => {
      const chunkOffset = chunkIndex/5;
      stroke(colors.test({
        hueOffset: (
          // +sampleFactor
          // +chunkOffset
          //+time/2*chunkOffset*vectorOffset
          //+chunkOffset*vectorOffset*2
          +animation.ease({
            values: [1, 5],
            duration: 1,
            easingFn: easing.easeInOutExpo,
            currentTime: (
              +time/2
              //+chunkIndex//+vectorIndexProgression
            )
          })
        ),
        opacityFactor: 1.5,
        hueIndex: mappers.fn(sin(chunkOffset+vectorIndexProgression+time/4), -1, 1, -PI/2, PI/2)*16,
        opacityFactor: map(cos(vectorIndexProgression+chunkIndex*5+time), -1, 1, 5, 1.5),
      }))

      // rotateX(PI/2+0+vectorIndexProgression*2)
      // rotateY(PI/2)
      // stroke(favoriteColor)
      strokeWeight(3)
      endShape()

      // pop()
    }
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



