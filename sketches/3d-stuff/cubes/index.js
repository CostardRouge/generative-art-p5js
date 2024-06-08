import { sketch, string, animation, mappers, easing, events, colors, cache, grid } from './utils/index.js';

//sketch.setup( undefined);
sketch.setup( undefined, { type: 'webgl'});

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

function cross( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

sketch.draw( (time, center) => {
  background(0);
  translate(-width / 2, -height / 2);

  const planesCount = 5;
  // const gap = 50;
  const gap = animation.ease({
    values: [ 25, 350, 100, 50],
    currentTime: time/2,
    duration: 1,
    easingFn: easing.easeInOutCubic,
    // easingFn: easing.easeInOutSine
  });
  const depth = planesCount

  // rotateX(time)
  // rotateY(time)
  // rotateZ(time)

  const hueSpeed = {
    x: 0,
    y: 0,
    z: -time/2,
  }

  const noiseSpeed = {
    x: 0,
    y: 0,
    z: -time/6,
    // z: map(sin(time/6), -1, 1, 1, 6),
  }

  const columns = 12;
  const rows = 12//mappers.circularIndex(time*2, [10, 12, 15])
  // const rows = animation.ease({
  //   values: [ 10, 15],
  //   currentTime: time/2,
  //   duration: 1,
  //   easingFn: easing.easeInOutCubic,
  //   // easingFn: easing.easeInOutSine
  // });
  // const columns = animation.ease({
  //   values: [ 10, 15],
  //   currentTime: time/2,
  //   duration: 1,
  //   easingFn: easing.easeInOutCubic,
  //   // easingFn: easing.easeInOutSine
  // });

  push()
    rectMode(CENTER);
    strokeWeight(2)
    translate(-center.x, -center.y)

    for (let z = 0; z < planesCount; z++) {
      translate(0, 0, -gap)
      // stroke(255)
      // stroke(128, 128, 255)

      drawGrid(columns, rows, (x, y, w, h) => {
        push()
        translate(x, y)

        const d = noise(
          x+noiseSpeed.x,
          y+noiseSpeed.y,
          z/100+noiseSpeed.z
        )

        fill(0)
  
        if (d > 0.5) {
          // circle(0, 0, 10)
          // cross(0, 0, 10)
          // const hue = noise(
          //   x/width+hueSpeed.x,
          //   y/height+hueSpeed.y,
          //   z/depth+hueSpeed.z
          // )
          // const tint = colors.rainbow({
          //   hueOffset: 0,
          //   hueIndex: map(hue, 0, 1, -PI, PI)*2,
          //   // hueIndex: TAU,
          //   //opacityFactor: map(hue, 0, 1, 2.1, 1 ),
          // })
          // stroke(tint)

          translate(0, 0, gap/2-gap)

          // stroke(255)
          // rect(x, y, w-10, h-10)
          box(w-10, h-10, gap-10)
        }
        pop()

      })
    }
  pop()

  return orbitControl()
});
