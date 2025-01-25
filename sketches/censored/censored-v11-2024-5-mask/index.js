import { string, sketch, animation, colors, mappers, easing } from './utils/index.js';

const canvases = {}
let masked = null;

sketch.setup(() => {
  canvases.background = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height,
    "webgl"
  );

  canvases.foreground = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height,
    "webgl"
  );

  canvases.mask = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );

  // canvases.foreground.pixelDensity(0.035)
}, {
  animation: {
    framerate: 60,
    duration: 12
  },
  size: {
    width: 1350,
    height: 1080
  },
  type: '2d'
});

let drawShapeNth = 0;

function drawShape( { canvas, depth = 1, points, position }) {
  if (!points) {
    return
  }

  canvas.push()

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    canvas.push();
    canvas.translate( position.x, position.y, mappers.fn(z, 0, depth, 0, -1000, easing.easeInExpo ) )
    canvas.strokeWeight( 5 )

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
          +animation.circularProgression
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex: mappers.fn(noise(x/width*2, y/height*3+animation.circularProgression*2, drawShapeNth/10+depthProgression), 0, 1, -PI, PI)*14,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +x*Math.pow(1.25, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +y*Math.pow(1.11, z)
      )

      canvas.point(xx, yy)
    }
    canvas.pop()
  }
  canvas.pop()

  // canvas.orbitControl();

  drawShapeNth++;
}

function drawMask(canvas, step = 1/100) {
  const radius = width/6;
  const margin = radius+50;
  const position = createVector(
    mappers.fn(Math.sin(animation.sinAngle*2), -1, 1, -width/2+margin, width/2-margin, easing.easeInOutSdine ),
    mappers.fn(Math.cos(animation.cosAngle*4), -1, 1, -height/2+margin, height/2-margin, easing.easeInOutSine )
  )

  position.add(width/2, height/2)

  for (let index = 0; index < 1+step; index += step) {
    const angle = TAU * index;
    const x = position.x + sin(angle) * radius;
    const y = position.y + cos(angle) * radius;

    canvas.vertex(
      x,
      y
    )
  }

  string.write("the past", position.x, position.y, {
    // showBox: true,
    // showLines: true,
    center: true,
    graphics: canvas,
    size: 72,
    stroke: color(128, 128, 360),
    strokeWeight: 1,
    fill: color(128, 128, 360),
    font: string.fonts.serif
  })
}

const columnCount = 6
const column = index => map(index + .5, 0, columnCount, -width / 2, width / 2)

window.column = column

sketch.draw((time, _, favoriteColor) => {
  noSmooth();

  for (let index = 0; index < columnCount; index++) {
    const x = column(index) + width/2;

    line( x, 0, x, height );
  }

  canvases.background.background(0);
  canvases.foreground.background(0);

  const textOptions = {
    position: createVector(0, 0),
    size: width/5.5,
    font: string.fonts.sans,
    sampleFactor: 0.35,
    simplifyThreshold: 0
  }

  const drawShapeOptions = {
    depth: 20
    // depth: 5
  }

  // Now: 2025
  drawShape( {
    position: createVector(column(1), 0),
    canvas: canvases.background,
    points: (
      string.getTextPoints({
        text: "2",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })
  drawShape( {
    position: createVector(column(2), 0),
    canvas: canvases.background,
    points: (
      string.getTextPoints({
        text: "0",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })
  drawShape( {
    position: createVector(column(3), 0),
    canvas: canvases.background,
    points: (
      string.getTextPoints({
        text: "2",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })
  drawShape( {
    position: createVector(column(4), 0),
    canvas: canvases.background,
    points: (
      string.getTextPoints({
        text: "5",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })

  drawShapeNth=0

  // Past: 2024
  drawShape( {
    position: createVector(column(1), 0),
    canvas: canvases.foreground,
    points: (
      string.getTextPoints({
        text: "2",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })
  drawShape( {
    position: createVector(column(2), 0),
    canvas: canvases.foreground,
    points: (
      string.getTextPoints({
        text: "0",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })
  drawShape( {
    position: createVector(column(3), 0),
    canvas: canvases.foreground,
    points: (
      string.getTextPoints({
        text: "2",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })
  drawShape( {
    position: createVector(column(4), 0),
    canvas: canvases.foreground,
    points: (
      string.getTextPoints({
        text: "4",
        ...textOptions
      })
    ),
    ...drawShapeOptions
  })

  canvases.foreground.filter(GRAY)

  // Display background
  image(canvases.background, 0, 0, width, height);

  // Clean mask
  canvases.mask.erase();
  canvases.mask.rect(0, 0, width, height);
  canvases.mask.noErase();

  canvases.mask.beginShape();

  drawMask(canvases.mask, 0.1)

  // canvases.mask.vertex(width, height);
  // canvases.mask.vertex(0, height);
  canvases.mask.endShape(CLOSE);
  
  ( masked = canvases.foreground.get()).mask(canvases.mask);

  image(masked, 0, 0);

  noFill();
  strokeWeight(2);
  stroke(favoriteColor);

  beginShape()
  drawMask(window);
  endShape();

  strokeWeight(2);
  stroke(favoriteColor);

  drawShapeNth=0
});
