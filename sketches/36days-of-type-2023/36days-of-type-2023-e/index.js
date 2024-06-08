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

function lerpPoints(from, to, amount, fn) {
  // return to.map( (point, index) => {
  //   const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

  //   return p5.Vector.lerp( to[index], from[targetIndex], amount )
  // })

  return from.map( (point, index) => {
    const fromIndex = map(index, 0, 1, 0, from.length-1);
    const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

    return p5.Vector.lerp( from[index], to[targetIndex], amount )
  })
}

function drawGridCell(_x, _y, w, h, columns, rows, drawer) {
  const xSize = w / columns;
  const ySize = h / rows;

  for (let x = 0; x <= columns; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

function cross( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

function drawGrid(columns, time) {
  const rows = columns*height/width;

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2 ),
    rows,
    columns,
    centered: true
  }

  const W = width / columns;
  const H = height / rows;

  noFill()
  strokeWeight(2)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(x/columnsmnsmnsmns+time, y/rows, time)*2;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        stroke(16, 16, 64)
        rect(x, y, w, h )
        stroke(16, 16, 255)
        cross(x, y, 15)
      }
    )
  })
}

sketch.draw( (time, center) => {
  background(0);

  push()
  translate(0, 0, 0)
  drawGrid(4, time)
  pop()

  rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/18)
  // rotateY(mappers.fn(cos(time), -1, 1, -PI, PI)/18)

  const size = (width)/2;
  const scale = 2.0;

  const sampleFactor = 0.08;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const currentLetterPoints = getTextPoints({
    text: "E",
    position: letterPosition,
    size: size * 0.8,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "e",
    position: letterPosition,
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const depthSteps = 50;
  const depthStart = 0;
  const depthEnd = 100;

  noFill()
  stroke(255);

  for (let z = 0; z < depthSteps; z++) {
    push()

    translate(
      0,
      0, 
      lerp( depthStart, depthEnd, z/depthSteps )
    )
  
    const p = animation.ease({
      values: [ 0, 0, 0, 1, 1, 1 ],
      currentTime: time/2+z/depthSteps/4,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutQuart,
      // easingFn: easing.easeInOutElastic,
    })
    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    points.forEach( ({x, y}) => {
      const xSign = sin(time);
      const ySign = cos(time);
      const hueOpacitySpeed = time*4;
      const hueOpacityDirection = (xSign*(x/50)+ySign*(y/15));

      const hue = noise(
        x/50,
        y/75,
        z/depthSteps+time/2
      )

      const darkness = map(z, 0, depthSteps, 50, 3)

      stroke(colors.rainbow({
        hueOffset: hueOpacitySpeed,
        hueIndex: map(hue, 0, 1, -PI, PI)*2,
        opacityFactor: map(
          sin(
            hueOpacityDirection+hueOpacitySpeed+z/15
          ),
          -1,
          1,
          darkness,
          1
        ),
      }))

      push()

      // const angleX = animation.ease({
      //   values: [ PI*2, 0 ],
      //   currentTime: time/2+y/1500,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   easingFn: easing.easeInOutQuart
      // })
      const angleY = animation.ease({
        values: [ 0, PI*2, 0 ],
        currentTime: time/2+y/1500,
        duration: 1,
        easingFn: easing.easeInOutExpo,
        easingFn: easing.easeInOutQuart
      })
      // rotateX(angleX)
      rotateY(angleY)

      translate(
        x * scale * mappers.fn(z, 0, depthSteps, 0.8, 1, easing.easeInQuart),
        y * scale * mappers.fn(z, 0, depthSteps, 0.8, 1, easing.easeOutQuart)
      )

      sphere(
        mappers.fn(z, 0, depthSteps, 5, 10, easing.easeInQuart),
      )

      pop()
    })

    pop()
  }

  orbitControl();
});
