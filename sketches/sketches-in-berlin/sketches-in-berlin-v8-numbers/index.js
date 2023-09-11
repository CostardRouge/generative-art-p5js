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
  // const result = [];
  // const maxLength = Math.max(from.length, to.length);

  // for (let i = 0; i < maxLength; i++) {
  //   const lerpedVector = p5.Vector.lerp(
  //     from[i % from.length],
  //     to[i % to.length],
  //     amount
  //   );

  //   result.push(lerpedVector);
  // }

  // return result;

  const result = {};
  const maxLength = Math.max(from.length, to.length);

  for (let i = 0; i < maxLength; i++) {
    const lerpedVector = p5.Vector.lerp(
      from[i % from.length],
      to[i % to.length],
      amount
    );

    result[`${lerpedVector.x}${lerpedVector.y}`] = lerpedVector;
  }

  return Object.values(result);

  // return from.map( (point, index) => {
  //   const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

  //   return p5.Vector.lerp( from[index], to[targetIndex], amount )
  // })
}

function cross( { x, y, z }, size) {
  line(x - size/2, y -size/2, z, x + size/2, y +size/2, z)
  line(x + size/2, y -size/2, z, x - size/2, y +size/2, z )
}

function drawProgression(progression, start, end, steps = 0) {
  push()
  stroke(128, 128, 255)
  strokeWeight(15)
  // cross(start, 20)
  // cross(end, 20)

  // push()
  // translate(start)
  // point(0, 0)
  // pop()

  // push()
  // translate(end)
  // point(0, 0)
  // pop()

  // point(end.x, end.y, end.z)

  const currentProgression = p5.Vector.lerp( start, end, progression )

  strokeWeight(3.5)
  line(start.x, start.y, start.z, currentProgression.x, currentProgression.y, currentProgression.z)

  for (let i = 0; i <= steps; i++) {
    const currentStepPosition = p5.Vector.lerp( start, end, i/steps );

    if (i === 0 || i === ~~(steps/2) || i === steps) {
      strokeWeight(15)
    }
    else {
      strokeWeight(8.5)
    }

    push()
    translate(currentStepPosition)
    point(0, 0)
    pop()
  }
  pop()
}

function dottedLine(start, end, lineStrokeWeight = 3, dotStrokeWeight = 10 ) {
  push()
    strokeWeight(lineStrokeWeight)
    line(start.x, start.y, start.z, end.x, end.y, end.z)

    strokeWeight(dotStrokeWeight)

    push()
      translate(start.x, start.y, start.z)
      point(0, 0)
    pop()

    push()
      translate(end.x, end.y, end.z)
      point(0, 0)
    pop()
  pop()
}

