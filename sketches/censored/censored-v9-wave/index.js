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

  canvases.pixilated.pixelDensity(0.06)
}, {
  animation: {
    framerate: 60,
    duration: 6
  },
  type: '2d'
});

function drawShape( { canvas, depth = 60, text = "sinewave" }) {
  canvas.background(0);

  const points = animation.ease({
    values: text.split("").map( text => (
      string.getTextPoints({
        text,
        position: createVector(0, 0),
        size: width/1.75,
        font: string.fonts.sans,
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
          // +depthProgression*10
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          +animation.time
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex: mappers.fn(noise(x/width, y/height+animation.time*1, depthProgression/2), 0, 1, -PI, PI)*14,
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

function wave(canvas, step = 1/100) {
  const values = [
    height*1/6,
    // height*3/6,
    height*5/6
  ]

  for (let index = 0; index < 1; index += step) {
    canvas.vertex(
      (index/1) * width,
      animation.ease({
        values,
        currentTime: (
          +index
          +animation.time*6
        ),
        easingFn: easing.easeInOutSine
      })
    );
  }
}

sketch.draw((time, _, favoriteColor) => {
  noSmooth();

  drawShape( {
    canvas: canvases.buffer,
    depth: 10
  })

  image(canvases.buffer, 0, 0, width, height);
  canvases.pixilated.image(canvases.buffer.get(), 0, 0, width, height);

  canvases.mask.erase();
  canvases.mask.rect(0, 0, width, height);
  canvases.mask.noErase();

  canvases.mask.beginShape();

  wave(canvases.mask)

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
  wave(window);
  endShape();


  // canvases.pixilated.pixelDensity(mappers.circularIndex(time, [1, 1, 0.1, 0.05, 0.025, 0.085]))

});
