import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});
// sketch.setup();

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(text, fontFamily, "text-points")

  return cache.store( textPointsCacheKey, () => {
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
  });
}

function lerpPoints(from, to, amount, fn) {
  return to.map( (point, index) => {
    const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

    return p5.Vector.lerp( to[index], from[targetIndex], amount )
  })

  return from.map( (point, index) => {
    const fromIndex = map(index, 0, 1, 0, from.length-1);
    const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

    return p5.Vector.lerp( from[index], to[targetIndex], amount )
  })
}

sketch.draw( (time) => {
  background(0);
  noFill()

  // translate(0, 0, -250)
  // translate(0, height /2)
  // rotateY(time*2)
  // rotateX(time)

  // rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/6)
  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  const speed = 0//time;
  const word = "aA"
  const size = 200;
  const font = string.fonts.sans;

  const sampleFactor = 0.2;
  const simplifyThreshold = 0;

  const currentLetterPoints = getTextPoints({
    text: mappers.circularIndex(speed, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: mappers.circularIndex(speed+1, word),
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  strokeWeight(2)

  const distance = 1000;

  // const [ from, to ] = [
  //   createVector(0, 0, distance/2),
  //   createVector(0, 0, -distance/2)
  // ]

  const [ from, to ] = [
    createVector(0, -height/4, 0),
    createVector(0, height/4, 0)
  ]
  const count = 6;

  // line(-width/2, from.y, width/2, from.y)
  // line(-width/2, to.y, width/2, to.y)
  // line(0, -height/2, 0, height/2)

  for (let n = 0; n < count; n += 1) {
    const amount = n / (count-1);
    const position = p5.Vector.lerp( from, to, amount );
    
    // stroke(colors.test({
    //   hueOffset: -time,
    //   hueIndex: amount*2,// +map(amount, 0, 1, -PI, PI),
    //   //opacityFactor: map(n, 0, count, 1, 5)
    // }))

    const p = animation.ease({
      values: [ 0, 1 ],
      currentTime: time+n/10,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      //easingFn: easing.easeInOutElastic,
      // lerpFn: p5.Vector.lerp,
      //startIndex: 0,
      // endIndex: 1
    })

    stroke(255)

    push()
    translate(position)

    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    beginShape(POINTS)
    points.forEach( ({x, y}) => {
      vertex(x, y)
    })
    endShape()

    pop()
  }

  orbitControl();
});