sketch.draw( (time, center) => {
  background(0);
  stroke(128, 128, 255)

  const W = width/2;
  const H = height/2
  const D = (H*2+W*2)/2

  const xProgression = mappers.fn(sin(time*5), -1, 1, 0, 1, easing.easeInOutExp);
  const yProgression = mappers.fn(cos(time), -1, 1, 0, 1, easing.easeInOutExp);
  const zProgression = mappers.fn(sin(time+time), -1, 1, 0, 1, easing.easeInOutExp);

  const margin = 100;
  // X
  // drawProgression(xProgression, createVector(-W+margin, H-margin), createVector(W-margin, H-margin), 10 )
  // drawProgression(xProgression, createVector(-W+margin, -H+margin), createVector(W-margin, -H+margin), 10 )
  // drawProgression(xProgression, createVector(-W+margin, H-margin, -D), createVector(W-margin, H-margin, -D), 10 )
  // drawProgression(xProgression, createVector(-W+margin, -H+margin, -D), createVector(W-margin, -H+margin, -D), 10 )
  // // Y
  // drawProgression(yProgression, createVector(-W+margin, H-margin), createVector(-W+margin, -H+margin), 10 )
  // drawProgression(yProgression, createVector(+W-margin, H-margin), createVector(+W-margin, -H+margin), 10 )
  // drawProgression(yProgression, createVector(-W+margin, H-margin, -D), createVector(-W+margin, -H+margin, -D), 10 )
  // drawProgression(yProgression, createVector(+W-margin, H-margin, -D), createVector(+W-margin, -H+margin, -D), 10 )
  // // Z
  // drawProgression(zProgression, createVector(-W+margin, H-margin), createVector(-W+margin, H-margin, -D), 10 )
  // drawProgression(zProgression, createVector(W-margin, H-margin), createVector(W-margin, H-margin, -D), 10 )
  // drawProgression(zProgression, createVector(-W+margin, -H+margin), createVector(-W+margin, -H+margin, -D), 10 )
  // drawProgression(zProgression, createVector(W-margin, -H+margin), createVector(W-margin, -H+margin, -D), 10 )

  // const x = map(xProgression, 0, 1, -W, W)
  // const y = map(yProgression, 0, 1, H, -H)
  // const z = map(zProgression, 0, 1, 0, -D)


  // push()
  // const sphereSize = 150;
  // const spherePositionMargin = sphereSize// + margin;
  // const spherePosition = createVector(
  //   map(xProgression, 0, 1, -W+spherePositionMargin, +W-spherePositionMargin),
  //   map(yProgression, 0, 1, +H-spherePositionMargin, -H+spherePositionMargin),
  //   map(zProgression, 0, 1, -spherePositionMargin, -D+spherePositionMargin),
  // )

  // noFill()
  // strokeWeight(2)
  // translate(
  //   spherePosition.x,
  //   spherePosition.y,
  //   spherePosition.z
  // )
  // // sphere(100)
  // pop()

  // dottedLine(
  //   createVector(-W+sphereSize/2, spherePosition.y, spherePosition.z),
  //   createVector(W-sphereSize/2, spherePosition.y, spherePosition.z) 
  // )

  // dottedLine(
  //   createVector(spherePosition.x, H-sphereSize/2, spherePosition.z),
  //   createVector(spherePosition.x, -H+sphereSize/2, spherePosition.z) 
  // )

  // dottedLine(
  //   createVector(spherePosition.x, spherePosition.y, -sphereSize/2),
  //   createVector(spherePosition.x, spherePosition.y, -D+sphereSize/2) 
  // )

  const size = width/2;
  const font = string.fonts.sans;

  const sampleFactor = .1;
  const simplifyThreshold = 0;
  const textPosition = createVector(0, 0);

  const points = animation.ease({
    values: "0123456789".split("").map( text => (
      getTextPoints({
        text,
        position: textPosition,
        size,
        font,
        sampleFactor,
        simplifyThreshold
      })
    )),
    duration: 1,
    lerpFn: lerpPoints,
    currentTime: time,
    easingFn: easing.easeInOutExpo
  })

  const { x: rX, y: rY, z: rZ } = animation.ease({
    values: [
      createVector(0, 0, 0),
      createVector(PI/5, 0, 0),
      createVector(-PI/5, PI/5, 0),
      // createVector(0, 0, PI/5),
      createVector(PI/4, PI/5),
      createVector(-PI/5, -PI/5, 0),
    ],
    duration: 1,
    currentTime: time,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutBack
  })

  push()

  rotateX(rX)
  rotateY(rY)
  rotateZ(rZ)
  
  const depth = 30

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    push();
    translate( 0, 0, map(z, 0, depth, 0, -500 ) )
    // translate( 0, 0, mappers.fn(depthProgression, 0, 1, -500, -1500, easing.easeInOutExpo) )

    // strokeWeight( mappers.fn(z, 0, depth, 10, 5, easing.easeInOutExpo) )
    // strokeWeight( map(z, 0, depth, 10, 50) )
    strokeWeight( 15 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;
      const opacityFactor = mappers.fn(sin(depthProgression*20+xProgression*PI/2, easing.easeInOutExpo), -1, 1, 1.75, 1) * Math.pow(1.1, z);

      stroke(colorFunction({
        hueOffset: (
          // +depthProgression*10
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          // +time
          +0
        ),
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex:mappers.fn(noise(x/width, y/height, depthProgression/2), 0, 1, -PI, PI)*12,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +x*Math.pow(1.15, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +y*Math.pow(1.05, z)
      )

      point(xx, yy)
    }
    pop()
  }
  pop()

  orbitControl();
});
