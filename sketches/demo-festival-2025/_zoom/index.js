import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup(() => {
  p5.disableFriendlyErrors = true;
  frameRate(25)
  pixelDensity(1)
}, { type: "webgl", width: 1080, height: 1920} );

events.register( "post-setup", midi.setup );

function drawRangeSlider({from, to}, start, end, steps = 26, stepDrawer, rangeDrawer) {
  const fromPosition = p5.Vector.lerp( start, end, from )
  const toPosition = p5.Vector.lerp( start, end, to )

  rangeDrawer?.(fromPosition, toPosition)

  for (let i = 0; i <= steps; i++) {
    const currentStepPosition = p5.Vector.lerp( start, end, i/steps );

    if (i === 0 || i === ~~(steps/2) || i === steps) {
      strokeWeight(15)
    }
    else {
      strokeWeight(8.5)
    }

    stepDrawer?.(i, currentStepPosition, fromPosition, toPosition )
  }
}

// let currentIndex = -1;

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))

// alphabet = "text-scroll-?".toUpperCase().split("")
// alphabet = "salsa-bachata".toUpperCase().split("")
// alphabet = "test".split("")
// alphabet = "0123456789".split("")
alphabet = "demofestival".split("")

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  const W = width/2;
  const H = height/2

  const margin = 50;
  const triangleHeight = 30;
  const triangleWidth = 20;

  // if (currentIndex !== Math.round(pointsProgression)) {
  //   currentIndex = Math.round(pointsProgression)
  //   // console.log(currentIndex, notes[currentIndex]);
  //   // midi.stop();
  //   // midi.play("C3");
  //   midi.play("F2");
  //   // midi.play(notes[currentIndex]);
  // }

  // time = (frameCount / (25 * 5)) * PI;

  const animationProgression = map(time, 0, 10, 0, 1)*"demofestival".length

  const letterRange = 1;
  const letterSliderSpeed = animationProgression;
  // const letterSliderSpeed = map(mouseX, 0, width, 0, alphabet.length-1);
  
  const letterStartIndex = animation.ease({
    values: [0, ...Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index)],
    duration: 1,
    currentTime: letterSliderSpeed,
    // easingFn: easing.easeInOutExpo,
    easingFn: easing.easeOutSine
  });

  // const letterStartIndex = mappers.circular(letterSliderSpeed, Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index))
  // const letterEndIndex = mappers.circular(letterSliderSpeed+1, Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index + letterRange))

  const letterEndIndex = animation.ease({
    values: [0, ...Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index + letterRange)],
    duration: 2,
    currentTime: letterSliderSpeed,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInSine
  });

  const count = 60;
  const letterScale = 1.75;
  const letterSize = width/4;
  const letterMargin = margin+100;
  // const from = createVector(-W+letterMargin, 0);
  // const to = createVector(W-letterMargin, 0);

  const from = createVector(0, 0, -W*2);
  const to = createVector(0, 0, 0);

  for (let t = 0; t < count; t++) {
    const horizontalProgression = t/count;
    const horizontalPolarProgression = map(t/count, 0, 1, -PI/2, PI/2);
    const pointsProgression = map(horizontalProgression, 0, 1, letterStartIndex, letterEndIndex);

    const points = animation.ease({
      values: alphabet.map( text => (
        string.getTextPoints({
          text,
          size: letterSize,
          position: center,
          sampleFactor: .34,
          simplifyThreshold: 0,
          font: string.fonts.sans
        })
      )),
      duration: 1,
      lerpFn: mappers.lerpPoints,
      // currentTime: time+horizontalProgression,
      currentTime: pointsProgression,
      easingFn: easing.easeInOutSine
    // easingFn: easing.easeInOutExpo,
    })

    push();
    // rotateX(mappers.fn(sin(time*3), -1, 1, -PI, PI, easing.easeInOutSine)/16)
    // rotateZ(mappers.fn(cos(time*2), -1, 1, -PI, PI, easing.easeInOutQuad)/16)
    translate( p5.Vector.lerp(from, to, horizontalProgression) )


    // rotateY(PI/3)
    strokeWeight( 5 )
    // strokeWeight( mappers.fn(horizontalProgression, 0, 1, 1, 8 , easing.easeInExpo) )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;
      // const opacityFactor = mappers.fn(sin(-time*3+progression*horizontalPolarProgression*5), -1, 1, 4, 1, easing.easeInOutExpo);

      stroke(colorFunction({
        hueOffset: (
          // +horizontalProgression
          // +time
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI),
        hueIndex: mappers.fn(sin(
          +progression*3
          +pointsProgression
          // +horizontalProgression
          // +time/4
          +animationProgression/2
          +x/width/5
          +y/height
        ), -1, 1, -PI, PI)*3,
        // hueIndex: mappers.fn(noise(x/width*3, y/height*3, horizontalProgression), 0, 1, -PI, PI)*12,
        // opacityFactor,
        // opacityFactor: mappers.fn(horizontalProgression, 0, 1, 6, 1/2, easing.easeInExpo),
        // opacityFactor: mappers.fn(sin(horizontalProgression+time*4), -1, 1, 16, 1, easing.easeInOutExpo),
        opacityFactor: mappers.fn(horizontalProgression, 0, 1, 18, 1, easing.easeInOutExpo),
      }))

      const scale = mappers.fn(horizontalProgression, 0, 1, 18, 1, easing.easeInCubic)

      point(
        x*scale,
        y*scale
      )
      // point(x*letterScale, y*letterScale)
    }

    pop()
  }

  drawRangeSlider(
    {
      from: letterStartIndex/(alphabet.length-1),
      to: letterEndIndex/(alphabet.length-1)
    },
    createVector(-W+margin, H-margin, 0),
    createVector(W-margin, H-margin, 0),
    alphabet.length-1,
    ( index, position, fromPosition, toPosition ) => {
      // const inside = index >= letterStartIndex && index <= letterEndIndex+1
      const inside = Math.round(position.x) >= Math.round(fromPosition.x) && Math.round(position.x) <= Math.round(toPosition.x)

      string.write(alphabet[index], position.x, position.y, {
        // showBox: true,
        // showLines: true,
        center: true,
        size: 36,
        // stroke: 255,
        // strokeWeight: 1,
        fill: inside ? color( 128, 128, 255 ) : 255,
        font: string.fonts.martian
      })
    },
    ( fromPosition, toPosition ) => {
      strokeWeight(2)
      
      beginShape()
      vertex(fromPosition.x-triangleWidth, fromPosition.y-triangleHeight)
      vertex(fromPosition.x-triangleWidth, fromPosition.y+triangleHeight)

      vertex(toPosition.x+triangleWidth, toPosition.y+triangleHeight)
      vertex(toPosition.x+triangleWidth, toPosition.y-triangleHeight)
    
      endShape(CLOSE)
    }
  )

  orbitControl();
});
