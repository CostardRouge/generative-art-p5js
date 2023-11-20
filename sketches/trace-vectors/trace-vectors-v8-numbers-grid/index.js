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

function traceVectors(count, vectorsGenerator, onStart, onTrace, onEnd, smoothLength = false) {
  const vectorsList = Array( count ).fill(undefined).map( ( _, index ) => (
    vectorsGenerator( index / (count-1) )
  ));

  const longestVectorsLength = (
    smoothLength ?
    mappers.valuer(`longest-vectors-length`, Math.max( ...vectorsList.map( vectors => vectors.length )))?.smooth :
    Math.max( ...vectorsList.map( vectors => vectors.length ) )
  );

  for (let index = 0; index < longestVectorsLength; index++) {
    const vectorIndexProgression = index / (longestVectorsLength-1);

    const count = 1;
    const steps = vectorsList.length / count;

    for (let phase = 0; phase < steps; phase++) {
      onStart( vectorIndexProgression, phase/(steps-1) );

      const startIndex = (phase * count);
      const endIndex = ( count + (phase * count) )+1;
    
      for (let j = startIndex; (j < endIndex) && vectorsList[j]; j++) {
        const vectors = vectorsList[j];
        const vectorsListProgression = j/(vectorsList.length-1);

        // onTrace( vectors[index % vectors.length], vectorsListProgression, vectorIndexProgression );
        onTrace( vectors[index], vectorsListProgression, vectorIndexProgression );
      }

      onEnd( vectorIndexProgression, phase/(steps-1) );
    }

    // onStart( vectorIndexProgression );
    
    // for (let j = 0; j < vectorsList.length; j++) {
    //   const vectors = vectorsList[j];
    //   const vectorsListProgression = j/(vectorsList.length-1);

    //   onTrace( vectors[index % vectors.length], vectorsListProgression, vectorIndexProgression );
    //   // onTrace( vectors[index], vectorsListProgression, vectorIndexProgression );
    // }

    // onEnd( vectorIndexProgression );
  }

  return vectorsList;
}

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
alphabet = "123456789".split("")

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
  const H = height/2;

  const letterSize = W/1.5//1.25;
  const margin = letterSize/2;

  // const from = createVector(-W+margin, 0);
  // const to = createVector(W-margin, 0);
  const from = createVector(0, -H+margin, 0);
  const to = createVector(0, H-margin, 0);

  const columns = 3;
  const rows = 3;//cols * (height/width)
  const cells = columns * rows;

  push()
  translate(-W, -H)
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()

  translate(0, 0, 1)

  const start = [];
  const end = [];
  const middle = [];

  const positions = []

  for (let yy = 0; yy < rows; yy++) {
    const y = lerp(-H/(rows/2), H/(rows/2), yy/(rows-1));

    for (let xx = 0; xx < columns; xx++) {
      const x = lerp(-W/(columns/2), W/(columns/2), xx/(columns-1));

      positions.push( createVector( x, y ) )
    }
  }

  // console.log(positions.length);


  // const positions = [
  //   createVector(-W/1.5, -H/1.5),
  //   createVector(0, -H/1.5),
  //   createVector(W/1.5, -H/1.5),
  //   createVector(-W/1.5, 0),
  //   createVector(0, 0),
  //   createVector(W/1.5, 0),
  //   createVector(-W/1.5, H/1.5),
  //   createVector(0, H/1.5),
  //   createVector(W/1.5, H/1.5),
  // ]

  const hues = positions.map( ({ x, y }, index ) => (
    colors.rainbow({
      hueOffset: (
        // +sampleFactor
        // +chunkOffset
        //+chunkOffset*vectorOffset*2
        +0
      ),
      opacityFactor: 1.5,
      hueIndex: mappers.fn(noise(x, y), -1, 1, -PI/2, PI/2)*12,
      hueIndex: mappers.fn(index, 0, positions.length-1, -PI, PI),
      // opacityFactor: map(cos(time), -1, 1, 5, 1.5),
    })
  ))

  const hue = animation.ease({
    values: hues,
    duration: 1,
    lerpFn: lerpColor,
    // easingFn: easing.easeInOutCubic,
    // easingFn: easing.easeInOutExpo,
    currentTime: time
  })

  const position = animation.ease({
    values: positions,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    // easingFn: easing.easeInOutCubic,
    easingFn: easing.easeInOutExpo,
    currentTime: time
  })

  stroke(hue)
  strokeWeight(2)
  // point( position.x, position.y )

  // positions.forEach( ( { x, y  }) => point(x, y ))

  const points = animation.ease({
    values: alphabet.map( text => (
      string.getTextPoints({
        text,
        size: letterSize,
        position: center,
        sampleFactor: .5,
        font: string.fonts.martian,
      })
    )),
    duration: 1,
    lerpFn: mappers.lerpPoints,
    // easingFn: easing.easeInOutCubic,
    easingFn: easing.easeInOutExpo,
    currentTime: time
  })

  push()
  translate(position)
  drawLine( points )
  push()


  return
  traceVectors(
    35,
    ( progression ) => {
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize,
            position: center,
            sampleFactor: .05,
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
            +time
            // +vectorIndexProgression+vectorsListProgression*cos(time+vectorsListProgression*2)
            +vectorsListProgression+vectorIndexProgression*cos(time+vectorIndexProgression*2)
            +vectorsListProgression*2+vectorIndexProgression*abs(cos(time+vectorsListProgression*2))
            // +vectorIndexProgression*2*cos(time+vectorIndexProgression)
            //+noise(vectorIndexProgression*2+time, vectorsListProgression*2+time)*vectorIndexProgression
            //+vectorsListProgression*3
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
    (vectorIndexProgression, chunkIndex ) => {
      const chunkOffset = chunkIndex/5;
      const vectorOffset = vectorIndexProgression*5;

      // const indexCooef = map(sin(time+chunkIndex), -1, 1, 1, 2);
      const indexCooef = animation.ease({
        values: [1, 1.5],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        currentTime: (
          +time/2
          +chunkIndex+vectorIndexProgression
        )
      })
      const t = map(chunkIndex, 0, 1, -PI/2, PI/2)*PI*1.5

      stroke(colors.test({
        hueOffset: (
          // +sampleFactor
          // +chunkOffset
          +time/2*chunkOffset*vectorOffset
          //+chunkOffset*vectorOffset*2
          +5
        ),
        opacityFactor: 1.5,
        hueIndex: mappers.fn(sin(chunkOffset+vectorIndexProgression+indexCooef+time/4), -1, 1, -PI/2, PI/2)*12,
        // opacityFactor: map(cos(chunkOffset*PI/2), -1, 1, 40, 1.5),
        opacityFactor: map(cos(t+time), -1, 1, 5, 1.5),
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



