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
// alphabet = "ab".split("")
alphabet = "123".split("")
alphabet = "ABC".split("")
alphabet = "intp".split("")
// alphabet = "0123456789".split("")

function drawPoints( points ) {
  for (let index = 0; index < points.length; index++) {
    const { x, y } = points[index];

    point(x, y );
  }
}

function square(time) {
  const period = 1;
  const normalizedTime = time % period;
  return normalizedTime < period / 2 ? 1 : 0;
}

function drawLine( points ) {
  beginShape();
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape()
}

function easeOscillation(x, amplitude) {
  return fns.map( fn => (
    animation.ease({
        values: [-amplitude, amplitude],
        duration: 1,
        easingFn: fn,
        currentTime: x
      })
  ))
}

const fns = [easing.easeInOutExpo, square, easing.easeInOutSine, square, undefined];

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

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2;

  const letterSize = W/1.9;
  const margin = letterSize/2;

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);
  // const from = createVector(0, -H+margin, 0);
  // const to = createVector(0, H-margin, 0);



  // const firstLetter = alphabet[Math.round(letterStartIndex)];
  // const lastLetter = alphabet[Math.round(letterEndIndex)];

  const letterStartIndex = time;
  const letterEndIndex = time+1;
  const firstLetter = alphabet[Math.round(letterStartIndex) % alphabet.length];
  const lastLetter = alphabet[Math.round(letterEndIndex) % alphabet.length];

  const HUDmargin = 50;
  const topLeft = createVector(-W+HUDmargin, -H+HUDmargin)
  const topRight = createVector(W-HUDmargin, -H+HUDmargin)

  // push()
  // textAlign(LEFT);
  // string.write(firstLetter, -W+HUDmargin, H-HUDmargin, {
  //   // showBox: true,
  //   // showLines: true,
  //   // center: true,
  //   size: 36,
  //   // stroke: 255,
  //   // strokeWeight: 1,
  //   fill: color( 128, 128, 255 ),
  //   font: string.fonts.martian
  // })

  // textAlign(RIGHT);
  // string.write(lastLetter, W-HUDmargin, H-HUDmargin, {
  //   // showBox: true,
  //   // showLines: true,
  //   // center: true,
  //   size: 36,
  //   // stroke: 255,
  //   // strokeWeight: 1,
  //   fill: color( 128, 128, 255 ),
  //   font: string.fonts.martian
  // })
  // pop()

  //const qualityLine = mappers.fn(sin(time), -1, 1, .25, .75, easing.easeInOutQuad);
  // const qualityLine = mappers.fn(mouseX, 0, width, 0, 1, easing.easeInOutQuad);
  //const x = map(qualityLine, 0, 1, -W+margin, W-margin);

  //line(x, -H, x, H);

  push()
  translate(-W, -H)
  const cols = 4;
  const rows = 2//cols * (height/width);
  drawGrid(cols, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];

  let sampleFactor;

  mappers.traceVectors(
    alphabet.length*6,
    ( progression ) => {
      sampleFactor  = animation.ease({
        values: [.1, .075, .065, .05, .045, .03, .025], 
        values: [.1, .075, .05, .025, 0.15], 
        duration: 1,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuad,
        // easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCubic,
        // currentTime: progression+time,
        currentTime: time,
      }) 
    
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            // text: qualityLine > progression ? text.toUpperCase() : text,
            size: letterSize,
            // size: qualityLine > progression ? letterSize : letterSize/2,
            position: center,
            sampleFactor: .1,
            // sampleFactor: "0.0"+lastLetter,
            // sampleFactor: mappers.circularIndex(time*10, [.1, .075, .065, .05, .045, .03, .025]),
            // sampleFactor: mappers.circularIndex(qualityLine*4, [.1, .075, .05, .025]),
            // sampleFactor: mappers.fn(sin(time), -1, 1, .1, .025, easing.easeInOutExpo),
            // sampleFactor,
            // sampleFactor: mappers.fn(qualityLine, 0, 1, .1, .025),
            // sampleFactor: qualityLine > progression ? .01 : .1,
            font: string.fonts.martian,
            // font: qualityLine > progression ? string.fonts.martian : string.fonts.sans,
          })
        )),
        duration: 1,
        // duration: mappers.fn(cos(time*2  -progression*2), -1, 1, -2, 2, easing.easeInOutElastic),
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuad,
        // easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutCirc,
        // currentTime: progression+time,
        // currentTime: time,
        // currentTime: easeArrayIndexes({
        //   range: 1,
        //   speed: 0,
        //   length: alphabet.length,
        //   progression,
        //   easingFn: easing.easeInOutExpo
        // }),
        currentTime: mappers.fn(progression, 0, 1, 0, alphabet.length-1, easing.easeInOutCirc),
        // currentTime: map(progression, 0, 1, 0, alphabet.length-1)//+time
      }) 
    },
    () => {
      push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 

      const z = animation.ease({
        values: easeOscillation(vectorsListProgression*3, H/5),
        values: [-H/2, -H/2, 0, 0, H/2, H/2],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: time+vectorIndexProgression/8+vectorsListProgression*4
      })

      position.add( vector )
      //position.add( 0, z )
      // position.add( 0, 0, (
      //   mappers.fn(cos(map(vectorsListProgression, 0, 1, -PI/2, PI/2, true)*alphabet.length*2), -1, 1, 0, 100, easing.easeInOutExpo)
      // ) )

      if (vectorsListProgression==1 ) {
        end.push( position)

        strokeWeight(4)
        // point( position.x, position.y, position.z )
      }

      if (vectorsListProgression==0) {
        start.push( position )

        strokeWeight(4)
        // point( position.x, position.y, position.z )
      }

      vertex( position.x, position.y, position.z )
    },
    (vectorIndexProgression, chunkIndex ) => {
      stroke(colors.rainbow({
        hueOffset: (
          +sampleFactor
        ),
        // hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*8,
        // hueIndex: mappers.fn(noise(vectorIndexProgression, chunkIndex), 0, 1, -PI/2, PI/2)*6,
        hueIndex: mappers.fn(noise(vectorIndexProgression*4, chunkIndex), 0, 1, -PI/2, PI/2)*6,
        opacityFactor: 1.5,
        // opacityFactor: map(sin(time*2+vectorIndexProgression*8), -1, 1, 4, 1.5),
        // opacityFactor: map(sin(time*2+time+chunkIndex+vectorIndexProgression*2), -1, 1, 6, 1),
      }))

      // rotateX(PI/8+time+chunkIndex)
      // rotateX(map(chunkIndex, 0, 1, 0, PI/2))
      //translate(0, map(cos(time+map(chunkIndex, 0, 1, -PI/2, PI/2)), -1, 1, -50, 50))
      // rotateY(PI/2)
      // stroke(favoriteColor)
      strokeWeight(3)
      endShape()

      pop()
    }
  )


  translate(0, 0, 1)

  stroke(favoriteColor)
  // fill(favoriteColor)
  strokeWeight(4)
  // drawLine( end )
  // drawLine( start )

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawPoints( end )
  // drawPoints( start )

  orbitControl()
});



