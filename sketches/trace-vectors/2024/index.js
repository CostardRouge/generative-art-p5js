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

const alphabet = "2024".split("")

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

  const letterSize = W;
  const margin = letterSize/3.5;

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);

  const HUDmargin = 50;

  const textStyle = {
    size: 36,
    fill: color( 128, 128, 255 ),
    font: string.fonts.martian
  }

  push()
  textAlign(LEFT);
  string.write("happy", -W+HUDmargin, H-HUDmargin, textStyle)

  textAlign(CENTER);
  string.write("new", 0, H-HUDmargin, textStyle)

  textAlign(RIGHT);
  string.write("year", W-HUDmargin, H-HUDmargin,textStyle)
  pop()

  push()
  translate(-W, -H)
  const columns = 4;
  const rows = 4;
  drawGrid(columns, rows, favoriteColor, 0.5, 0, [1], [1])
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  mappers.traceVectors(
    100,
    ( progression ) => {
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .175,
            font: string.fonts.sans,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutQuad,
        currentTime: map(progression, 0, 1, 0, alphabet.length-1),
      }) 
    },
    () => {
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 

      const z = animation.ease({
        values: [-H/3, 0, H/3],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        easingFn: easing.easeInOutBack,
        currentTime: time+vectorIndexProgression/2+vectorsListProgression,
        currentTime: (
          time
          // noise(vectorIndexProgression, vectorsListProgression+time/2)*2
          +vectorsListProgression
          // +vectorIndexProgression
        )
      })

      position.add( vector )
      position.add( 0, z )
      // position.add( 0, 0, z  )

      if (vectorsListProgression>map(sin(time*4-vectorIndexProgression), -1, 1, 0, 1) ||
      vectorsListProgression<map(cos(time*2+vectorIndexProgression), -1, 1, 0, 1)) {
        middle.push( position )
      }

      vertex( position.x, position.y, position.z )
    },
    ( vectorIndexProgression, chunkIndex ) => {
      stroke(colors.rainbow({
        hueOffset: (
          0
          +time*5
          // +vectorIndexProgression
          // *chunkIndex
          // +
        ),
        hueIndex: mappers.fn(noise(chunkIndex/2, vectorIndexProgression*2), 0, 1, -PI/2, PI/2)*16,
        opacityFactor: mappers.fn(noise(chunkIndex*2, vectorIndexProgression*2), 0, 1, 4, 1),

      }))

      strokeWeight(4)
      endShape()
    },
    false,
    0,
    1
  )


  translate(0, 0, 1)

  // stroke(favoriteColor);
  stroke(18, 18, 32, 0)

  ;[
    start,
    end,
    middle
  ].forEach( points => {
    drawLine( points, TRIANGLES ) 
  })

  // translate(0, 0, 1)
  // strokeWeight(8)
  // drawPoints( end )
  // drawPoints( start )

  orbitControl()
});



