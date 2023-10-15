import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup( () => {
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

let currentLeftHandIndex = -1;
let currentRightHandIndex = -1;

const text = [ "ch", "ro", "ma", "tic"]

const rightHandNotes = [
  /*'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', */'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5'
]

const leftHandNotes = [
  /*'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3', 'B2', 'A#2', */'A2', 'G#2', 'G2', 'F#2', 'F2', 'E2', 'D#2', 'D2', 'C#2', 'C2', 'B1', 'A#1', 'A1'
].reverse();

sketch.draw( (time, center) => {
  background(0);
  // stroke(128, 128, 255);🫲 🫱

  const W = width/2;
  const H = height/2

  const handsProgressionSpeed = time;
  const handsProgressionEasing = easing.easeInOutLinear;

  const textProgression = mappers.fn(sin(time), -1, 1, 0, 1, easing.easeInOut_);
  const textPointsProgression = map(textProgression, 0, 1, 0, text.length-1);

  const margin = 100;
  const triangleUnit = 25;

  const leftHandProgressionSpeed = mappers.fn(sin(handsProgressionSpeed-PI/2), -1, 1, 0, 1, handsProgressionEasing);
  const leftHandTick = map(leftHandProgressionSpeed, 0, 1, 0, leftHandNotes.length-1);

  if (currentLeftHandIndex !== Math.round(leftHandTick)) {
    currentLeftHandIndex = Math.round(leftHandTick)
    midi.play(leftHandNotes[currentLeftHandIndex])
  }

  const rightHandProgressionSpeed = mappers.fn(sin(handsProgressionSpeed+PI/2), -1, 1, 0, 1, handsProgressionEasing);
  const rightHandTick = map(rightHandProgressionSpeed, 0, 1, 0, leftHandNotes.length-1);

  if (currentRightHandIndex !== Math.round(rightHandTick)) {
    currentRightHandIndex = Math.round(rightHandTick)
    midi.play(rightHandNotes[currentRightHandIndex])
  }

  drawSlider(
    leftHandProgressionSpeed,
    createVector(-W+margin, -H+margin, 50),
    createVector(W-margin, -H+margin, 50),
    leftHandNotes.length-1,
    (index, position, ) => {
      string.write(leftHandNotes[index], position.x, position.y, {
        // showBox: true,
        // showLines: true,
        center: true,
        size: 32,
        // stroke: 255,
        // strokeWeight: 1,
        fill: lerpColor(
          color(255),
          color(128, 128, 255),
          mappers.fn(
            abs(leftHandTick-index),
            1.75, 0,
            0, 1,
            easing.easeInOutExpo
          )
        ),
        font: string.fonts.sans
      })
    },
    position => {
      strokeWeight(2)
      // point(position.x, position.y)
    
      noFill();
      beginShape()

      // vertex(position.x, position.y+triangleUnit)
      vertex(position.x+triangleUnit, position.y-triangleUnit)
      vertex(position.x-triangleUnit, position.y-triangleUnit)

      vertex(position.x-triangleUnit, position.y+triangleUnit)
      vertex(position.x+triangleUnit, position.y+triangleUnit)
    
      endShape(CLOSE)    
    }
  )

  drawSlider(
    rightHandProgressionSpeed,
    createVector(-W+margin, H-margin, 50),
    createVector(W-margin, H-margin, 50),
    rightHandNotes.length-1,
    (index, position, ) => {
      string.write(rightHandNotes[index], position.x, position.y, {
        // showBox: true,
        // showLines: true,
        center: true,
        size: 32,
        // stroke: 255,
        // strokeWeight: 1,
        fill: lerpColor(
          color(255),
          color(128, 128, 255),
          mappers.fn(
            abs(rightHandTick-index),
            1.75, 0,
            0, 1,
            easing.easeInOutExpo
          )
        ),
        font: string.fonts.sans
      })
    },
    position => {
      strokeWeight(2)
      // point(position.x, position.y)
    
      noFill();
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

  const points = animation.ease({
    values: text.map( text => (
      getTextPoints({
        text,
        position: center,
        size,
        font,
        sampleFactor: 0.1,
        simplifyThreshold: 0
      })
    )),
    duration: 1,
    lerpFn: lerpPoints,
    currentTime: textPointsProgression,
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
      const opacityFactor = mappers.fn(sin(depthProgression*2+textProgression*PI/2, easing.easeInOutExpo), -1, 1, 1.75, 1) * Math.pow(1.075, z);

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
