import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup(undefined, { type: "webgl" } );
events.register( "post-setup", midi.setup );

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
  // return to.map( (point, index) => {
  //   const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

  //   return p5.Vector.lerp( to[index], from[targetIndex], amount )
  // })

  return from.map( (point, index) => {
    const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

    return p5.Vector.lerp( from[index], to[targetIndex], amount )
  })
}

function drawSlider(progression, start, end, steps = 26, stepDrawer, progressionDrawer) {
  const currentProgression = p5.Vector.lerp( start, end, progression )

  progressionDrawer?.(currentProgression)

  for (let i = 0; i <= steps; i++) {
    const currentStepPosition = p5.Vector.lerp( start, end, i/steps );

    if (i === 0 || i === ~~(steps/2) || i === steps) {
      strokeWeight(15)
    }
    else {
      strokeWeight(8.5)
    }

    stepDrawer?.(i, currentStepPosition)
  }
}

let currentIndex = -1;

let alphabet = "0123456789".split("")//Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
// alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
alphabet = ["un", "deux", "trois"]

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255)

  const W = width/2;
  const H = height/2

  const xProgression = mappers.fn(sin(time), -1, 1, 0, 1, easing.easeInOut_);
  const pointsProgression = map(xProgression, 0, 1, 0, alphabet.length-1);

  const margin = 100;
  const triangleUnit = -50;

  // console.log("pointsProgression", ~~(pointsProgression));


  if (currentIndex !== ~~(pointsProgression)) {
    // console.log("currentIndex", currentIndex);
    currentIndex = ~~pointsProgression


    midi.play("F2")
  }

  drawSlider(
    xProgression,
    createVector(-W+margin, H-margin, 50),
    createVector(W-margin, H-margin, 50),
    alphabet.length-1,
    (index, position, ) => {
      string.write(alphabet[index], position.x, position.y, {
        // showBox: true,
        center: true,
        showLines: true,
        size: 48,
        stroke: 255,
        strokeWeight: 2,
        fill: 0,
        fill: lerpColor(
          color(255),
          color(128, 128, 255),
          // abs(xProgression-index)
          mappers.fn(
            abs(pointsProgression-index),
            1.75, 0,
            0, 1,
            easing.easeInOutExpo
          )
        ),
        font: string.fonts.martian,
        // font: string.fonts.serif,
        // font: string.fonts.sans,
      })
    },
    position => {
      strokeWeight(2)
      // point(position.x, position.y)
    
      beginShape()

      vertex(position.x, position.y+triangleUnit)
      vertex(position.x-triangleUnit, position.y-triangleUnit)
      vertex(position.x+triangleUnit, position.y-triangleUnit)
    
      endShape(CLOSE)    
    }
  )

  return;

  const size = width/4;
  const font = string.fonts.martian;

  const sampleFactor = .1;
  const simplifyThreshold = 0;
  const textPosition = createVector(0, 0);

  const points = animation.ease({
    values: alphabet.map( text => (
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
    // currentTime: time,
    currentTime: pointsProgression,
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

  // rotateX(rX)
  // rotateY(rY)
  // rotateZ(rZ)
  
  const depth = 10

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    push();
    translate( 0, 0, map(z, 0, depth, 0, -500 ) )

    strokeWeight( mappers.fn(z, 0, depth, 10, 5, easing.easeInOutExpo) )
    strokeWeight( map(z, 0, depth, 10, 50) )
    // strokeWeight( 15 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.test;
      const opacityFactor = mappers.fn(sin(depthProgression*20+progression*10+xProgression*PI/2, easing.easeInOutExpo), -1, 1, 1.75, 1) * Math.pow(1.075, z);

      stroke(colorFunction({
        hueOffset: (
          // +depthProgression*10
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          // +time
          +0
        ),
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)/2,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*12,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        // +x*Math.pow(1.07, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        // +y*Math.pow(1.05, z)
      )

      point(xx, yy)
    }
    pop()
  }
  pop()

  orbitControl();
});
