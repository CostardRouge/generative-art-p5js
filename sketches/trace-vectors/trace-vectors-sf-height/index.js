import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

function drawGrid(xCount, yCount, color, weight = 2, offset = 0, skipX, skipY) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  for (let x = 0; x < xCount-1; x++) {
    if (!skipX.includes(x)) {
      line((xx + x * xSize), 0, (xx + x * xSize), height);
    }
  }

  for (let y = 0; y < yCount-1; y++) {
    if (!skipY.includes(y)) {
      line(0, (yy + y * ySize), width, (y * ySize + yy));
    }
  }
}

sketch.setup( undefined, { type: "webgl" } );

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
// alphabet = "abc".split("")
alphabet = "0123456789".split("")
// alphabet = "V-S".split("")

function drawLine( points, type = POINTS ) {
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

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);

  const letterRange = 2;
  const letterSliderSpeed = time/2;
  
  const letterStartIndex = animation.ease({
    values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index),
    duration: 1,
    currentTime: letterSliderSpeed,
    easingFn: easing.easeInOutSine,
    // easingFn: easing.easeInOutExpo
  });

  const letterEndIndex = animation.ease({
    values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index + letterRange),
    duration: 1,
    currentTime: letterSliderSpeed,
    easingFn: easing.easeInOutSine,
    // easingFn: easing.easeInOutExpo

  });

  const firstLetter = alphabet[Math.round(letterStartIndex)];
  const lastLetter = alphabet[Math.round(letterEndIndex)];
  const middleLetter = alphabet[Math.round(letterStartIndex+1)];

  // const letterStartIndex = time;
  // const letterEndIndex = time+1;
  // const firstLetter = alphabet[Math.round(letterStartIndex) % alphabet.length];
  // const lastLetter = alphabet[Math.round(letterEndIndex) % alphabet.length];

  const HUDmargin = 50;
  // const topLeft = createVector(-W+HUDmargin, -H+HUDmargin)
  // const topRight = createVector(W-HUDmargin, -H+HUDmargin)

  const textStyle = {
    size: 36,
    fill: color( 128, 128, 255 ),
    font: string.fonts.martian
  }

  push()
  textAlign(LEFT);
  string.write(firstLetter, -W+HUDmargin, H-HUDmargin, textStyle)

  textAlign(CENTER);
  string.write(middleLetter, 0, H-HUDmargin, textStyle)

  textAlign(RIGHT);
  string.write(lastLetter, W-HUDmargin, H-HUDmargin,textStyle)
  pop()

  push()
  translate(-W, -H)
  const cols = 5;
  const rows = 4;
  drawGrid(cols, rows, favoriteColor, 0.5, 0, [ 1, 2], [])
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  mappers.traceVectors(
    23,
    ( progression ) => {
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .4,
            font: string.fonts.martian,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutCubic,
        easingFn: easing.easeInOutQuad,
        currentTime: map(progression, 0, 1, letterStartIndex, letterEndIndex),
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 

      const z = animation.ease({
        values: [-H/2, -H/2, 0, 0, H/2, H/2],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: time/2+vectorIndexProgression/2+vectorsListProgression
      })

      position.add( vector )
      // position.add( 0, z )
      // position.add( 0, 0, z  )

      if (vectorsListProgression==1 ) {
        end.push( position)
      }

      if (vectorsListProgression==0) {
        start.push( position )
      }

      if (vectorsListProgression==0.5) {
        // middle.push( position )
      }

      vertex( position.x, position.y, position.z )
    },
    ( vectorIndexProgression, chunkIndex ) => {
      stroke(colors.test({
        hueOffset: (
          +time
          // +vectorIndexProgression
          // *chunkIndex
          // +
        ),
        // hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*3,
        hueIndex: mappers.fn(noise(letterStartIndex/9, letterEndIndex/9, chunkIndex/2+vectorIndexProgression*2), 0, 1, -PI/2, PI/2)*8,
        // hueIndex: mappers.fn(noise(letterStartIndex/9, letterEndIndex/9, chunkIndex), 0, 1, -PI/2, PI/2)*6,
        // hueIndex: mappers.fn(noise(letterStartIndex/9, letterEndIndex/9, diff/H+chunkIndex/2), 0, 1, -PI/2, PI/2)*6,
        // opacityFactor: 1.5,
        // opacityFactor: map(sin(time*2+vectorIndexProgression*8+chunkIndex), -1, 1, 4, 1.5),
        // opacityFactor: map(sin(time*2+vectorIndexProgression*8+chunkIndex), -1, 1, 4, 1.5),
        // opacityFactor: map(sin(time*2+chunkIndex*10), -1, 1, 10, 1.5),
        opacityFactor: mappers.fn(noise(chunkIndex*2+time, vectorIndexProgression*2), 0, 1, 4, 1.5),

      }))

      // rotateX(PI/2+time+vectorIndexProgression*2)
      // rotateY(PI/2)
      // stroke(favoriteColor)
      strokeWeight(4)
      endShape()

      // pop()
    }
  )


  translate(0, 0, 1)

  stroke(favoriteColor);
  // fill(128, 128, 255)

  ;[
    start,
    end,
    middle
  ].forEach( points => {
    drawLine( points, POINTS ) 
  })

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawPoints( end )
  // drawPoints( start )

  orbitControl()
});



