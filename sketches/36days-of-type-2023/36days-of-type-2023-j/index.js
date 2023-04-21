import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(
    "text-points",
    fontFamily,
    text,
    size,
    sampleFactor,
    simplifyThreshold
  )

  // console.log(...arguments);
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

    return ([
      textPoints.map( ({x, y}) => {
        const testPointVector = createVector(x, y);
  
        testPointVector.add((position.x-xCenter),(position.y-yCenter))
  
        return testPointVector;
      }),
      [
        xMin-xCenter,
        yMin-yCenter,
        xMax-xMin,
        yMax-yMin,
      ]
    ])
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

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
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

function drawGrid(cols, time) {
  const rows = cols*height/width;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols,
    centered: true
  }

  const W = width / cols;
  const H = height / rows;

  noFill()
  strokeWeight(2)

  const xSign = sin(-time/2);
  const ySign = cos(time/2);

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/cols+time, ySign*y/rows, time)*2;

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

        stroke(128, 16, 16)

        const n = noise(x/w, y/h, time);

        if (n > 0.5) {
          fill(0)
          // circle(x, y, 15)
          rect(x-7.5, y-7.5, 15)
        }
        else {
          // ikks(x, y, 15)
          cross(x, y, 15)
        }

      }
    )
  })
}

function gridd(time) {
  const letterScale = (width/(scale*size))//1//mappers.circularIndex(time, [1, 1/1.8]);
  const cols = width / (size * letterScale);
  const rows = ~~cols*height/width;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols: ~~cols,
    centered: true
  }

  stroke(255)
  grid.draw(gridOptions, (cellVector, { x, y }) => {
    push()
    translate(cellVector)

    const n = noise(x/cols, y/rows-time/100);

    const p = animation.ease({
      values: [ 0, 1 ],
      currentTime: time,
      duration: 1,
      easingFn: easing.easeInOutExpo
    })

    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    noFill()
    beginShape(POINTS)
    points.forEach( ({x, y}) => {
      vertex(x * letterScale, y * letterScale)
    })
    endShape()

    pop()
  })

  pop()

  return
}

sketch.draw( (time, center) => {
  background(0);

  push()
  drawGrid(10, time/2)
  pop()

  push()

  const xSign = sin(time);
  const ySign = cos(-time);

  rotateY(mappers.fn(sin(xSign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)
  rotateX(mappers.fn(cos(ySign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)

  const size = (width)/15;
  const sampleFactor = 1/5;
  const simplifyThreshold = 0;

  const depthSteps = 10;
  const depthStart = createVector(0, 0, 350);
  const depthEnd = createVector(0, 0, 150);


  const c = 5;

  const tt = 1.5 * cos(time)

  for (let t = 0; t < c; t++) {

    translate(0, 0, 50 * Math.pow(tt, t))

    for (let z = 0; z < depthSteps; z++) {
      // const d = map(sin(time+z/10), -1, 1, 100, 500)
      // const depthEnd = createVector(0, 0, d);

      push()
      translate(p5.Vector.lerp( depthEnd, depthStart, z/depthSteps))
      // translate(p5.Vector.lerp( depthStart, depthEnd, d))

      // const p = animation.ease({
      //   values: [ 0, 1 ],
      //   currentTime: 0,//time/2+z/depthSteps/4,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   // easingFn: easing.easeInOutQuart,
      //   //easingFn: easing.easeInOutElastic,
      // })

      // const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )
      // const size = mappers.fn( t, 0, c, 0, 500, easing.easeInSine)

      const letter = mappers.circularIndex( time+z/50+t/c, ["j", "J"])

      const [ points, [x, y, w, h] ] = getTextPoints({
        text: letter,
        position: createVector(0, 0),
        size,//: size * Math.pow(2, t),
        font: string.fonts.martian,
        sampleFactor: sampleFactor * Math.pow(1.5, t),
        simplifyThreshold
      })

      // rect(
      //   x * Math.pow(2, t),
      //   y * Math.pow(2, t),
      //   w * Math.pow(2, t),
      //   h * Math.pow(2, t)
      // )
      const r = 2

      // beginShape(POINTS)
      // points.forEach( ({x, y}, index) => {
      //   vertex(
      //     x * Math.pow(r, t),
      //     y * Math.pow(r, t)
      //   )
      // })
      // stroke(255)


      //   const hue = noise(
      //     t/c,
      //     z/depthSteps
      //   )

      // stroke( colors.rainbow({
      //   hueOffset: hueOpacitySpeed,
      //   hueIndex: map(hue, 0, 1, -PI, PI)*2,
      //   opacityFactor: map(
      //     sin(
      //       hueOpacitySpeed+t/c
      //     ),
      //     -1,
      //     1,
      //     darkness,
      //     1
      //   ),
      // }))
      // endShape()

      push()
      points.forEach( ({x, y}, index) => {
        // translate(
        //   x,// *, Math.pow(r, t),
        //   y// * Math.pow(r, t)
        // )

        const xSign = sin(time);
        const ySign = cos(-time);
        const hueOpacityDirection = (xSign*(x/50)+ySign*(y/15));

        const hue = noise(
          x/150,
          y/100,
          z/depthSteps//+time/2
        )
        
        const hueOpacitySpeed = time*3;
        const darkness = map(z, 0, depthSteps, 7, 3)

        stroke( colors.rainbow({
          // hueOffset: hueOpacityDirection/2*t,//+hueOpacitySpeed,//+t/c+z/50,
          hueIndex: map(hue, 0, 1, -PI, PI)*4,
          opacityFactor: map(
            sin(
              hueOpacityDirection+hueOpacitySpeed+z/15
              // hueOpacitySpeed+index/10+z/10+t/10
            ),
            -1,
            1,
            darkness,
            1
          ),
        }))

        point(
          x * Math.pow(r, t),
          y * Math.pow(r, t)
        )

        // point(x, y)

        // sphere(
        //   mappers.fn(z, 0, depthSteps, 1, 5, easing.easeInQuart),
        // )
      })
      pop()


      // points.forEach( ({x, y}, index) => {
      //   const xSign = sin(time);
      //   const ySign = cos(-time);
      //   const hueOpacityDirection = (xSign*(x/50)+ySign*(y/15));

      //   const hue = noise(
      //     x/150,
      //     y/100,
      //     z/depthSteps//+time/2
      //   )

      //   stroke( colors.rainbow({
      //     hueOffset: hueOpacitySpeed,
      //     hueIndex: map(hue, 0, 1, -PI, PI)*2,
      //     opacityFactor: map(
      //       sin(
      //         // hueOpacityDirection+hueOpacitySpeed+z/15
      //         hueOpacitySpeed+index/10+z/10+t/10
      //       ),
      //       -1,
      //       1,
      //       darkness,
      //       1
      //     ),
      //   }))

      //   push()

      //   translate(
      //     x * mappers.fn( t, 0, c, 1, 5, easing.easeInExpo),
      //     y * mappers.fn( t, 0, c, 1, 5, easing.easeInExpo)/1.5,
      //   )

      //   sphere(
      //     mappers.fn(z, 0, depthSteps, 1, 5, easing.easeInQuart),
      //   )

      //   pop()
      // })

      pop()
    }
  }

  orbitControl();
});
