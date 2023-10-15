import { midi, events, sketch, string, mappers, easing, animation, colors, cache, iterators } from './utils/index.js';

sketch.setup( undefined, { type: "webgl" } );

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))

alphabet = "aurelie-steevou-".split("")

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

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  const W = width/2;
  const H = height/2

  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/4)
  // rotateX(mappers.fn(cos(time/2), -1, 1, -PI, PI, easing.easeInOutQuart)/8)
  // rotateZ(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  const letterScale = 8//1.75;
  const letterSize = width/4;

  const radius = W-50;

  drawCircle({
    // angleCount: 500,
    angleCount: 17,
    radius,
    render: ( angle, progression, endPosition, middlePosition ) => {

      // const pointsProgression = map(progression, 0, 1, letterStartIndex, letterEndIndex);
      const pointsProgression = map(progression, 0, 1, 0, alphabet.length-1);
      // const pointsProgression = ~~mappers.circularIndex(progression, 0, 1, 0, alphabet.length-1);

      const scale = 1

      const text = mappers.circularIndex( -pointsProgression-time, alphabet )
    
      const points = string.getTextPoints({
        // text: alphabet[ pointsProgression % alphabet.length ],
        text,
        size: letterSize/2,
        position: center,
        sampleFactor: .2,
        simplifyThreshold: .0,
        font: string.fonts.sans
      })

      push();
      translate( middlePosition.x, middlePosition.y )
      rotateZ(PI/2)
      // rotateY(-PI/2)
      // rotateX(-PI/2)
      strokeWeight( 1 )

      for (let i = 0; i < points.length; i++) {
        const progression = i / points.length
    
        const { x, y } = points[i];  
        const colorFunction = colors.rainbow;
    
        // stroke(colorFunction({
        //   hueOffset: (
        //     +pointsProgression*3
        //     // +time
        //     +0
        //   ),
        //   hueIndex: mappers.circularPolar(progression, 0, 1, -PI/2, PI/2)*2,
        //   // hueIndex: mappers.fn(noise(x/width, y/height, progression/3), 0, 1, -PI, PI)*12,
        //   opacityFactor: 1.5
        // }))
    
        point(x*scale, y*scale)
      }

      pop()
    }
  })

  orbitControl();
});
