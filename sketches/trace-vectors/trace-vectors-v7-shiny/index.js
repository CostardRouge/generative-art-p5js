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

const alphabet = "123".split("")

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

  const letterSize = W/1.5//1.25;
  const margin = letterSize/2;

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);

  push()
  translate(-W, -H)
  const columns = 3;
  const rows = 1//columns * (height/width);
  drawGrid(columnsmnsmnsmns, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  mappers.traceVectors(
    alphabet.length*9,
    ( progression ) => {

      // const sampleFactor = animation.ease({
      //   values: [.1, .075, .065, .05, .045, .03, .025], 
      //   values: [.1, .075, .05, .025, 0.3], 
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   // easingFn: easing.easeInOutQuad,
      //   // easingFn: easing.easeInOutQuart,
      //   // easingFn: easing.easeInOutCubic,
      //   // currentTime: progression/2+time,
      //   currentTime: time,
      // }) 
      
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
        // duration: mappers.fn(cos(time*2  -progression*2), -1, 1, -2, 2, easing.easeInOutElastic),
        lerpFn: mappers.lerpPoints,
        currentTime: map(progression, 0, 1, 0, alphabet.length-1)
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

      stroke(colors.rainbow({
        hueOffset: (
          // +sampleFactor
          +chunkOffset
          +0
        ),
        hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*8,
        // hueIndex: mappers.fn(sin(vectorIndexProgression*5+chunkIndex/10+time), 0, 1, -PI/2, PI/2)*4,
        // hueIndex: mappers.fn(noise(vectorOffset, chunkOffset), 0, 1, -PI/2, PI/2)*8,
        opacityFactor: 1.5,
        // opacityFactor: map(sin(time*2+vectorIndexProgression), -1, 1, 4, 1.5),
        opacityFactor: mappers.fn(sin(time*10+vectorOffset*10+chunkOffset*10), -1, 1, 5, 1.5),
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
  fill(favoriteColor)
  strokeWeight(3)
  drawLine( end, TRIANGLES )
  drawLine( start, TRIANGLES )
  drawLine( middle, TRIANGLES )

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawLine( end, POINTS )
  // drawLine( start, POINTS )
  // drawLine( middle, POINTS )

  orbitControl()
});



