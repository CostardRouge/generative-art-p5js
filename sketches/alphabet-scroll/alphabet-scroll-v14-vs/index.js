import { midi, events, sketch, string, mappers, easing, animation, colors, cache, iterators } from './utils/index.js';

sketch.setup( undefined, { type: "webgl" } );

events.register( "post-setup", midi.setup );

const easingFunctions = Object.entries( easing );

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))

// alphabet = "sbk".split("")
alphabet = "vs".split("")

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
    const top = createVector( x, -height/2-500);
    const bottom = createVector( x, height/2+500);

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

  // const n = animation.ease({
  //   values: [0,1,2,3,4,5,6,7,8,9,0],
  //   currentTime: time,
  //   duration: 1,
  //   easingFn: easing.easeInOutExpo,
  // })

  // push()
  // translate(-W, 0, -W)
  // pattern(2.5, n, time)
  // pop()

  rotateX(PI/2)
  rotateX(-PI/8)
  rotateZ(time)

  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/4)
  // rotateX(mappers.fn(cos(time/2), -1, 1, -PI, PI, easing.easeInOutQuart)/8)
  // rotateZ(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  const letterScale = 3//5.5//1.75;
  const letterSize = width/4;

  const radius = W-50;

  drawCircle({
    angleCount: 100,
    // angleCount: 150,
    radius,
    render: ( angle, progression, endPosition, middlePosition ) => {
      // line(0, 0, endPosition.x, endPosition.y)
      // line(middlePosition.x, middlePosition.y, endPosition.x, endPosition.y)

      // point(endPosition.x, endPosition.y)
      // point(middlePosition.x, middlePosition.y)
      // const pointsProgression = map(progression, 0, 1, letterStartIndex, letterEndIndex);
      // const pointsProgression = map(progression, 0, 1, 0, alphabet.length-1);
      const polarProgression = map(progression, 0, 1, -PI/2, PI/2);
      // const pointsProgression = mappers.circular(progression, 0, 1, 0, alphabet.length-1);
      const pointsProgression = mappers.fn(cos(angle), -1, 1, 0, alphabet.length-1);

      // const [,easingFunction] = mappers.circularIndex(pointsProgression*2-time, easingFunctions)

      // const a = animation.ease({
      //   // values: [3, 5, 7],
      //   values: [PI, PI*.5, PI*1.5],
      //   values: [PI],
      //   duration: 1,
      //   currentTime: pointsProgression+time/2,
      //   // easingFn: easing.easeInOutSine,
      //   // easingFn: easing.easeInOutExpo
      // })

      // const easingFunction = easing.easeInOutExpo;
      // const [,easingFunction] = mappers.circularIndex(angle*polarProgression-time, easingFunctions)

      // const scale = mappers.fn(
      //   cos(polarProgression),
      //   -1, 1,
      //   // -letterScale/4, letterScale*2,
      //   letterScale/8, letterScale,
      //   // easingFunction,
      //   // easing.easeInOutExpo
      //   // easing.easeInOutQuad
      // );

      const scale = letterScale;

      // const sampleFactor = mappers.fn(scale, letterScale/8, letterScale, .05, .25, easingFunction );
      // const size = mappers.fn(scale, letterScale/8, letterScale, letterSize/4, letterSize/2, easingFunction );

      const points = animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            // size,
            size: letterSize/2,
            position: center,
            // sampleFactor,
            sampleFactor: .25,
            simplifyThreshold: 0,
            font: string.fonts.sans
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        currentTime: progression,
        // currentTime: pointsProgression+time,
        // currentTime: angle/8+time/2,
        // currentTime: angle/10+time,
        // currentTime: time,
        currentTime: pointsProgression,
        // currentTime: 1,
        easingFn: easing.easeInOutSine,
        easingFn: easing.easeInOutQuad,
      })

      push();
      translate( middlePosition.x, middlePosition.y )
      // rotateY(PI/2+polarProgression)
      // rotateY(-PI/3)
      rotateX(-PI/2)
      strokeWeight( 4 )

      for (let i = 0; i < points.length; i++) {
        const pointsProgression = i / points.length;
        const { x, y } = points[i];  
        // const opacityFactor = mappers.fn(sin(-time*3+angle/20), -1, 1, 4, 1, easing.easeInOutExpo);
        const opacityFactor = mappers.circularMap(sin(-time*2+angle), 1, 10, 1, easing.easeInOutExpo);

        if (opacityFactor < 20) {
          const tint = colors.rainbow({
            hueOffset: (
              // +pointsProgression
              // +polarProgression
              // +angle
              +time
              +0
            ),
            hueIndex: mappers.circularPolar(angle/10, 0, 1, -PI, PI)*4,
            // hueIndex: mappers.fn(noise(x*2/width*2, y*2/height*2, pointsProgression), 0, 1, -PI/2, PI/2)*4,
            // hueIndex: mappers.fn(noise(angle, pointsProgression, polarProgression), 0, 1, -PI/2, PI/2)*4,
            // opacityFactor: 1.5,
            opacityFactor,
          });
  
          stroke(tint)
          point(x*scale, y*scale)
        }

        // const extra = mappers.fn(progression, 0, 1, 8, 1, easing.easeInCubic)

        //   point(x*scale*scale, y*scale*extra)
        // point(x*scale*scale, y*scale*scale)
        // point(x*scale*extra, y*scale*scale)

      }

      pop()
    }
  })

  orbitControl();
});
