import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

const easingFunctions = Object.entries( easing );

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

sketch.setup( undefined, { type: "webgl" } );


const alphabet = "123".split("")

function drawLine( points, type = POINTS, sample = 1 ) {
  beginShape(type);
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape()
}

function sb(position) {
  strokeWeight(10)
  point( position.x, position.y, position.z )
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

    const qualityLine = mappers.fn(sin(time), -1, 1, -.05, 1.05, easing.easeInOutQuad);
  // const qualityLine = mappers.fn(mouseX, 0, width, 0, 1.5, easing.easeInOutExpo);
  const x = map(qualityLine, -.05, 1.05, -W, W);

  line(x, -H, x, H);

  push()
  translate(-W, -H)
  const columns = 3;
  const rows = 1//columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  mappers.traceVectors(
    alphabet.length*7,
    ( progression ) => {
    // const [,easingFunction] = mappers.circularIndex(time+progression, easingFunctions)
    // const [,easingFunction] = mappers.circularIndex(1, easingFunctions)
    // const easingFunction = mappers.circularIndex(progression+map(sin(time), -1, 1, 0, 1), [
    //   easing.easeInSine, easing.easeInOutSine
    // ])

      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .1,
            // sampleFactor: qualityLine > progression ? .05 : .01,
            // sampleFactor: qualityLine > progression ? .5 : .1,
            // sampleFactor: .1,
            // sampleFactor,
            // sampleFactor: mappers.circularIndex(time*2, [.1, .075, .05, .025]),
            font: string.fonts.martian,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // easingFn: easing.easeInOutCubic,
        // easingFn: mappers.circularIndex(progression+map(sin(time), -1, 1, 0, 1), [
        //   easing.easeInSine, easing.easeInOutSine,
        //   // easing.easeInExpo, easing.easeOutExpo,
        // ]),
        currentTime: map(progression, 0, 1, 0, alphabet.length-1),
        // currentTime: map(progression, 0, 1, 0, alphabet.length)+time//+abs(sin(time)),
        // currentTime: easeArrayIndexes({
        //     range: 1,
        //     speed: time+progression,
        //     length: alphabet.length,
        //     progression,
        //     easingFn: easing.easeInOutExpo
        //   })
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 

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
    (vectorIndexProgression, chunkIndex ) => {
      const chunkOffset = chunkIndex;
      const vectorOffset = vectorIndexProgression*5;

      const colorFunction = qualityLine > chunkIndex ? colors.rainbow : colors.purple;

      stroke(colorFunction({
        hueOffset: (
          // +sampleFactor
          // +chunkOffset
          +0
        ),
        hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*8,
        // hueIndex: mappers.fn(sin(vectorIndexProgression*5+chunkIndex/10+time), 0, 1, -PI/2, PI/2)*4,
        hueIndex: mappers.fn(noise(vectorOffset*5, chunkOffset*2+time), 0, 1, -PI/2, PI/2)*8,
        opacityFactor: 1.5,
        // opacityFactor: map(sin(time*2+vectorIndexProgression), -1, 1, 4, 1.5),
        opacityFactor: mappers.fn(
          sin(time*10+vectorOffset*2+cos(time*2+map(chunkOffset, 0, 1, -PI/2, PI/2)*5)*2),
          // sin(time*10+vectorOffset+chunkOffset),
          -1, 1,
          5, 1.2,
          easing.easeInOuQuart
        ),
      }))

      // rotateX(PI/2+time+vectorIndexProgression*2)
      // rotateY(PI/2)
      // stroke(favoriteColor)
      strokeWeight(3)
      endShape()

      // pop()
    }
  )


  translate(0, 0, 1)

  stroke(favoriteColor)
  // fill(favoriteColor)
  strokeWeight(3)
  const style = POINTS;

  [ end, middle, start ].forEach( points => drawLine( points, style) )

  // drawLine( end, style, sample)
  // drawLine( start, style, sample )
  // drawLine( middle, style, sample  )

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawLine( end, POINTS )
  // drawLine( start, POINTS )
  // drawLine( middle, POINTS )

  orbitControl()
});



