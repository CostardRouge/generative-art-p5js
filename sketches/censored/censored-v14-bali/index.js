import { string, sketch, animation, colors, mappers, easing, cache } from './utils/index.js';

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

  // canvases.pixilated.pixelDensity(0.035)
}, {
  animation: {
    framerate: 60,
    duration: 6
  },
  type: '2d'
});

const text = "Bali"

function drawShape( { canvas, depth = 60, points }) {
  canvas.background(0);
  canvas.push()

  const xxs = [];
  const yys = [];

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    canvas.push();
    canvas.translate( 0, 0, mappers.fn(z, 0, depth, 0, -1350, easing.easeInSine_ ) )
    canvas.strokeWeight( 15 )

    for (let i = 0; i < points.length; i++) {
      //const progression = i / points.length
      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;

      const opacityFactor = mappers.fn(
        Math.sin(depthProgression+animation.sinAngle*4),
          -1, 1,
          1.3, 1,
          easing.easeInExpo) * Math.pow(1.25, z);

      const _color = colorFunction({
        hueOffset: (
          +animation.circularProgression
          +depthProgression/2
          +0
        ),
        hueIndex:mappers.fn(
          noise(
            (x/width)*3,//+mappers.circular(animation.progression, 0, 1, 0, 2, easing.easeInOutSine),
            (y/height)*2,
            depthProgression/2+mappers.circular(animation.progression, 0, 1, 0, 0.75, easing.easeInOutSine)
          ), 0, 1, -PI, PI)*10,
        opacityFactor,
      });

      const { levels: [r, g, b ] } = _color;

      if (1 || r >= 1 && g >= 1 && b >= 1) {
        canvas.stroke(_color)
        const xx = (
          x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
          +x*Math.pow(1.2, z)
        )
  
        const yy = (
          y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
          +y*Math.pow(1.0, z)
        )
  
        canvas.point(xx, yy)

        if (z === 0) {
          xxs.push(xx);
          yys.push(yy);
        }
      }
    }

    cache.set("minX", Math.min(...xxs) );
    cache.set("maxX", Math.max(...xxs) );
    cache.set("minY", Math.min(...yys) );
    cache.set("maxY", Math.max(...yys) );

    canvas.pop()
  }
  canvas.pop()

  // canvas.orbitControl();
}

function drawMask({ canvas, points }) {
  for (let index = 0; index < points.length; index++) {
    const { x, y } = points[index];
    canvas.vertex(
      x,
      y
    )
  }
}

sketch.draw((time, _, favoriteColor) => {
  noSmooth();

  const margin = 20;
  const levelsCount = 2
  const levelLength = 6
  // const maskPoints = animation.ease({
  //   values: cache.store(`points`, () => {
  //     return Array.from({length: levelsCount }).map( () => {
  //       return Array.from({length: levelLength }).map( () => (
  //         createVector(
  //           map(Number(Math.random().toPrecision(1)), 0, 1, margin, width-margin),
  //           map(Number(Math.random().toPrecision(1)), 0, 1, margin, height-margin),
  //         )
  //       ))
  //     })
  //   }),
  //   lerpFn: mappers.lerpPoints,
  //   currentTime: 0.5+animation.progression*levelsCount,
  //   easingFn: easing.easeInOutBack
  // })


  const maskPoints = [
    createVector(
      cache.get("minX") + width/2 -20,
      cache.get("minY") + height/2 +20
    ),
    createVector(
      cache.get("maxX") + width/2 -20,
      cache.get("minY") + height/2 -20
    ),
    createVector(
      cache.get("maxX") + width/2 +20,
      cache.get("maxY") + height/2 +20
    ),
    createVector(
      cache.get("minX") + width/2 +20,
      cache.get("maxY") + height/2 -20
    )
  ]

  drawShape( {
    canvas: canvases.buffer,
    depth: 30,
    text,
    points: animation.ease({
      values: text.split("").map( text => (
        string.getTextPoints({
          text,
          position: createVector(0, 0),
          size: width/3,
          font: string.fonts.agiro,
          sampleFactor: .5,
          simplifyThreshold: 0
        })
      )),
      lerpFn: mappers.lerpPoints,
      currentTime: animation.progression*text.length,
      easingFn: easing.easeInOutElastic
    })
  })

  // Display buffer
  image(canvases.buffer, 0, 0, width, height);

  // Display buffer on pixelated canvas
  canvases.pixilated.image(canvases.buffer.get(), 0, 0, width, height);

  canvases.pixilated.filter(GRAY)

  // Clean mask
  canvases.mask.erase();
  canvases.mask.rect(0, 0, width, height);
  canvases.mask.noErase();

  canvases.mask.beginShape();
  drawMask({
    canvas: canvases.mask,
    points: maskPoints
  })
  canvases.mask.endShape(CLOSE);
  
  ( masked = canvases.pixilated.get()).mask(canvases.mask);
  image(masked, 0, 0);

  // image(canvases.pixilated, 0, 0, width, height);

  noFill();
  strokeWeight(3);
  stroke(favoriteColor);

  const minX = cache.get("minX") + width/2 -20;
  const maxX = cache.get("maxX") + width/2 +20;
  const minY = cache.get("minY") + height/2 -20;
  const maxY = cache.get("maxY") + height/2 +20;

  line(minX, 0, minX, height)
  line(maxX, 0, maxX, height)

  line(0, minY, width, minY)
  line(0, maxY, width, maxY)

  beginShape(TESS)
  drawMask({
    canvas: window,
    points: maskPoints
  })
  endShape(CLOSE);

  // canvases.pixilated.pixelDensity(mappers.circularIndex(time, [1, 1, 0.1, 0.05, 0.025, 0.085]))

});
