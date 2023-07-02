import { sketch, string, mappers, easing, events, colors, cache, grid } from './utils/index.js';

//sketch.setup( undefined);
sketch.setup( undefined, { type: 'webgl'});

events.register("engine-window-preload", () => {
  cache.store("image", () => loadImage( "img.png" ))
});

function drawGrid(xCount, yCount, handler) {
  const xSize = width / xCount;
  const ySize = height / yCount;



  const offset = 0;

  for (let x = offset; x < xCount - offset; x++) {
    for (let y = offset; y < yCount - offset; y++) {
      stroke(255)
      hl(y * ySize)
      vl(x * xSize)

      handler?.(
        x * xSize+xSize/2,
        y * ySize+ySize/2,
        xSize,
        ySize
      )
    }
  }

  stroke(255)
  hl(height)
  vl(width)
}

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

sketch.draw( (time, center) => {
  background(0);

  const planesCount = 5;
  const gap = 100;
  const depth = planesCount

  //rotateX(time)
  //rotateY(time)
  //rotateZ(time)

  const hueSpeed = {
    x: 0,
    y: 0,
    //z: -time/2,
  }

  const noiseSpeed = {
    x: 0,
    y: 0,
    z: -time/2,
  }

  push()
    rectMode(CENTER);
    strokeWeight(2)
    translate(-center.x, -center.y)

    for (let z = 0; z < planesCount; z++) {
      translate(0, 0, -gap)
      stroke(255)

      drawGrid(12, 12, (x, y, w, h) => {
        push()
        translate(x, y, gap/2-gap)

        const d = noise(
          x+noiseSpeed.x,
          y+noiseSpeed.y,
          z/100+noiseSpeed.z
        )
        const hue = noise(
          x/width+hueSpeed.x,
          y/height+hueSpeed.y,
          z/depth+hueSpeed.z
        )
  
        if (d > 0.5) {
          const coco = colors.rainbow({
            hueOffset: 0,
            hueIndex: map(hue, 0, 1, -PI, PI)*2,
            opacityFactor: map(hue, 0, 1, 2.1, 1 ),
          })

          fill(0)
          fill(coco)
          stroke(255)
          // rect(x, y, w-10, h-10)
          box(w-10, h-10, gap-10)
        }
        pop()

      })
    }
  pop()

  return orbitControl()

  // push()
  //   noFill( )
  //   stroke(64, 64, 128)
  //   strokeWeight(2)
  //   drawBackgroundPattern(time, 10, 15);
  // pop()

  const speed = time//2;
  const duration = 1;
  const word = "*"//"÷æ«$©®…ø†¥ø&%+#$@!*";
  const size = 950;
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)
  const nextLetter = mappers.circularIndex(speed+1, word)

  const sampleFactor = 0.8//mappers.circularIndex(time, [0.5, 0.1, 0.25]);
  const simplifyThreshold = 0//mappers.circularIndex(time*5, [0.001, 0]);

  const currentLetterPoints = getTextPoints({
    text: currentLetter,
    position: createVector(0, 0),
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  // const nextLetterPoints = getTextPoints({
  //   text: nextLetter,
  //   position: createVector(0, 0),
  //   size,
  //   font,
  //   sampleFactor,
  //   simplifyThreshold
  // })

  stroke(0, 0, 255)
  strokeWeight(4)

  for (let i = 0; i < currentLetterPoints.length; i++) {
    const progression = map(i, 0, currentLetterPoints.length-1, 0, 1);
    // const targetIndex = ~~map(i, 0, currentLetterPoints.length-1, 0, nextLetterPoints.length-1, true);

    // const { x, y } = animation.ease({
    //   values: [ currentLetterPoints[i], nextLetterPoints[targetIndex] ],
    //   currentTime: speed,
    //   duration: duration,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutElastic,
    //   lerpFn: p5.Vector.lerp,
    //   startIndex: 0,
    //   endIndex: 1
    // })

    const { x, y } = currentLetterPoints[i]

    let colorFunction = mappers.circularIndex(time/4+progression, [
      colors.rainbow,
      //colors.test
    ]);

    if (i == currentLetterPoints.length-1) {
      //colorFunction = colors.rainbow;
    }

    noFill()
    stroke(colorFunction({
      hueOffset: time,
      hueIndex: mappers.fn(progression, 0, 1, -PI, PI, easing.easeInCubic),
      opacityFactor: map(sin(-progression*100+time*2), -1, 1, 3, 1),
      opacityFactor: mappers.fn(
        sin(-progression*100+time*2),
        -1,
        1,
        mappers.fn(cos(progression*50+time*3), -1, 1, 5, 1, easing.easeInCubic),
        1,
        easing.easeInSine
      ),
    }))
    
    let amt = mappers.circularIndex(time/2+progression, [, 2, 3, 5, 7]);
    amt = mappers.circularIndex(time/6+progression, [,5]);
    const size = mappers.circularIndex(time/3+progression, [30, 50]);

// rotateX(mappers.fn(cos(t+x/cols), -1, 1, -PI, PI, easing.easeInOutQuart))
    const a = mappers.fn(sin(time+progression), -1, 1, -PI, PI, easing.easeInOutSine)/3

    push()
    translate(
      x*2,
      y*2
    )
    rotate(-time+progression);
    //rotate(progression*a*amt);


    const img = cache.get("image");

    //image(img, 0, 0, size, size )

    flower(size, amt)
    //huriken(size, 7)
    pop()
  }

});
