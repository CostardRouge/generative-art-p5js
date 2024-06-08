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
  return to.map( (point, index) => {
    const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

    return p5.Vector.lerp( to[index], from[targetIndex], amount )
  })

  // return from.map( (point, index) => {
  //   const fromIndex = map(index, 0, 1, 0, from.length-1);
  //   const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

  //   return p5.Vector.lerp( from[index], to[targetIndex], amount )
  // })
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

function ikks( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

function cross( x, y , size) {
  line(x, y -size/2, x, y +size/2)
  line(x + size/2, y, x - size/2, y)
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

  const xSign = sin(-time);
  const ySign = cos(time);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/columnsmnsmnsmns+time, ySign*y/rows)*2;

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
        stroke(16, 16, 128)

        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          fill(0)
          // circle(x, y, 15)
          rect(x-7.5, y-7.5, 15)
        }
        else {
          ikks(x, y, 15)
        }

      }
    )
  })
}

sketch.draw( (time, center) => {
  background(0);

  push()
  translate(0, 0, 0)
  drawGrid(6, time*2)
  pop()
  
  const size = (width)/3;
  const scale = 2;
  const sampleFactor = 0.2;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const currentLetterPoints = getTextPoints({
    text: "i",
    position: letterPosition,
    size,
    font: string.fonts.serif,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "I",
    position: letterPosition,
    size,
    font: string.fonts.serif,
    // font: mappers.circularIndex(time, [
    //   string.fonts.serif,
    //   string.fonts.tilt,
    //   string.fonts.sans
    // ]),
    sampleFactor,
    simplifyThreshold
  })

  noStroke()

  const depthSteps = 20;
  // const depthStart = createVector(0, 0, 0);
  // const depthEnd = createVector(0, 0, 500);

  const WL = 150
  const HL = 250
  const DL = 50

  const n = map(sin(time), -1, 1, 10, 32)

  for (let z = 0; z < depthSteps; z++) {
    push()
  
    let p = animation.ease({
      values: [ 0, 1 ],
      currentTime: time+z/depthSteps/4,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutQuart,
      //easingFn: easing.easeInOutElastic,
    })

    const depthStart = animation.ease({
      values:  [
        createVector(0, 0, 0),
        createVector(0, 0, 0),
        createVector(0, 0, 0),
    
        createVector(-WL, HL, 0), // bas gauche
        createVector(-WL, -HL, 0), // haut gauche
        createVector(WL, -HL, 0), // haut droite
  
        createVector(-WL, -HL, 0), // haut gauche
        createVector(-WL, HL, 0), // bas gauche
      ],
      currentTime: time+z/n,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      lerpFn: p5.Vector.lerp
    })
  
    const depthEnd = animation.ease({
      values: [
        createVector(0, 0, DL/16), 
        createVector(0, 0, DL/2), 
        createVector(0, 0, DL),
    
        createVector(WL, -HL, DL), // haut droite
        createVector(WL, HL, DL), // bas droite
        createVector(-WL, HL, DL), // bas gauche
  
        createVector(WL, HL, DL), // bas droite
        createVector(WL, -HL, DL), // haut droite
      ],
      currentTime: time,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      lerpFn: p5.Vector.lerp
    })


    const position = p5.Vector.lerp( depthEnd, depthStart, z/depthSteps)

    translate(position)

    const hueOpacitySpeed = time*2;

    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    points.forEach( ({x, y}, index) => {
      const hue = noise(
        x/150,
        y/100,
        z/depthSteps
      )

      const darkness = map(z, 0, depthSteps, 50, 3)

      noFill()
      stroke(colors.rainbow({
        hueOffset: hueOpacitySpeed,
        hueIndex: map(hue, 0, 1, -PI, PI)*4,
        opacityFactor: mappers.fn(
          sin(
            2*hueOpacitySpeed+z/10
          ),
          -1,
          1,
          darkness,
          1,
          easing.easeInQuint
        )
      }))

      push()

      translate(
        x * (scale * mappers.fn(z, 0, depthSteps, 0.5, 1.5, easing.easeInQuart)),
        y * (scale * mappers.fn(z, 0, depthSteps, 0.5, 1.5, easing.easeInQuart))
      )

      sphere(
        mappers.fn(z, 0, depthSteps, 1, 5, easing.easeInQuart),
      )

      pop()
    })

    pop()
  }

  orbitControl();
});
