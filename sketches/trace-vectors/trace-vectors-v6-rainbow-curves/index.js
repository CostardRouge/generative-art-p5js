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

// const alphabet = "123".split("")
// const alphabet = ["vanessa", "steeve"]
// const alphabet = ["anemone", "de", "mer"]
// const alphabet = ["up", "down"]
// const alphabet = ["up", "down"]
const alphabet = ["rainbow", "curves"]

function drawLine( points, type = POINTS ) {
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

  const letterSize = W/3.5;
  const margin = letterSize/1.5;

  // const from = createVector(-W+margin, 0);
  // const to = createVector(W-margin, 0);
  const from = createVector(0, -H+margin, 0);
  const to = createVector(0, H-margin, 0);

    const qualityLine = mappers.fn(sin(time/2), -1, 1, -.05, 1.05, easing.easeInOutQuad);
  // const qualityLine = mappers.fn(mouseX, 0, width, 0, 1.5, easing.easeInOutExpo);
  // const x = map(qualityLine, -.05, 1.05, -W, W);
  // line(x, -H, x, H);

  const y = map(qualityLine, -.05, 1.05, -H, H);
  // line(-W, y, W, -y);
  // line(-W, -y, W, y);
  line(-W, y, W, y);

  push()
  translate(-W, -H)
  const cols = 1;
  const rows = 10//cols * (height/width);
  drawGrid(cols, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)
  // translate(0, -50, 0)

  const start = [];
  const end = [];
  const middle = [];

  mappers.traceVectors(
    20,
    ( progression ) => {
    const [,easingFunction] = mappers.circularIndex(time, easingFunctions)
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
            // sampleFactor: mappers.circularIndex(progression-time*2, [.005, .025, .0125]),
            font: string.fonts.martian,
            // font: mappers.circularIndex(time+progression, [string.fonts.martian, string.fonts.sans])
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // lerpFn: mappers.fastLerpPoints,
        easingFn: easing.easeInOutCubic,
        // easingFn: easingFunction,
        // easingFn: easing.easeInOutExpo,
        // easingFn: mappers.circularIndex(map(sin(time), -1, 1, 0, 1), [
        //   easing.easeInSine, easing.easeOutSine,
        //   // easing.easeInExpo, easing.easeOutExpo,
        // ]),
        currentTime: map(progression, 0, 1, 0, alphabet.length-1),
        // currentTime: map(progression, 0, 1, 0, alphabet.length)+time//+abs(sin(time)),
        // currentTime: easeArrayIndexes({
        //     range: 1,
        //     speed: time/4+progression,
        //     length: 10,
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

      const z = animation.ease({
        values: [-50, 20, -100, 50, 20, 100],
        duration: 1,
        easingFn: easing.easeInOutSine,
        currentTime: (
          +time/2
          // +vectorIndexProgression
          +vectorsListProgression*2
        )
      })

      const y = animation.ease({
        values: [-50, 50],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: (
          +time/2
          +vectorIndexProgression
        )
      })

      position.add( vector )
      // position.add( 0, y, 0 )
      // position.add( 0, 0, y )
      position.add( z, 0 )

      if (vectorsListProgression==1 ) {
        end.push( position)
      }

      if (vectorsListProgression==0) {
        start.push( position )
      }

      // if (vectorsListProgression==0.5) {
      //   middle.push( position )
      // }

      // if (vectorsListProgression.toPrecision(1)==qualityLine.toPrecision(1)) {
      //   middle.push( position )
      // }

      vertex( position.x, position.y, position.z )
    },
    (vectorIndexProgression, chunkIndex ) => {
      const chunkOffset = chunkIndex;
      const vectorOffset = vectorIndexProgression*5;

      const colorFunction = qualityLine > chunkIndex ? colors.rainbow : colors.purple;

      stroke(colorFunction({
        hueOffset: (
          // +time
          // +vectorIndexProgression
          // +sampleFactor
          // +chunkOffset
          +0
        ),
        hueIndex: mappers.fn(noise(vectorIndexProgression+time/4, time/4+chunkOffset/4), 0, 1, -PI/2, PI/2)*16,
        hueIndex: mappers.fn(sin(vectorIndexProgression+time/4+time/4+chunkOffset/4), -1, 1, -PI/2, PI/2)*16,
        opacityFactor: map(sin(time*2+chunkOffset*7*vectorIndexProgression), -1, 1, 4, 1.5),
        // opacityFactor: mappers.fn(
        //   // sin(time+vectorOffset+chunkIndex*2),
        //   sin(time+vectorOffset+chunkOffset),
        //   -1, 1,
        //   5, 1.2,
        //   easing.easeInOutQuart
        // ),
      }))

      // rotateX(PI/2+time+vectorIndexProgression*2)
      // rotateY(PI/2)
      // stroke(favoriteColor)
      strokeWeight(3)
      endShape()

      // pop()
    }
  )

  // 4x12h=48h
  // init 
  // perfectionnement
  // impro 1, 2


  translate(0, 0, 3)

  stroke(favoriteColor)
  fill(favoriteColor)
  strokeWeight(3)
  const style = POINTS;

  [ end, start, middle ].forEach( points => drawLine( points, style) )

  orbitControl()
});



