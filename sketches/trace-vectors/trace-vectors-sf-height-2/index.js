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

function traceVectors(count, vectorsGenerator, onStart, onTrace, onEnd) {
  const vectorsList = Array( count ).fill(undefined).map( ( _, index ) => (
    vectorsGenerator( index / (count-1) )
  ));

  // const longestVectorsLength = Math.max( ...vectorsList.map( vectors => vectors.length ) );

  const { smooth: longestVectorsLength } = mappers.valuer(`longest-vectors-length`, Math.max( ...vectorsList.map( vectors => vectors.length )))

  for (let index = 0; index < longestVectorsLength; index++) {
    const vectorIndexProgression = index / (longestVectorsLength-1);

    onStart( vectorIndexProgression );
    
    for (let j = 0; j < vectorsList.length; j++) {
      const vectors = vectorsList[j];
      const vectorsListProgression = j/(vectorsList.length-1);

      onTrace( vectors[index % vectors.length], vectorsListProgression, vectorIndexProgression );
      // onTrace( vectors[index], vectorsListProgression, vectorIndexProgression );
    }

    onEnd( vectorIndexProgression );
  }

  return vectorsList;
}

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
// alphabet = "ab".split("")

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

function triangle(time) {
  const period = 1;
  const normalizedTime = time % period;
  const halfPeriod = period / 2;

  return Math.abs(normalizedTime - halfPeriod) / halfPeriod;
}

function sawtooth(t, period = 1.0) {
  t = t % period;
  return (2 * t / period) - 1;
}

function drawLine( points ) {
  beginShape(POINTS);
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape()
}

function squareOscillationEasing(time, duration) {
  // Ensure time is within the duration
  time = time % duration;

  // Calculate the midpoint of the duration
  const midpoint = duration / 2;

  // Use a square wave to determine the output
  if (time < midpoint) {
    return 0; // First half of the oscillation, value is 0
  } else {
    return 1; // Second half of the oscillation, value is 1
  }
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

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2;

  const letterSize = W/1.5//1.25;
  const margin = letterSize/2;

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);

  const letterRange = 1;
  const letterSliderSpeed = time/2;
  
  const letterStartIndex = animation.ease({
    values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index),
    duration: 1,
    currentTime: letterSliderSpeed,
    easingFn: easing.easeInOutSine
  });

  const letterEndIndex = animation.ease({
    values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index + letterRange),
    duration: 1,
    currentTime: letterSliderSpeed,
    easingFn: easing.easeInOutSine
  });

  const firstLetter = alphabet[Math.round(letterStartIndex)];
  const lastLetter = alphabet[Math.round(letterEndIndex)];

  // const letterStartIndex = time;
  // const letterEndIndex = time+1;
  // const firstLetter = alphabet[Math.round(letterStartIndex) % alphabet.length];
  // const lastLetter = alphabet[Math.round(letterEndIndex) % alphabet.length];

  const HUDmargin = 50;
  const topLeft = createVector(-W+HUDmargin, -H+HUDmargin)
  const topRight = createVector(W-HUDmargin, -H+HUDmargin)

  push()
  textAlign(LEFT);
  string.write(firstLetter, -W+HUDmargin, H-HUDmargin, {
    // showBox: true,
    // showLines: true,
    // center: true,
    size: 36,
    // stroke: 255,
    // strokeWeight: 1,
    fill: color( 128, 128, 255 ),
    font: string.fonts.martian
  })

  textAlign(RIGHT);
  string.write(lastLetter, W-HUDmargin, H-HUDmargin, {
    // showBox: true,
    // showLines: true,
    // center: true,
    size: 36,
    // stroke: 255,
    // strokeWeight: 1,
    fill: color( 128, 128, 255 ),
    font: string.fonts.martian
  })
  pop()

  //const qualityLine = mappers.fn(sin(time), -1, 1, .25, .75, easing.easeInOutQuad);
  // const qualityLine = mappers.fn(mouseX, 0, width, 0, 1, easing.easeInOutQuad);
  //const x = map(qualityLine, 0, 1, -W+margin, W-margin);

  //line(x, -H, x, H);

  push()
  translate(-W, -H)
  const cols = 2;
  const rows = 4//cols * (height/width);
  drawGrid(cols, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];

  traceVectors(
    alphabet.length,
    ( progression ) => {
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
            // sampleFactor: mappers.circularIndex(time+progression/2, [.1, .05, .01, .25]),
            // sampleFactor: mappers.circularIndex(qualityLine*4, [.1, .075, .05, .025]),
            sampleFactor: mappers.fn(sin(time), -1, 1, .1, .025),
            // sampleFactor: mappers.fn(qualityLine, 0, 1, .1, .025),
            // sampleFactor: qualityLine > progression ? .01 : .1,
            font: string.fonts.martian,
            // font: qualityLine > progression ? string.fonts.martian : string.fonts.sans,
          })
        )),
        duration: 1,//-1/3*cos(time),
        // duration: mappers.fn(cos(time*2  -progression*2), -1, 1, -2, 2, easing.easeInOutElastic),
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuad,
        // easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCubic,
        // currentTime: progression+time,
        // currentTime: time,
        currentTime: map(progression, 0, 1, letterStartIndex, letterEndIndex),
        // currentTime: map(progression, 0, 1, 0, alphabet.length-1)//+time
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 

      const z = animation.ease({
        values: easeOscillation(vectorsListProgression*3, H/5),
        values: [-H/2, -H/2, 0, 0, H/2, H/2],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: time+vectorIndexProgression/2+vectorsListProgression
      })

      position.add( vector )
      position.add( 0, z )

      if (vectorsListProgression==1 ) {
        end.push( position)

        strokeWeight(7)
        point( position.x, position.y, position.z )
      }

      if (vectorsListProgression==0) {
        start.push( position )

        strokeWeight(7)
        point( position.x, position.y, position.z )
      }

      vertex( position.x, position.y, position.z )
    },
    vectorIndexProgression => {
      stroke(colors.rainbow({
        hueOffset: (
          +time
          +0
        ),
        hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*3,
        // hueIndex: mappers.circularPolar(letterStartIndex, 0, alphabet.length-1, -PI/2, PI/2),
        // hueIndex: mappers.fn(noise(firstLetter+lastLetter, vectorIndexProgression*4), 0, 1, -PI/2, PI/2)*6,
        hueIndex: mappers.fn(noise(letterStartIndex/9, letterEndIndex/9, vectorIndexProgression*4), 0, 1, -PI/2, PI/2)*6,
        opacityFactor: 1.5,
        opacityFactor: map(sin(time*2+vectorIndexProgression*8), -1, 1, 4, 1.5),
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



