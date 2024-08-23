import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', '', 'quatre-vingt', ''];
const scales = [
  [ 'centillion', 67 ],
  [ 'vigintillion', 64 ],
  [ 'novemdecillion', 61 ],
  [ 'octodecillion', 58 ],
  [ 'septen-decillion', 55 ],
  [ 'sexdecillion', 52 ],
  [ 'quindecillion', 49 ],
  [ 'quatttuor-decillion', 46 ],
  [ 'tredecillion', 43 ],
  [ 'duodecillion', 40],
  [ 'undecillion', 37 ],
  [ 'decillion', 34 ],
  [ 'nonillion', 31 ],
  [ 'octillion', 28 ],
  [ 'septillion', 25 ],
  [ 'sextillion', 22 ],
  [ 'quintillion', 19 ],
  [ 'quadrillion', 16 ],
  [ 'trillion', 13 ],
  [ 'milliard', 10 ],
  [ 'million', 7 ],
  [ 'mille', 4 ],
  [ 'cent', 3 ]
];

sketch.setup(() => frameRate(25), { type: "webgl", width: 1080, height: 1920} );

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

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
alphabet = "demofestival".split("")
alphabet = ["de", "mo", "fes", "ti", "val", "20", "25"]
alphabet = ["demo", "festival", "2025"]
alphabet = ["demo", "fes", "ti", "val", "2025"]

// alphabet = "123".split("")

// console.log(numberToFrench("1"));

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  const W = width/2;
  const H = height/2

  const margin = 75;
  const triangleHeight = 30;
  const triangleWidth = 20;

  const letterRange = 1;
  const letterSliderSpeed = time;
  
  const letterStartIndex = animation.ease({
    values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index),
    duration: 1,
    currentTime: letterSliderSpeed,
    // easingFn: easing.easeInOutExpo,
    easingFn: easing.easeOutSine
  });

  const letterEndIndex = animation.ease({
    values: Array(alphabet.length-letterRange).fill(undefined).map((_, index) => index + letterRange),
    duration: 2,
    currentTime: letterSliderSpeed,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInSine
  });

  push()
  // translate(-W/3, H/2)

  const count = 50;
  const letterScale = 1;
  const letterSize = width/3//1.5;
  const letterMargin = margin+100;
  // const from = createVector(-W+letterMargin, 0);
  // const to = createVector(W-letterMargin, 0);
  const from = createVector(0, -H+letterMargin);
  // const to = createVector(W-letterMargin, 0);
  const to = createVector(0, H-letterMargin);

  for (let t = 0; t < count; t++) {
    const horizontalProgression = t/count;
    const horizontalPolarProgression = map(t/count, 0, 1, -PI/2, PI/2);
    const pointsProgression = map(horizontalProgression, 0, 1, letterStartIndex, letterEndIndex);

    const points = animation.ease({
      values: alphabet.map( text => (
        string.getTextPoints({
          // text: numberToFrench(text),
          text: text,
          size: letterSize,
          position: center,
          sampleFactor: .1,
          simplifyThreshold: 0,
          font: string.fonts.sans
        })
      )),
      duration: 1,
      lerpFn: mappers.lerpPoints,
      // currentTime: time+horizontalProgression,
      currentTime: pointsProgression,
      easingFn: easing.easeInOutCubic
      // easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInOutBounce,
    })

    push();
    translate( p5.Vector.lerp(from, to, horizontalProgression) )
    // translate( 0, 0, mappers.fn(cos(horizontalPolarProgression), -1, 1, 0, -500, easing.easeInOutCubic) )

    // rotateZ(-PI/2)
    strokeWeight( 5 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;

      stroke(colorFunction({
        hueOffset: (
          // +horizontalProgression
          +time
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI),
        hueIndex: mappers.fn(noise(x*2/width+progression, y/height+horizontalProgression, horizontalProgression/3), 0, 1, -PI, PI)*8,
        opacityFactor: mappers.fn(cos(horizontalPolarProgression*2+time*5), -1, 1, 4, 10, easing.easeInOutExpo),
        opacityFactor: mappers.fn(sin(-time*3+progression*horizontalPolarProgression*3), -1, 1, 4, 1, easing.easeInOutExpo),
        // opacityFactor: mappers.circularPolar(t, 0, count, 1, 15, easing.easeInOutSine_)
      }))

      point(x, y)
      // point(x*letterScale, y*letterScale) 
    }

    pop()
  }

  pop()

  drawRangeSlider(
    {
      from: letterStartIndex/(alphabet.length-1),
      to: letterEndIndex/(alphabet.length-1)
    },
    // createVector(-W+margin, H-margin, 0),
    // createVector(W-margin, H-margin, 0),

    createVector(-W+margin, -H+margin, 0),
    createVector(-W+margin, H-margin, 0),
    alphabet.length-1,
    ( index, position, fromPosition, toPosition ) => {
      // const inside = index >= letterStartIndex && index <= letterEndIndex+1
      const inside = Math.round(position.y) >= Math.round(fromPosition.y) && Math.round(position.y) <= Math.round(toPosition.y)

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
      vertex(fromPosition.x+triangleWidth, fromPosition.y-triangleHeight)

      vertex(toPosition.x+triangleWidth, toPosition.y+triangleHeight)
      vertex(toPosition.x-triangleWidth, toPosition.y+triangleHeight)

      // vertex(fromPosition.x-triangleWidth, fromPosition.y-triangleHeight)
      // vertex(fromPosition.x-triangleWidth, fromPosition.y+triangleHeight)

      // vertex(toPosition.x+triangleWidth, toPosition.y+triangleHeight)
      // vertex(toPosition.x+triangleWidth, toPosition.y-triangleHeight)
    
      endShape(CLOSE)
    }
  )

  push()
  textAlign(RIGHT);

  const _from = alphabet?.[Math.round(letterStartIndex)] // numberToFrench(alphabet?.[Math.round(letterStartIndex)]
  const _to = alphabet?.[Math.round(letterEndIndex)] // numberToFrench(alphabet?.[Math.round(letterStartIndex)]

  string.write(_from, W-margin, -H+margin, {
    // showBox: true,
    // showLines: true,
    // center: true,
    size: 36,
    // stroke: 255,
    // strokeWeight: 1,
    fill: color( 128, 128, 255 ),
    font: string.fonts.martian
  })
  string.write(_to, W-margin, H-margin, {
    // showBox: true,
    // showLines: true,
    // center: true,
    size: 36,
    // stroke: 255,
    // strokeWeight: 1,
    fill: color( 128, 128, 255 ),
    font: string.fonts.martian
  })
  pop()

  orbitControl();
});
