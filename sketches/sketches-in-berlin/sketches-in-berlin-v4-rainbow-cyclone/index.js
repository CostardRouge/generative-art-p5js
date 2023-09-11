import { sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup(undefined, { type: "webgl" } );

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(text, fontFamily, "text-points", sampleFactor)

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

function cross( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

sketch.draw( (time, center) => {
  background(0);

  const W = width/2;
  const H = height/2

  const sketchProgression = mappers.fn(sin(time), -1, 1, 0, 1, easing.easeInOutBack);
  const polarProgression = map(sketchProgression, 0, 1, -PI/2, PI/2);

  // const sketchProgression2 = mappers.fn(cos(time*3), -1, 1, 0, 1, easing.easeInOutSine);
  const sketchProgression2 = mappers.fn(cos(time), -1, 1, 0, 1, easing.easeInOutSine);
  const polarProgression2 = map(sketchProgression2, 0, 1, -PI/2, PI/2);


  const size = width/2;
  const scale = 1.75;
  const font = string.fonts.sans;

  const sampleFactor = 0.07;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const points = getTextPoints({
    text: "*",
    // text: mappers.circularIndex(time+0.2, "abcd"),
    // text: mappers.circularIndex(time+0.2, "+*"),
    position: letterPosition,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  push()
  rotateY(polarProgression/6)
  
  const depth = 250/8

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    push();
    translate( 0, 0, map(z, 0, depth, 0, -1500) )

    rotateZ(
      // time
      // mappers.fn(sin(polarProgression+depthProgression*3), -1, 1, -PI/3.3, PI/3.3, easing.easeInExpo)
      // +sin(polarProgression2+depthProgression*2)
      +PI/3*sin(polarProgression2+depthProgression*3)
      // +polarProgression2
      // *Math.pow(1.02, z/5)
      +0
    )

    // rotateZ(PI/4*sin(polarProgression2+depthProgression*3))
    // rotateZ(map(sin(time+depthProgression), 0, 1, -PI/4, PI/4))

    if ( z ===  0) {
      stroke(128, 128, 255)
      strokeWeight(5)
      cross(0, 0, 20)
    }

    strokeWeight( map(z, 0, depth, 50, 3) )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = mappers.circularIndex(
        constrain(sketchProgression, 0, 1)+progression
        , [
        colors.rainbow,
        colors.purple
      ])

      // const sa = 2//mappers.circular( progression, 0, 1/2, 1, 20)
      const sa = 1//mappers.fn( sin(sketchProgression+(progression/10)), -1, 1, 1, 2, easing.easeInExpo)
    
      stroke(colorFunction({
        hueOffset: (
          +depthProgression
          +0
        ),
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        // opacityFactor: mappers.fn(z, 0, depth, 1, 10, easing.easeInExpo),
        opacityFactor: mappers.fn(z, 0, depth, 1, 10, easing.easeInExpo) * Math.pow(1.025, z),
        // opacityFactor: mappers.fn(z, 0, depth, 1, 10, easing.d),
        // opacityFactor: mappers.fn(sin(indexDifferential+progression+time*20-z/4, easing.easeInOutExpo), -1, 1, 3, 1) * Math.pow(1.05, z),
        // opacityFactor: map(sin(progression*4+time*2-z/depth), -1, 1, 10, 1),// * Math.pow(1.15, z)
        // opacityFactor: mappers.fn(sin(progression*4+time*3-z/depth), -1, 1, 10, 1, easing.easeInOutSine) //* Math.pow(1.15, z)
        // opacityFactor: mappers.fn(sin(time+indexDifferential), -1, 1, 20, 1, easing.easeInOutQuint)// * Math.pow(1.15, z)
      }))

      const xx = (
        x*scale*mappers.fn(z, 0, depth, 1, -1, easing.s)
        + x*scale*sa
      )

      const yy = (
        y*scale*mappers.fn(z, 0, depth, 1, -1, easing.s)
        + y*scale*sa
      )
      // noStroke()
      point(xx, yy)

      // push()
      // translate(xx, yy)
      // point(0, 0)
      // // sphere(20, 10)
      // pop()
    }
    pop()
  }
  pop()

  orbitControl();

  push()
  const margin = 100;
  const start = createVector(-W+margin, H-margin)
  const end = createVector(W-margin, H-margin)

  stroke(128, 128, 255)
  strokeWeight(5)
  cross(start.x, start.y, 20)
  cross(end.x, end.y, 20)

  const currentProgression = p5.Vector.lerp( start, end, sketchProgression )

  strokeWeight(3.5)
  line(start.x, start.y, currentProgression.x, currentProgression.y)
  pop()

  push()
  const margin2 = 100;
  const start2 = createVector(-W+margin2, -H+margin2)
  const end2 = createVector(-W+margin2, H-margin2)

  stroke(128, 128, 255)
  strokeWeight(5)
  cross(start2.x, start2.y, 20)
  cross(end2.x, end2.y, 20)

  const currentProgression2 = p5.Vector.lerp( start2, end2, sketchProgression2 )

  strokeWeight(3.5)
  line(start2.x, start2.y, currentProgression2.x, currentProgression2.y)
  pop()

});
