import { midi, events, sketch, string, mappers, easing, animation, colors, cache, iterators } from './utils/index.js';

sketch.setup( undefined, { type: "webgl" } );

events.register( "post-setup", midi.setup );

const easingFunctions = Object.entries( easing );

function drawRangeSlider({from, to}, start, end, steps = 26, stepDrawer, rangeDrawer) {
  const fromPosition = p5.Vector.lerp( start, end, from )
  const toPosition = p5.Vector.lerp( start, end, to )

  rangeDrawer?.(fromPosition, toPosition)

  for (let i = 0; i <= steps; i++) {
    const currentStepPosition = p5.Vector.lerp( start, end, i/steps );

    if (i === 0 || i === ~~(steps/2) || i === steps) {
      strokeWeight(15)
    }
    else {
      strokeWeight(8.5)
    }

    stepDrawer?.(i, currentStepPosition, fromPosition, toPosition )
  }
}

// let currentIndex = -1;

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))

// alphabet = "text-scroll-?".toUpperCase().split("")
// alphabet = "salsa-bachata".toUpperCase().split("")
// alphabet = "test".split("")
alphabet = "sbk".split("")

function drawCircle({
  angleCount = 12,
  angleStart = 0,
  angleEnd = TAU,
  angleStep = (angleEnd - angleStart) / angleCount,
  radius,
  render
}) {
  for (let angle = 0; angle < angleEnd; angle += angleStep) {
    push()
    // const position = createVector(
    //   sin(angle) * radius/2,
    //   cos(angle) * radius/2
    // )

    // point(position.x, position.y)

    const endPosition = createVector( radius, 0 );
    const middlePosition = createVector( radius/1.5, 0 );

    translate(0, 0)
    rotate(angle)

    render?.( angle, angle/angleEnd, endPosition, middlePosition );

    pop()
  }
}

