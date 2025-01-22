import { string, sketch, animation, colors, mappers, easing } from './utils/index.js';

const canvases = {}
let masked = null;

sketch.setup(() => {
  canvases.buffer = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height,
    "webgl"
  );

  canvases.pixilated = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );

  canvases.mask = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );

  canvases.pixilated.pixelDensity(0.035)
}, {
  animation: {
    framerate: 60,
    duration: 12
  },
  type: 'webgl'
});

function drawShape( { canvas, depth = 3, text = "circle" }) {
  canvas.background(0);

  canvas.push()
  // canvas.translate(width/2, height/2)

  canvas.stroke(255)
  canvas.strokeWeight(1)
  //canvas.rotateX(-PI/1.1)
  // canvas.rotateX(-PI/2)

  const startHeight = -height/8
  const endHeight = height/8
  const depthCount = (abs(startHeight)+endHeight)

  // console.log({depthCount, startHeight, endHeight});
  

  for (let depthIndex = 0; depthIndex < depthCount; depthIndex += 1) {
    const depthProgression = depthIndex/depthCount;

    canvas.push()
    // canvas.translate(
    //   p5.Vector.lerp(
    //     createVector(0, -height/9),
    //     createVector(0, height/9),
    //     depthProgression
    //   )
    // );
    canvas.translate(
      0, map(depthProgression, 0, 1, startHeight, endHeight)
    );

    // const radius = map(
    //   noise(
    //     mappers.circular(depthIndex, 0, depthCount, 0, 1),
    //     depthProgression
    //   ),
    //   0, 1,
    //   50, 350
    // );

    const step = 1/60;

    for (let index = 0; index < 1+step; index += step) {
      const angle = TAU * index;
      const x = Math.sin(angle) * map(
        noise(
          depthProgression
        ),
        0, 1,
        50, 350
      );
      const z = Math.cos(angle) * map(
        noise( mappers.circular(angle, 0, TAU, 0, 1)+depthProgression+animation.time*18
        ),
        0, 1,
        50, 350
      );

      canvas.stroke(colors.rainbow({
        hueOffset: (
          +animation.circularProgression
          +0
        ),
        hueIndex: mappers.fn(noise(
          (
            +mappers.circular(x, -width/2, width/2, 0, 2)
          )*depthProgression*3,
          (
            +mappers.circular(z, -height/2, height/2, 0, 1)
          )+depthProgression*3,
          (
            // +animation.time*10
            +depthProgression*3
          )
        ), 0, 1, -PI/2, PI/2)*12,
        opacityFactor: 1,
      }))

      canvas.point(
        x,
        0,
        z
      )
    }

    canvas.pop()
  }
  // canvas.point(0, 0)
  canvas.pop()

  canvas.orbitControl()
}

function drawMask(canvas, step = 1/100) {
  const radius = width /2-20;

  for (let index = 0; index < 1+step; index += step) {
    // const radius = width /2-20;

    // const radius = animation.ease({
    //   values: [width /2-20, width /2-80],
    //   currentTime: (
    //     +index*40
    //     +animation.progression
    //   ),
    //   easingFn: easing.easeInOutSine
    // })
    const r = animation.ease({
      values: [radius, radius/12],
      currentTime: (
        +index
        +animation.progression*2
      ),
      easingFn: easing.easeInOutElastic
    })

    const angle = TAU * index;
    const x = width/2+sin(angle) * r;
    const y = height/2+cos(angle) * radius;

    canvas.vertex(
      x,
      y
    )

    // canvas.vertex(
    //   (index/1) * width,
    //   animation.ease({
    //     values,
    //     currentTime: (
    //       +index
    //       +animation.time*6
    //     ),
    //     // easingFn: easing.easeInOutSine
    //   })
    // );
  }
}

sketch.draw((time, _, favoriteColor) => {
  // noSmooth();

  drawShape( {
    // canvas: canvases.buffer,
    canvas: window,
    depth: 10
  })

  // Display buffer
  // image(canvases.buffer, 0, 0, width, height);
  //noLoop();

  return

  // Display buffer on pixelated canvas
  canvases.pixilated.image(canvases.buffer.get(), 0, 0, width, height);

  // Clean mask
  canvases.mask.erase();
  canvases.mask.rect(0, 0, width, height);
  canvases.mask.noErase();

  canvases.mask.beginShape();

  drawMask(canvases.mask, 0.1)

  canvases.mask.vertex(width, height);
  canvases.mask.vertex(0, height);
  canvases.mask.endShape(CLOSE);
  
  ( masked = canvases.pixilated.get()).mask(canvases.mask);
  image(masked, 0, 0);

  // image(canvases.pixilated, 0, 0, width, height);

  noFill();
  strokeWeight(2);
  stroke(favoriteColor);
  // line(0, y1, width, y2);

  beginShape()
  drawMask(window);
  endShape();


  // canvases.pixilated.pixelDensity(mappers.circularIndex(time, [1, 1, 0.1, 0.05, 0.025, 0.085]))

});
