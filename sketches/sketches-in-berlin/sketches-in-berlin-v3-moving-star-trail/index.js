import { sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup(undefined, { type: "webgl" } );

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

function cross( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

sketch.draw( (time, center) => {
  background(0);

  const W = width/2;
  const H = height/2
  const w = W/2;
  const h = H/2;

  // const positions = cache.store("positions", () => ([
  //   createVector(-W+w, -H+h),
  //   createVector(W-w, -H+h),
  //   createVector(W-w, H-h),
  //   createVector(-W+h, H-h)
  // ]))

  // const rotations = cache.store("rotations", () => ([
  //   createVector(0, 0),
  //   createVector(0, PI, PI/2),
  //   createVector(-PI, PI, PI),
  //   createVector(-PI, PI*2, -PI/4)
  // ]))

  // push()
  // positions.forEach( ({x, y}) => {
  // stroke(128, 128, 255)
  //   strokeWeight(3)
  //   cross(x, y, 20)
  // })
  // pop()

  const size = width/2;
  const scale = 1.75;
  const font = string.fonts.sans;

  const sampleFactor = 0.15;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const points = getTextPoints({
    text: "*",
    // text: mappers.circularIndex(time+0.2, "abcd"),
    position: letterPosition,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })
  
  const depth = 15;

  for (let z = 0; z < depth; z++) {
    const indexDifferential = -(z/depth)/mappers.fn(sin(time*9), 0, depth, 1, 30, easing.easeInExpo);
    // const indexDifferential = -mappers.fn(z, 0, depth, 1, 3, easing.easeInExpo);

    // const { x, y } = animation.ease({
    //   values: positions,
    //   currentTime: time/2+indexDifferential,
    //   duration: 1,
    //   lerpFn: p5.Vector.lerp,
    //   easingFn: easing.easeInOutExpo,
    //   easingFn: easing.easeInOutElastic,
    //   easingFn: easing.easeInOutCirc,
    // });

    // const { x: rX, y: rY, z: rZ } = animation.ease({
    //   values: rotations,
    //   currentTime: time/2+indexDifferential,
    //   duration: 1,
    //   lerpFn: p5.Vector.lerp,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutElastic,
    //   // easingFn: easing.easeInOutCirc,
    // });

    // const elevation = animation.ease({
    //   values: [0, 300],
    //   currentTime: time+indexDifferential,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    // });

    const xx = map(sin(time), -1, 1, 1, 3)
    const yy = map(cos(time+indexDifferential), -1, 1, 1, 2)

    const polarPosition = createVector(
      w*sin(xx+time+indexDifferential),
      h*cos(yy+time),
    )

    strokeWeight(10)

    if ( z ===  0) {
      stroke(128, 128, 255)
      strokeWeight(8)
      cross(polarPosition.x, polarPosition.y, 20)
    }

    push();
    // strokeWeight(10)

    // translate( x, y, map(z, 0, depth, 0, -70) )
    translate( polarPosition.x, polarPosition.y, map(z, 0, depth, 0, -50) )
    // translate( 0, 0, elevation )
    // rotateX(rX)
    // rotateY(rY)
    // rotateZ(rZ/4)
    rotateZ(time+1.5*cos(time*2+indexDifferential))

    // strokeWeight( map(z, 0, depth, 10, 1) )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow
    
      stroke(colorFunction({
        // hueOffset: time+z/depth,
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        opacityFactor: mappers.fn(z, 0, depth, 1, 10, easing.easeInOutExpo),
        opacityFactor: mappers.fn(z, 0, depth, 1, 10, easing.d),
        // opacityFactor: map(sin(indexDifferential+progression*50+time*10-z*0.3), -1, 1, 20, 1),// * Math.pow(1.15, z),
        // opacityFactor: map(sin(progression*4+time*2-z/depth), -1, 1, 10, 1)// * Math.pow(1.15, z)
        // opacityFactor: mappers.fn(sin(progression*4+time*3-z/depth), -1, 1, 10, 1, easing.easeInOutSine) * Math.pow(1.15, z)
        // opacityFactor: mappers.fn(sin(time*3+indexDifferential), -1, 1, 20, 1, easing.easeInOutQuint)// * Math.pow(1.15, z)
      }))
      push()
      translate(
        x*scale*mappers.fn(z, 0, depth, 0, 1, easing.q),
        y*scale*mappers.fn(z, 0, depth, 0, 1, easing.q),
        // map(z, 0, depth, 0, -1000)
      )
      translate(
        x*scale,
        y*scale,
      )
      point(0, 0)
      pop()
    }
    pop()
  }

  orbitControl();
});
