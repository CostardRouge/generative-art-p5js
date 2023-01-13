import { debug, sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

const easingFunctions = Object.entries(easing)

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  return cache.store( `${text}-text-points`, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return textPoints.map( ({x, y}) => {
      const testPointVector = createVector(x, y);

      testPointVector.add((position.x-xCenter),(position.y-yCenter))

      return testPointVector;
    })
  }, true);
}

sketch.draw( (time, center) => {
  background(0);

  const word = "*text-points-on-grid-cells".split("")

  word.forEach( text => {
    getTextPoints({
      text,
      position: createVector(0, 0),
      size: 1000,
      font: string.fonts.serif,
      sampleFactor: 0.075,
      simplifyThreshold: 0
    })
  })

  const currentLetter = mappers.circularIndex(time, word)
  const currentTextPoints = cache.get( `${currentLetter}-text-points`);

  const h = height/4;
  const d = 30//map(sin(time), -1, 1, 20, 50);
  const r = 600;

  strokeWeight(2)
  noFill()
  rotateX(-PI/4.5)
  //rotateY(PI/2)


  //sketch?.engine?.camera?.lookAt(-7.38, -486, 398)

  for (let z = 0; z < d; z++) {
    push()
    translate(0, map(z, 0, d-1, -h, h))
    rotateX(PI/2)
    //rotateZ(-time/4)

    // const easingFunction = mappers.circularIndex(-time+z/100, easingFunctions)[1]

    const zR = mappers.fn(z, -5, d*1.4, 0.7, 20, easing.easeInExpo);
    const cc = map(z, 0, d-1, -PI, PI)

    let rr = map(z, 0, d-1, r, -r)
    rr = map(sin(cc+time), -1, 1, r, -r)
    // rr = map(sin(cc+time+z*50), -1, 1, r, -r)

    const step = 180//map(z, 0, d-1, 45, 180)

    for (let a = 0; a < TAU; a += TAU / step) {
      //const easingFunction = mappers.circularIndex(-time+z/100, easingFunctions)[1]
      //rr = mappers.fn(z, 0, d-1, -r, r, easingFunction)
      //rr = mappers.fn(sin(a+time/100), -1, 1, -r, r, easingFunction)
      //const colorIndex = noise(a, z) * TAU

      const currentColor = colors.rainbow({
        //hueOffset: map(sin(time+a/PI/2), -1, 1, 1, -1),
        //hueOffset: a,
        hueIndex: z/2+a*5,//mappers.fn(colorIndex, 0, TAU, -PI, PI)*8,
        //opacityFactor: mappers.fn(sin(time*2+a*PI/3), -1, 1, 10, 1, easing.easeOutQuart),
        //opacityFactor: map(sin(z*a*2+time*3), -1, 1, 15, 1),
        //opacityFactor: map(sin(z*a*5+(z*sin(a+time))*3-time), -1, 1, 25, 1) + mappers.fn(z, 0, d-1, 0, 10, easing.easeInExpo),
        //opacityFactor: map(sin(z*a+(a*sin(z+time))*3-time*3), -1, 1, 15, 0.5) + mappers.fn(z, 0, d-1, 0, 10, easing.easeInExpo),
        opacityFactor: map(sin(z*25-a+time*3), -1, 1, 10, 1)// + mappers.fn(z, 0, d-1, 0.5, 10, easing.easeInExpo),
      })

      //const currentPosition = createVector(sin(a) * r*zR/2, cos(a) * r*zR/2 )
      const currentPosition = createVector (sin(a) * r/2, cos(a) * r/2 )

      const isVisible = a >= TAU*7/8 || a <= TAU*1/8;

      if ( isVisible ) {
        const x1 = (a >= TAU*7/8 && a <= TAU) ? map(a, TAU*7/8, TAU, 0, 0.5, true) : 0
        const x2 = (a >=0 && a <= TAU*1/8) ? map(a, 0, TAU*1/8, 0.5, 1) :0

        // const x1 = (a >= PI && a <= TAU) ? map(a, PI, TAU, 0, 0.5, true) : 0
        // const x2 = (a >=0 && a <= PI) ? map(a, 0, PI, 0.5, 1) :0

        const normalizedPosition = createVector(
          x1 + x2,
          map(z, 0, (d-1), 0, 1)
        );

        const alpha = getAlphaFromMask({
          position: normalizedPosition,
          maskPoints: currentTextPoints,
          maskId: currentLetter,
        })
        
        if (alpha) {
          currentColor.setAlpha(alpha)
          currentPosition.add(0, 500)
        }
      }

      push()
      translate(currentPosition);

      // translate(
      //   sin(a)*2 * rr*zR/3,
      //   cos(a)*2 * rr*zR/3
      // )

        const s = map(sin(z*25-a+time*3), -1, 1, 10, 15)

        //rotateY(-time+a+z/10)
        //rotateZ(-time+a/5)

      stroke(currentColor)
      //box(s)
      strokeWeight(3)
      point(0, 0)
      pop()
    }
    pop()
  }

  debug.webgl()

  orbitControl()
});

function getAlphaFromMask({ position, maskPoints, maskId, distance = 0.025, alphaRange = [0, 255]}) {
  const { x, y } = position;

  const alpha = cache.store(`${x}-${y}-${maskId}-alpha`, () => {
    const [ minAlpha, maxAlpha ] = alphaRange;

    return maskPoints.reduce( ( result, pointPosition ) => {
      if (255 <= result) {
        console.log("pass here", result);
        return result;
      }

      const normalizedPointPosition = createVector(
        map(pointPosition.x, -width /2, width/2, 0, 1),
        map(pointPosition.y, -height /2, height/2, 0, 1)
      );

      return Math.max(
        result,
        ~~map(normalizedPointPosition.dist(position), 0, distance, maxAlpha, minAlpha, true)
      );
    }, 0);
  });

  return alpha;
}
