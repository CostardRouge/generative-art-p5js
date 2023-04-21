import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key("text-points", fontFamily, ...arguments)

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
  translate(0, 0, 0)
  drawGrid(10, time/2)
  pop()

  push()

  const size = (width)/3;
  const sampleFactor = 0.1;
  const simplifyThreshold = 0;

  // const currentLetterPoints = getTextPoints({
  //   text: "j",
  //   position: createVector(0, 0),
  //   size,
  //   font: string.fonts.sans,
  //   sampleFactor,
  //   simplifyThreshold
  // })

  // const nextLetterPoints = getTextPoints({
  //   text: "J",
  //   position: createVector(0, 0),
  //   size,
  //   font: string.fonts.sans,
  //   sampleFactor,
  //   simplifyThreshold
  // })

  strokeWeight(2)
  noStroke()

  const depthSteps = 5;
  const depthStart = createVector(0, 0, 0);

  const hueOpacitySpeed = time*2;

  const c = 5;

  for (let t = 0; t < c; t++) {
    const d = map(sin(time+t/c), -1, 1, 0, 500)
    const depthEnd = createVector(0, 0, d);

    for (let z = 0; z < depthSteps; z++) {

      push()
      translate(p5.Vector.lerp( depthStart, depthEnd, z/depthSteps))
      // translate(p5.Vector.lerp( depthStart, depthEnd, d))

      const p = animation.ease({
        values: [ 0, 1 ],
        currentTime: 0,//time/2+z/depthSteps/4,
        duration: 1,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuart,
        //easingFn: easing.easeInOutElastic,
      })

      // const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

      // const size = mappers.fn( t, 0, c, 0, 500, easing.easeInSine)

      const points = getTextPoints({
        text: "J",
        position: createVector(0, 0),
        size: size,// * ((t/c) * 2),
        font: string.fonts.sans,
        sampleFactor,
        simplifyThreshold
      })

      const darkness = map(z, 0, depthSteps, 10, 3)

      points.forEach( ({x, y}, index) => {
        const xSign = sin(time);
        const ySign = cos(-time);
        const hueOpacityDirection = (xSign*(x/50)+ySign*(y/15));

        const hue = noise(
          x/150,
          y/100,
          z/depthSteps//+time/2
        )

        stroke( colors.rainbow({
          hueOffset: hueOpacitySpeed,
          hueIndex: map(hue, 0, 1, -PI, PI)*2,
          opacityFactor: map(
            sin(
              // hueOpacityDirection+hueOpacitySpeed+z/15
              hueOpacitySpeed+index/10+z/10
            ),
            -1,
            1,
            darkness,
            1
          ),
        }))

        push()

        translate(
          x * mappers.fn( t, 0, c, 5, 1, easing.easeInSine),
          y * mappers.fn( t, 0, c, 5, 1, easing.easeInSine)/1.5,
        )

        sphere(
          mappers.fn(z, 0, depthSteps, 1, 5, easing.easeInQuart),
        )

        pop()
      })

      pop()
    }
  }

  orbitControl();
});
