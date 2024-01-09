import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

// let slider;

sketch.setup( () => {
  // slider = createSlider(0, 1, 0.5, 0.01);
}, { type: "webgl" } );
events.register( "post-setup", midi.setup );

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

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))

// alphabet = "text-scroll-?".toUpperCase().split("")
// alphabet = "salsa-bachata".toUpperCase().split("")
alphabet = "2024".split("")

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  const W = width/2;
  const H = height/2

  // const xProgression = slider.value()
  const xProgression = mappers.fn(cos(time/3), -1, 1, 0, 1, easing.easeInOutElastic_ );
  const pointsProgression = map(xProgression, 0, 1, 0, alphabet.length-1);

  const margin = 100;
  const triangleHeight = 50;
  const triangleWidth = triangleHeight;

  if (currentIndex !== Math.round(pointsProgression)) {
    currentIndex = Math.round(pointsProgression)
    // console.log(currentIndex, notes[currentIndex]);
    // midi.stop();
    // midi.play("C3");
    midi.play("F2");
    // midi.play(notes[currentIndex]);
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
      vertex(position.x+triangleWidth, position.y-triangleHeight)
      vertex(position.x-triangleWidth, position.y-triangleHeight)

      vertex(position.x-triangleWidth, position.y+triangleHeight)
      vertex(position.x+triangleWidth, position.y+triangleHeight)
    
      endShape(CLOSE)    
    }
  )

  const size = width/2;

  push()
  
  const depth = 1;
  const count = 150;
  const from = createVector(-W+margin*3, 0, -0);
  const to = createVector(W-margin*3, 0, 0);

  for (let t = 0; t < count; t++) {
    const horizontalProgression = t/count;
    const horizontalPolarProgression = map(t/count, 0, 1, -PI/2, PI/2);
    // const pointsProgression = map(horizontalProgression, 0, 1, 0, alphabet.length-1);

    const points = animation.ease({
      values: alphabet.map( text => (
        string.getTextPoints({
          text,
          position: center,
          size,
          // size: map(cos(horizontalPolarProgression), -1, 1, 100, 800),
          font: string.fonts.sans,
          sampleFactor: .1/2,
          simplifyThreshold: 0
        })
      )),
      duration: 1,
      lerpFn: mappers.lerpPoints,
      currentTime: time+horizontalProgression,
      // currentTime: time+xProgression,
      currentTime: pointsProgression+horizontalProgression,
      easingFn: easing.easeInOutExpo
    })

    push();
    translate( p5.Vector.lerp(from, to, horizontalProgression) )

    for (let z = 0; z < depth; z++) {
      const depthProgression = -(z/depth)
  
      translate( 0, 0, map(z, 0, depth, 0, -500 ) )
  
      // strokeWeight( mappers.fn(z, 0, depth, 10, 5, easing.easeInOutExpo) )
      // strokeWeight( map(z, 0, depth, 10, 50) )
      // strokeWeight( 15 )
      strokeWeight( 5 )
  
      for (let i = 0; i < points.length; i++) {
        const progression = i / points.length
        // translate( 0, 0, map(z, 0, depth, 0, -100*sin(time*8+progression+depthProgression) ) )
        translate( 0, 0, 2*sin(time+progression) )
  
        const { x, y } = points[i];  
        const colorFunction = colors.rainbow;
        const opacityFactor = mappers.fn(sin(progression*10+xProgression*PI/2, easing.easeInOutExpo), -1, 1, 1.75, 1) * Math.pow(1.075, z);
  
        stroke(colorFunction({
          hueOffset: (
            // +horizontalProgression
            // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
            // +time
            +0
          ),
          // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI),
          // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*12,
          // hueIndex: mappers.fn(noise(x/width+time/10, y/height, progression/10+depthProgression/3), 0, 1, -PI, PI)*12,
          hueIndex: mappers.fn(noise(x/width+xProgression, y/height+xProgression, horizontalProgression/3), 0, 1, -PI, PI)*12,
          opacityFactor,
          // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
        }))
  
        const xx = (
          x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
          +x*Math.pow(1.15, z)
        )
  
        const yy = (
          y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
          +y*Math.pow(1.1, z)
        )
  
        point(xx, yy)
  
        // push()
        // box()
        // pop()
      }
    }
    pop()
  }

  pop()

  orbitControl();
});
