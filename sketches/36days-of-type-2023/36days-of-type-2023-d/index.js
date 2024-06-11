import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

const easingFunctions = Object.entries( easing );

sketch.setup( undefined, { type: 'webgl'});
// sketch.setup( undefined );
// sketch.setup();

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

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
  return to.map( (point, index) => {
    const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

    return p5.Vector.lerp( to[index], from[targetIndex], amount )
  })

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
    const n = noise(x/columns+time, y/rows, time)*4;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        rect(x, y, w, h )
        cross(x, y, 30)
      }
    )
  })
}

sketch.draw( (time, center) => {
  background(0);

  push()
  translate(0, 0, 0)
  stroke(16, 16, 64)
  drawGrid(4, time)
  pop()

  // rotateY(mappers.fn(sin(time*5), -1, 1, -PI, PI, easing.easeInSine)/18)
  rotateY(mappers.fn(sin(time*5), -1, 1, -PI, PI)/18)
  rotateX(mappers.fn(cos(time), -1, 1, -PI, PI)/9)

  const size = width/2;
  const scale = 2.25;

  const sampleFactor = 0.05;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const currentLetterPoints = getTextPoints({
    text: "d",
    position: letterPosition,
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "D",
    position: letterPosition,
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const depthSteps = 50;
  const depthStart = 0;
  const depthEnd = 250;

  noFill()
  for (let z = 0; z < depthSteps; z++) {
    push()

    translate(
      0,
      0, 
      lerp( depthStart, depthEnd, z/depthSteps )
    )
  
    const points = lerpPoints(currentLetterPoints, nextLetterPoints, z/depthSteps )

    points.forEach( ({x, y}) => {
      const hue = noise(
        x/100,
        y/100,
        z/depthSteps-time/2
      )
      
      const opacityFactor = mappers.fn(sin(z/(depthSteps)+time*2), -1, 1, 20, 1, easing.easeInQuint);

      if (opacityFactor > 15) {
        return
      }

      stroke(colors.rainbow({
        hueOffset: 0,
        hueIndex: mappers.fn(hue, 0, 1, -PI, PI)*4,
        opacityFactor
      }))

      push()
      translate(
        x * scale,
        y * scale
      )

      sphere(4, 4)

      pop()
    })

    pop()
  }

  orbitControl();
});
