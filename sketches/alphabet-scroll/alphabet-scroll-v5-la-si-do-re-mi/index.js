import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

// let slider;

sketch.setup( () => {
  // slider = createSlider(0, 1, 0.5, 0.01);
}, { type: "webgl" } );
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
// alphabet = ["un", "deux", "trois"]
alphabet = [ "do", "ré", "mi", "fa", "sol", "la", "si", "do"]

const notes = [ "c3", "d3", "e3", "f3", "g3", "a3", "b3", "c4"]

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  const W = width/2;
  const H = height/2

  const xProgression = mappers.fn(sin(time), -1, 1, 0, 1, easing.easeInOut_);
  // const xProgression = slider.value()
  const pointsProgression = map(xProgression, 0, 1, 0, alphabet.length-1);

  const margin = 100;
  const triangleUnit = -50;

  if (currentIndex !== Math.round(pointsProgression)) {
    currentIndex = Math.round(pointsProgression)

    const note = notes[currentIndex];

    midi.off(note)
    midi.play(note)
  }

  drawSlider(
    xProgression,
    createVector(-W+margin, H-margin, 50),
    createVector(W-margin, H-margin, 50),
    alphabet.length-1,
    (index, position, ) => {
      string.write(alphabet[index], position.x, position.y, {
        // showBox: true,
        // showLines: true,
        center: true,
        size: 48,
        // stroke: 255,
        // strokeWeight: 1,
        fill: lerpColor(
          color(255),
          color(128, 128, 255),
          mappers.fn(
            abs(pointsProgression-index),
            1.75, 0,
            0, 1,
            easing.easeInOutExpo
          )
        ),
        font: string.fonts.martian
      })
    },
    position => {
      strokeWeight(2)
      // point(position.x, position.y)
    
      beginShape()

      // vertex(position.x, position.y+triangleUnit)
      vertex(position.x+triangleUnit, position.y-triangleUnit)
      vertex(position.x-triangleUnit, position.y-triangleUnit)

      vertex(position.x-triangleUnit, position.y+triangleUnit)
      vertex(position.x+triangleUnit, position.y+triangleUnit)
    
      endShape(CLOSE)    
    }
  )

  const size = width/4;
  const font = string.fonts.sans;

  const sampleFactor = .1;
  const simplifyThreshold = 0;
  const textPosition = createVector(0, 0);

  const values = alphabet.map( text => (
    getTextPoints({
      text,
      position: textPosition,
      size,
      font,
      sampleFactor,
      simplifyThreshold
    })
  ))

  const points = animation.ease({
    values,
    duration: 1,
    lerpFn: lerpPoints,
    currentTime: pointsProgression,
    easingFn: easing.easeInOutExpo
  })

  push()
  
  const depth = 20

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    push();
    translate( 0, 0, map(z, 0, depth, 0, -50 ) )

    // strokeWeight( mappers.fn(z, 0, depth, 10, 5, easing.easeInOutExpo) )
    strokeWeight( map(z, 0, depth, 10, 50) )
    // strokeWeight( 10 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;
      const opacityFactor = mappers.fn(sin(depthProgression*2+xProgression*PI/2, easing.easeInOutExpo), -1, 1, 1.75, 1) * Math.pow(1.075, z);

      stroke(colorFunction({
        hueOffset: (
          // +depthProgression*10
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          // +time
          +0
        ),
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*1.2,
        hueIndex:mappers.fn(noise(x/width, y/height, depthProgression/10), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +x*Math.pow(1.05, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +y*Math.pow(1.1, z)
      )

      point(xx, yy)
    }
    pop()
  }
  pop()

  orbitControl();
});
