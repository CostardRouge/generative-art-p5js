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
    if (progression) {
      point(0, 0)

    }
    point(0, 0)
    pop()
  }
  pop()
}

sketch.draw( (time, center) => {
  background(0);

  const W = width/2;
  const H = height/2

  const xProgression = mappers.fn(sin(time), -1, 1, 0, 1, easing.easeInOutBack);
  const yProgression = mappers.fn(cos(time*2), -1, 1, 0, 1, easing.easeInOutElasti);
  const zProgression = mappers.fn(sin(time+time), -1, 1, 0, 1, easing.easeInOutElasti);

  const margin = 100;

  drawProgression(xProgression, createVector(-W+margin, H-margin), createVector(W-margin, H-margin), 10 )
  drawProgression(yProgression, createVector(-W+margin, H-margin), createVector(-W+margin, -H+margin), 10 )
  drawProgression(zProgression, createVector(-W+margin, H-margin), createVector(-W+margin, H-margin, -H), 10 )

  const size = width/2;

  const sampleFactor = 0.05;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0);

  const points = animation.ease({
    values: [
      getTextPoints({
        text: "*",
        position: letterPosition,
        size,
        font: string.fonts.serif,
        sampleFactor,
        simplifyThreshold
      }),
      getTextPoints({
        text: "*",
        position: letterPosition,
        size,
        font: string.fonts.sans,
        sampleFactor,
        simplifyThreshold
      })
    ],
    duration: 1,
    lerpFn: lerpPoints,
    currentTime: 0,//yProgression,

  })

  push()

  rotateY(map(xProgression, 0, 1, PI/2, -PI/2)/6)
  rotateX(map(yProgression, 0, 1, PI/2, -PI/2)/6)
  rotateZ(map(zProgression, 0, 1, PI/2, -PI/2)/12)

  const depth = 150;

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    push();
    translate( 0, 0, map(z, 0, depth, 0, -1000 ) )
    // translate( 0, 0, mappers.fn(depthProgression, 0, 1, -500, -1500, easing.easeInOutExpo) )

    rotateZ(
      // time
      +PI/3*sin(xProgression/100+depthProgression/2)
      // +polarProgression2
      // *Math.pow(1.02, z/5)
      +0
    )

    strokeWeight( map(z, 0, depth, 50, 3) )
    // strokeWeight( 50 )

    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      const progression = i / points.length

      const colorFunction = mappers.circularIndex(
        constrain(xProgression, 0, 1)+progression+0.01
        , [
        colors.rainbow,
        colors.purple
      ])

      stroke(colorFunction({
        hueOffset: (
          +depthProgression*5
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          +time*2
          +0
        ),
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI),
        opacityFactor: map(depthProgression, 0, 1, 1.5, 1) * Math.pow(1.025, z)
      }))

      const xx = (
        x*1.75*mappers.fn(z, 0, depth, 1, -1, easing.s)
        +x*1.75
      )

      const yy = (
        y*1.75*mappers.fn(z, 0, depth, 1, -1, easing.s)
        +y*1.75
      )

      point(xx, yy)
    }
    pop()
  }
  pop()

  orbitControl();
});