const pattern = (weight = 3, columns = 7, time) => {
  background(0);

  stroke(255)
  strokeWeight(weight)
  noFill()

  const columnSize = width / columns
  const halfColumnSize = (columnSize /2 )
  const columnPadding = weight + halfColumnSize;
  const precision = 0.01;

  for (let i = 0; i < columns; i++) {
    const x = ( i * columnSize ) + halfColumnSize;
    const top = createVector( x, -height/2-200);
    const bottom = createVector( x, height/2+200);

    if (i > columns-1) {
      stroke(64,64,128)
    }
    else {
      stroke(128)
    }

    beginShape()
    iterators.vector(top, bottom, precision, ( position, lerpIndex ) => {
      const driftBound = (halfColumnSize + columnPadding) * sin(time + lerpIndex +i);
      const driftX = map( easing.easeInOutBack((lerpIndex) % 1), 0, 1, -driftBound, driftBound);

      vertex( position.x - driftX, position.y );
    });
    endShape()
  }
}

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  const W = width/2;
  const H = height/2

  const n = animation.ease({
    values: [0,1,2,3,4,5,6,7,8,9,0],
    currentTime: time,
    duration: 1,
    easingFn: easing.easeInOutExpo,
  })

  push()
  translate(-W, 0)
  pattern(2.5, n, time)
  pop()

  rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/4)
  rotateX(mappers.fn(cos(time/2), -1, 1, -PI, PI, easing.easeInOutQuart)/8)
  rotateZ(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)


  const margin = 50;
  const triangleHeight = 30;
  const triangleWidth = 20;

  // if (currentIndex !== Math.round(pointsProgression)) {
  //   currentIndex = Math.round(pointsProgression)
  //   // console.log(currentIndex, notes[currentIndex]);
  //   // midi.stop();
  //   // midi.play("C3");
  //   midi.play("F2");
  //   // midi.play(notes[currentIndex]);
  // }

  const letterRange = 2;
  const letterSliderSpeed = time;
  
  // const letterStartIndex = animation.ease({
  //   values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index),
  //   duration: 1,
  //   currentTime: letterSliderSpeed,
  //   easingFn: easing.easeInOutExpo,
  //   // easingFn: easing.easeOutSine
  // });

  // const letterEndIndex = animation.ease({
  //   values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index + letterRange),
  //   duration: 2,
  //   currentTime: letterSliderSpeed,
  //   easingFn: easing.easeInOutExpo,
  //   easingFn: easing.easeInOutElastic,
  //   // easingFn: easing.easeInSine
  // });

  const count = 2;
  const letterScale = 8//1.75;
  const letterSize = width/4;
  const letterMargin = margin+100;
  const from = createVector(-W+letterMargin, 0);
  const to = createVector(W-letterMargin, 0);

  const radius = W-50;

  drawCircle({
    angleCount: 500,
    // angleCount: 150,
    radius,
    render: ( angle, progression, endPosition, middlePosition ) => {
      // line(0, 0, endPosition.x, endPosition.y)
      // line(middlePosition.x, middlePosition.y, endPosition.x, endPosition.y)

      // point(endPosition.x, endPosition.y)
      // point(middlePosition.x, middlePosition.y)
      // const pointsProgression = map(progression, 0, 1, letterStartIndex, letterEndIndex);
      // const pointsProgression = map(progression, 0, 1, 0, alphabet.length-1);
      const pointsProgression = mappers.circular(progression, 0, 1, 0, alphabet.length-1);

      // const [,easingFunction] = mappers.circularIndex(pointsProgression*2-time, easingFunctions)

      const a = animation.ease({
        // values: [3, 5, 7],
        values: [PI, PI*.5, PI*1.5],
        duration: 1,
        currentTime: pointsProgression+time,
        // easingFn: easing.easeInOutSine,
        // easingFn: easing.easeInOutExpo
      })

      const polarProgression = map(progression, 0, 1, -PI/2, PI/2);
      const scale = mappers.fn(
        cos(polarProgression*PI*a),
        -1, 1,
        // -letterScale/4, letterScale*2,
        letterScale/8, letterScale,
        // easingFunction,
        // easing.easeInOutExpo
        easing.easeInOutQuad
      );

      const points = animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            size: letterSize/8,
            position: center,
            sampleFactor: .25,
            simplifyThreshold: .0,
            font: string.fonts.sans
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // currentTime: progression,
        currentTime: pointsProgression,
        currentTime: time,
        easingFn: easing.easeInOutSine,
        // easingFn: easing.easeInOutExpo,
      })

      push();
      translate( middlePosition.x, middlePosition.y )
      rotateY(PI/2)
      rotateX(-PI/2)
      strokeWeight( 4 )

      for (let i = 0; i < points.length; i++) {
        const progression = i / points.length
    
        const { x, y } = points[i];  
        const colorFunction = colors.rainbow;
        // const opacityFactor = mappers.fn(sin(-time*3+angle/20), -1, 1, 4, 1, easing.easeInOutExpo);
    
        stroke(colorFunction({
          hueOffset: (
            +pointsProgression*3
            // +time
            +0
          ),
          hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*4,
          hueIndex: mappers.fn(noise(x/width, y/height, progression/3), 0, 1, -PI, PI)*12,
          opacityFactor: 1.5,
          // opacityFactor,
        }))

        // const extra = mappers.fn(progression, 0, 1, 8, 1, easing.easeInCubic)

          // point(x*scale*scale, y*scale*extra)
          // point(x*scale*scale, y*scale*scale)
          // point(x*scale*extra, y*scale*scale)

    
        point(x*scale, y*scale)
      }

      pop()
    }
  })

  orbitControl();
  return 

  for (let t = 0; t < count; t++) {
    const horizontalProgression = t/count;
    const horizontalPolarProgression = map(t/count, 0, 1, -PI/2, PI/2);
    const pointsProgression = map(horizontalProgression, 0, 1, letterStartIndex, letterEndIndex);

    const points = animation.ease({
      values: alphabet.map( text => (
        getTextPoints({
          text,
          size: letterSize,
          position: center,
          sampleFactor: .1/2,
          simplifyThreshold: 0,
          font: string.fonts.martian
        })
      )),
      duration: 1,
      lerpFn: lerpPoints,
      currentTime: time+horizontalProgression,
      // currentTime: pointsProgression,
      easingFn: easing.easeInOutSine,
      easingFn: easing.easeInOutExpo,
    })

    push();
    translate( p5.Vector.lerp(from, to, horizontalProgression) )
    // rotateY(PI/3)
    strokeWeight( 5 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;
      const opacityFactor = mappers.fn(sin(-time*3+progression*horizontalPolarProgression*5), -1, 1, 4, 1, easing.easeInOutExpo);

      stroke(colorFunction({
        hueOffset: (
          // +horizontalProgression
          // +time
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI),
        hueIndex: mappers.fn(noise(x/width+horizontalProgression, y/height+horizontalProgression, horizontalProgression/3), 0, 1, -PI, PI)*12,
        opacityFactor,
      }))

      point(x*letterScale, y*letterScale)
    }

    pop()
  }

  drawRangeSlider(
    {
      from: letterStartIndex/(alphabet.length-1),
      to: letterEndIndex/(alphabet.length-1)
    },
    createVector(-W+margin, H-margin, 0),
    createVector(W-margin, H-margin, 0),
    alphabet.length-1,
    ( index, position, fromPosition, toPosition ) => {
      // const inside = index >= letterStartIndex && index <= letterEndIndex+1
      const inside = Math.round(position.x) >= Math.round(fromPosition.x) && Math.round(position.x) <= Math.round(toPosition.x)

      string.write(alphabet[index], position.x, position.y, {
        // showBox: true,
        // showLines: true,
        center: true,
        size: 36,
        // stroke: 255,
        // strokeWeight: 1,
        fill: inside ? color( 128, 128, 255 ) : 255,
        font: string.fonts.martian
      })
    },
    ( fromPosition, toPosition ) => {
      strokeWeight(2)
      
      beginShape()
      vertex(fromPosition.x-triangleWidth, fromPosition.y-triangleHeight)
      vertex(fromPosition.x-triangleWidth, fromPosition.y+triangleHeight)

      vertex(toPosition.x+triangleWidth, toPosition.y+triangleHeight)
      vertex(toPosition.x+triangleWidth, toPosition.y-triangleHeight)
    
      endShape(CLOSE)
    }
  )

  orbitControl();
});
