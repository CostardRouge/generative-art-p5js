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

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(x/columns+time, y/rows)*4;

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
        // circle(x, y, 15)
        // ikks(x, y, 15)
        fill(0)
        circle(x, y, 15)
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

  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/18)
  // rotateY(mappers.fn(cos(time), -1, 1, -PI, PI)/18)


  // rotateY(PI/6)

  const size = (width)/2;
  const scale = 2;

  const sampleFactor = 0.1;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const currentLetterPoints = getTextPoints({
    text: "g",
    position: letterPosition,
    size: size*0.8,
    font: string.fonts.sans,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "G",
    position: letterPosition,
    size,
    font: string.fonts.sans,
    sampleFactor,
    simplifyThreshold
  })

  noStroke()

  const depthSteps = 20;
  const depthStart = createVector(0, 0, 0);
  const depthEnd = createVector(0, 0, 500);

  for (let z = 0; z < depthSteps; z++) {
    push()

    // const depthEnd = createVector(
    //   mappers.fn(sin(4*time+z/depthSteps*2), -1, 1, -50, 50, easing.easeInOutQuart),
    //   mappers.fn(cos(time-z/depthSteps), -1, 1, -50, 50, easing.easeInOutQuart),
    //   500
    // );

    // const depthEnd = animation.ease({
    //   values: [
    //     // createVector(0, 0, 500),
    //     // createVector(0, 0, 500),
    //     createVector(0, 0, 100), // milieu

    //     createVector(0, 0, 500), // milieu
    //     createVector(50, 0, 500), // millieu droite
    //     createVector(50, 50, 500), // bas droite
    //     createVector(50, 50, 100), // bas droite

    //     createVector(-50, 50, 500), // bas gauche
    //     createVector(50, 0, 500), // millieu droite
    //     createVector(-50, 50, 500), // haut droite
    //     createVector(0, 50, 500), // haut millieu,
    //     createVector(50, 50, 500), // haut millieu
    //     // createVector(50, 50, 500),
    //     // createVector(50, 50, 500)
    //   ],
    //   currentTime: 3.5*time+z/depthSteps*2,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    //   lerpFn: p5.Vector.lerp
    // })

    // const depthEnd = mappers.circularIndex(time+z/depthSteps*2, [
    //   createVector(0, 150, 500),
    //   createVector(150, 0, 500),
    //   createVector(0, 150, 500),
    //   createVector(150, 150, 500)
    // ])

    const position = p5.Vector.lerp( depthStart, depthEnd, z/depthSteps)

    translate(position)
  
    const p = animation.ease({
      values: [ 0, 0, 1, 1 ],
      currentTime: time/2+z/depthSteps/4,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutQuart,
      // easingFn: easing.easeInOutElastic,
    })
    // p = z/depthSteps
    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    const hueOpacitySpeed = time*2;

    points.forEach( ({x, y}, index) => {
      const xSign = sin(time);
      const ySign = cos(time);
      const hueOpacityDirection = (xSign*(x/50)+ySign*(y/15));

      const hue = noise(
        x/150,
        y/100,
        z/depthSteps//+time/2
      )

      const darkness = map(z, 0, depthSteps, 50, 3)

      const colorFunction = mappers.circularIndex(time/2+x/1500, 
      [
        colors.rainbow,
        //colors.purple
      ])

      noFill()
      stroke(colorFunction({
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
        )
      }))

      push()

      // const angleX = animation.ease({
      //   values: [ 0, PI*2, 0 ],
      //   currentTime: time/2+x/1500,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   easingFn: easing.easeInOutQuart
      // })
      // const angleY = animation.ease({
      //   values: [ 0, PI*2, 0 ],
      //   currentTime: time/2+y/1500,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   easingFn: easing.easeInOutQuart
      // })
      // rotateX(angleX)
      // rotateY(angleY)

      const aa = animation.ease({
        values: [ 0.5, 1.5 ],
        currentTime: time/2+z/150,
        duration: 1,
        easingFn: easing.easeInOutExpo
      })

      const bb = animation.ease({
        values: [ 1.5, 0.5 ],
        currentTime: time/2-y/1500,
        duration: 1,
        easingFn: easing.easeInOutExpo
      })

      translate(
        x * (scale * mappers.fn(z, 0, depthSteps, bb, aa, easing.easeInSine)),
        y * (scale * mappers.fn(z, 0, depthSteps, bb, aa, easing.easeInSine))
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
