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
alphabet = "0123456789".split("")
// alphabet = "0".split("")

function drawPoints( points ) {
  for (let index = 0; index < points.length; index++) {
    const { x, y } = points[index];

    point(x, y );
  }
}

function drawLine( points ) {
  beginShape();
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape()
}

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2

  const letterSize = W/1.5//1.25;
  const margin = letterSize/2;

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);
  // const from = createVector(-W+margin, -H+margin);
  // const to = createVector(W-margin, H-margin);

  push()
  translate(-W, -H)
  const columns = 20;
  const rows = columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()


  translate(0, 0, 50)

  const start = [];
  const end = [];

  const dValues = [alphabet.length]
  
  const vectorsList = mappers.traceVectors(
    alphabet.length*2,
    ( progression ) => {
      const d = animation.ease({
        values: dValues,
        duration: 1,
        easingFn: easing.easeInOutCubic,
        currentTime: time/2+progression
      })
  
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .1,
            font: string.fonts.sans,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutExpo,
        easingFn: easing.easeInOutQuad,
        easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCubic,
        currentTime: map(progression, 0, 1, 0, (alphabet.length-1)/d)//+time
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {

      // vertex( vector.x, vector.y, vector.z )


      // const angle = mappers.circular( vectorsListProgression, 0, 1, 0, 1, easing.easeInOutCubic )
      // const position = vector.copy()

      // position.mult( [ sin(angle), cos(angle)] )
      // position.mult( 3 )

      // vertex( position.x, position.y, position.z )

      // const position = createVector( sin(angle), cos(angle) )

      // position.add( vector )
      // position.mult( 2 )

      // vertex( position.x, position.y, position.z )


      // const position = vector.copy()//p5.Vector.lerp( from, to, vectorsListProgression ) 
      const radius = 150;
      const angle = mappers.fn( vectorsListProgression, 0, 1, 0, TAU)
      const position = createVector( sin(angle)*radius, cos(angle)*radius ) 
      // const position = createVector( sin(angle+vectorsListProgression+time)*radius, cos(time*2+angle+vectorsListProgression*8)*radius ) 

      const z = animation.ease({
        values: [-H/4, H/4],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: noise(vectorsListProgression+time, vector.y/(H/2), vector.x/(W/2))+time+vectorsListProgression
      })

      // position.mult( [ sin(angle)*3, cos(angle)] )
      // position.add( -mappers.fn( vectorsListProgression, 0, 1, -150, 150), vector.y, vector.x )
      // position.add( 0, vector.y, vector.x )
      position.add( vector.x, vector.y )
      position.mult( 1.5 )

      // position.add( z/4, z)

      if (vectorsListProgression==1 ) {
        end.push( position)
      }

      if (vectorsListProgression==0) {
        start.push( position )
      }

      vertex( position.x, position.y, position.z )
      // push()
      // translate( center.x, center.y )
      // rotateX(PI/2)

      // point( position.x, position.y, position.z )
      // pop()
    },
    vectorIndexProgression => {
      const colorFunction = colors.rainbow;
      // const colorFunction = mappers.circularIndex( time+index*4/longest, [ colors.rainbow, colors.purple ] );

      // const opacityFactor = animation.ease({
      //   values: [10, 1.5],
      //   // values: [1],
      //   duration: 1,
      //   easingFn: easing.easeInOutCubic,
      //   // easingFn: easing.easeInOutExpo,
      //   currentTime: time+vectorIndexProgression
      // })
      
      stroke(colorFunction({
        hueOffset: (
          +time
          // +index/longest
          +0
        ),
        hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*4,
        // hueIndex: map(sin(time+vectorIndexProgression), -1, 1, -PI/2, PI/2)*4,
        hueIndex: mappers.fn(noise(vectorIndexProgression*8, vectorIndexProgression*cos(time+vectorIndexProgression)), 0, 1, -PI/2, PI/2)*6,
        opacityFactor: 1.5,
        // opacityFactor: map(scale, 0, 2, 10, 1),
        // opacityFactor: map(vectorIndexProgression, 0, 1, 10, 1),
        opacityFactor: map(sin(time+vectorIndexProgression*16), -1, 1, 5, 1.5),
        // opacityFactor
      }))

      // rotateZ(PI/2+time)
      // rotateY(PI/2)

      // stroke("red")
      strokeWeight(4)
      endShape()

      // pop()
    }
  )

  stroke(favoriteColor)
  // fill(favoriteColor)
  strokeWeight(4)
  drawLine( end )
  drawLine( start )

  orbitControl()
});



