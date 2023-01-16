import { events, debug, sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

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

let clickCount = 0;

events.register("engine-mouse-pressed", () => {
  console.log(clickCount++);
});

sketch.draw( (time, center) => {
  background(0);

  const h = height/4;
  const d = mappers.fn(sin(time), -1, 1, 20,40, easing.easeInOutExpo);
  const r = 600;

  const X = mappers.circularIndex(clickCount, [0, -PI/4.5, PI])


  // translate(0, 0, mappers.fn(sin(time), -1, 1, 500, 0, easing.easeInOutExpo))

  strokeWeight(2)
  noFill()
  rotateX(X)
  //rotateY(PI/2)



  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/2)
  // rotateX(mappers.fn(cos(time/2), -1, 1, -PI, PI, easing.easeInOutQuart)/8)
  // rotateZ(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)



  // sketch?.engine?.camera?.lookAt(-7.38, -486, 398)
  for (let z = 0; z < d; z++) {
    push()
    translate(0, map(z, 0, d-1, -h, h))
    rotateX(PI/2)
    rotateZ(-time/4)

    // const easingFunction = mappers.circularIndex(-time+z/100, easingFunctions)[1]

    const zR = mappers.fn(z, -10, d*1.4, .5, 20, easing.easeInExpo);
    const cc = map(z, 0, d-1, -PI, PI)/2

    let rr = map(z, 0, d-1, r, -r)
    rr = map(sin(cc+time), -1, 1, r, -r)
    rr = map(sin(cc+time+z*50), -1, 1, r, -r)

    const step = 50//map(z, 0, d-1, 45, 180)

    for (let a = 0; a < TAU; a += TAU / step) {
      //const easingFunction = mappers.circularIndex(-time+z/100, easingFunctions)[1]
      //rr = mappers.fn(z, 0, d-1, -r, r, easingFunction)
      //rr = mappers.fn(sin(a+time/100), -1, 1, -r, r, easingFunction)
      //const colorIndex = noise(a, z) * TAU
      const coco = (colors.rainbow({
        //hueOffset: map(sin(time+a/PI/2), -1, 1, 1, -1),
        hueOffset: a,
        hueIndex: z/2+a*8,//mappers.fn(colorIndex, 0, TAU, -PI, PI)*8,
        //opacityFactor: mappers.fn(sin(time*2+a*PI/3), -1, 1, 10, 1, easing.easeOutQuart),
        //opacityFactor: map(sin(z*a*2+time*3), -1, 1, 15, 1),
        //opacityFactor: map(sin(z*a*5+(z*sin(a+time))*3-time), -1, 1, 25, 1) + mappers.fn(z, 0, d-1, 0, 10, easing.easeInExpo),
        opacityFactor: map(sin(z*a+(a*sin(z+time))*3-time*3), -1, 1, 15, 0.5) + mappers.fn(z, 0, d-1, 0, 10, easing.easeInExpo),
        //opacityFactor: map(sin(z*25-a*4-time*3), -1, 1, 10, 1) + mappers.fn(z, 0, d-1, 0, 10, easing.easeInExpo),
      }))

      const position = createVector(sin(a) * r*zR/2, cos(a) * r*zR/2);

      push()
      translate(position )

      const aa = mappers.fn(cos(time+a), -1, 1, 1, 8)
      const bb = map(sin(time+a*3 ), -1, 1, 8, 1)
      const isVisible = a >= TAU*aa/8 || a < TAU*bb/8;

      if ( isVisible ) {
        // translate(
        //   sin(a)*2 * rr*zR/3,
        //   cos(a)*2 * rr*zR/3
        // )

        const s = map(sin(z*25-a+time*3), -1, 1, 10, 15)

        rotateY(-time+a+z/10)

        stroke(coco)

        const { levels: [ r, g, b ] } = coco;

        fill(color(r, g, b, 128))

        const d = noise(a, z+time, time) *75
        box(d,s)
      }
      else {
        stroke(coco)
        strokeWeight(6)
        point(0, 0)
      }
      pop()
    }
    
    pop()
  }

  //debug.webgl()

  orbitControl()
});
