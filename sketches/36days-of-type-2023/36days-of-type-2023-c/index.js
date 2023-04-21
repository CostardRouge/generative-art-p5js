import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(text, fontFamily, "text-points")

  return cache.store( textPointsCacheKey, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return textPoints.map( ({x, y}) => {
      const testPointVector = createVector(x, y);

      testPointVector.add((position.x-xCenter),(position.y-yCenter))

      return testPointVector;
    })
  });
}

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

function drawGrid(cols, time) {
  const rows = cols*height/width;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols: ~~cols,
    centered: true
  }

  const W = width / cols;
  const H = height / rows;

  noFill()
  strokeWeight(2)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(x/cols+time/4, y/rows)*4;

    drawGridCell(
      cellVector.x-W,
      cellVector.y-H,
      W,
      H,
      ~~n,
      n,
      ( x, y, w, h ) => {
        rect(x, y, w, h )
        cross(x, y, 30)
      }
    )
  })
}

function cross( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

sketch.draw( (time, center) => {
  background(0);

  push()
  stroke(16, 16, 64)
  drawGrid(1, time)
  pop()

  rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInSine)/24)
  rotateY(mappers.fn(sin(time*2), -1, 1, -PI, PI, easing.easeInOutSine)/18)

  const size = width/2;
  const scale = 2.25;
  const font = string.fonts.tilt;

  const sampleFactor = 0.1;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const currentLetterPoints = getTextPoints({
    text: "c",
    position: letterPosition,
    size: size*1.5,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "c",
    position: letterPosition,
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const depthSteps = 10;
  const primary = currentLetterPoints.length > nextLetterPoints.length ? currentLetterPoints : nextLetterPoints;
  const secondary = currentLetterPoints.length > nextLetterPoints.length ? nextLetterPoints : currentLetterPoints;

  for (let z = 0; z < depthSteps; z++) {
    for (let i = 0; i < primary.length; i++) {
      const progression = i / primary.length
      // const targetIndex = ~~constrain(i, 0, secondary.length-1);
      const targetIndex = ~~map(i, 0, primary.length-1, 0, secondary.length-1);

      const n = map(sin(time+progression), -1, 1, 1, 8)

      const { x, y } = animation.ease({
        values: [ primary[i], secondary[targetIndex] ],
        currentTime: time/2+z/500+progression/n,
        // currentTime: (z/depthSteps)/10,
        duration: 1,
        easingFn: easing.easeInOutCirc,
        // easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuint,
        // easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutSine,
        // easingFn: easing.easeInOutCubic,
        easingFn: easing.easeInOutElastic,
        lerpFn: p5.Vector.lerp,
      })

      stroke(colors.rainbow({
        hueOffset: time,
        hueIndex: mappers.fn(progression, 0, 1, -PI, PI)*2*n,
        // hueOffset: progression+time,
        // hueIndex: mappers.fn(z, 0, depthSteps, -PI, PI),
        opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
        // opacityFactor: map(sin(progression*100+time*4), -1, 1, 4, 1),
        // opacityFactor: mappers.fn(sin(z/5+progression*30+time*6), -1, 1, 6, 1, easing.easeOutSine)
        // opacityFactor: mappers.fn(sin(z/20+time*6), -1, 1, 10, 1, easing.easeInOutExpo)
      }))

      point(
        x*scale,
        y*scale,
      )
    }
  }

  orbitControl();
});
