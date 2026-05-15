import { string, sketch, animation, colors, mappers, easing } from './utils/index.js';

const canvases = {}

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
  type: '2d'
});

function drawShape( { canvas, depth = 60, points }) {
  canvas.background(0);
  canvas.push()

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    canvas.push();
    canvas.translate( 0, 0, mappers.fn(z, 0, depth, 0, -1350, easing.easeInSine_ ) )
    canvas.strokeWeight( 15 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length
      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;

      const opacityFactor = mappers.fn(
        Math.sin(depthProgression+animation.sinAngle*4),
          -1, 1,
          1.3, 1,
          easing.easeInExpo) * Math.pow(1.25, z);

      // const _color = colorFunction({
      //   hueOffset: (
      //     +animation.circularProgression
      //     +depthProgression/2
      //     +0
      //   ),
      //   hueIndex:mappers.fn(
      //     noise(
      //       (x/width)*3,//+mappers.circular(animation.progression, 0, 1, 0, 2, easing.easeInOutSine),
      //       (y/height)*2,
      //       depthProgression/2+mappers.circular(animation.progression, 0, 1, 0, 0.75, easing.easeInOutSine)
      //     ), 0, 1, -PI, PI)*10,
      //   opacityFactor,
      // });

      canvas.stroke(colorFunction({
        hueOffset: (
          // +depthProgression
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          +animation.circularProgression
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex: mappers.fn(noise(x/width, y/height+animation.circularProgression*1, depthProgression/2), 0, 1, -PI, PI)*14,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +x*Math.pow(1.1, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +y*Math.pow(1.12, z)
      )

      canvas.point(xx, yy)
    }

    canvas.pop()
  }
  canvas.pop()

  // canvas.orbitControl();
}

function drawShapeold( { canvas, depth = 60, text = "sydney" }) {
  canvas.background(0);

  const points = animation.ease({
    values: text.split("").map( text => (
      string.getTextPoints({
        text,
        position: createVector(0, 0),
        size: width/2,
        font: string.fonts.serif,
        sampleFactor: 0.5,
        simplifyThreshold: 0
      })
    )),
    lerpFn: mappers.lerpPoints,
    currentTime: animation.progression*text.length,
    easingFn: easing.easeInOutExpo
  })

  canvas.push()

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    canvas.push();
    canvas.translate( 0, 0, mappers.fn(z, 0, depth, 0, -1350, easing.easeInExpo_ ) )
    canvas.strokeWeight( 15 )

    for (let i = 0; i < points.length; i++) {
      //const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;

      const opacityFactor = mappers.fn(
        sin(depthProgression*2*PI, easing.easeInOutExpo),
          -1, 1,
          1.25, 1
        ) * Math.pow(1.3, z);

      canvas.stroke(colorFunction({
        hueOffset: (
          // +depthProgression
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          +animation.circularProgression
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex: mappers.fn(noise(x/width, y/height+animation.circularProgression*1, depthProgression/2), 0, 1, -PI, PI)*14,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +x*Math.pow(1.1, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +y*Math.pow(1.12, z)
      )

      canvas.point(xx, yy)
    }
    canvas.pop()
  }
  canvas.pop()

  // canvas.orbitControl();
}

function drawMask(canvas, step = 1/100) {
  const radius = width /2-20;

  for (let index = 0; index < 1+step; index += step) {
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
    //     values: [radius, radius/12],
    //     currentTime: (
    //       +index/step
    //       +x/width
    //       +y/height
    //       +animation.time*6
    //     ),
    //     // easingFn: easing.easeInOutSine
      // })
    // );
  }
}

sketch.draw((time, _, favoriteColor) => {
  noSmooth();

  // drawShape( {
  //   canvas: canvases.buffer,
  //   depth: 10
  // })

  const text = "sydney";

  const shapePoints = animation.ease({
    values: text.split("").map( text => (
      string.getTextPoints({
        text,
        position: createVector(0, 0),
        size: width/2,
        font: string.fonts.martian,
        sampleFactor: .5,
        simplifyThreshold: 0
      })
    )),
    lerpFn: mappers.lerpPoints,
    currentTime: animation.progression*text.length,
    easingFn: easing.easeInOutElastic,
    // easingFn: easing.easeInOutExpo
  })

  drawShape( {
    canvas: canvases.buffer,
    points: shapePoints,
    depth: 2,
    text
  })

  // Display buffer
  image(canvases.buffer, 0, 0, width, height);

  // Display buffer on pixelated canvas
  canvases.pixilated.image(canvases.buffer.get(), 0, 0, width, height);

  // Clean mask
  canvases.mask.erase();
  canvases.mask.rect(0, 0, width, height);
  canvases.mask.noErase();

  canvases.mask.beginShape();
  drawMask(canvases.mask, 0.1)
  canvases.mask.endShape(CLOSE);

  const masked = canvases.pixilated.get()
  
  masked.mask(canvases.mask);
  image(masked, 0, 0);

  // image(canvases.pixilated, 0, 0, width, height);

  noFill();
  strokeWeight(2);
  stroke(favoriteColor);

  beginShape()
  drawMask(window);
  endShape();

  // canvases.pixilated.pixelDensity(mappers.circularIndex(time, [1, 1, 0.1, 0.05, 0.025, 0.085]))

});
