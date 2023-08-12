import { sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

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

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

// function drawGrid(xCount, yCount, offset = 1) {
function drawGrid(cols, time) {
  //   const xSize = width / xCount;
  // const ySize = height / yCount;

  // for (let x = offset; x <= xCount - offset; x++) {
  //   for (let y = offset; y <= yCount - offset; y++) {
  //     hl(y * ySize)
  //     vl(x * xSize)
  //   }
  // }

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
    const n = noise(x/cols, y/rows + time)*4;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {

        rect(x, y, w, h )
      }
    )
  })
}

sketch.draw( (time, center) => {
  background(0);


  // push()
  // stroke(64, 64, 128)
  // drawGrid(8, 0)
  // pop()



  // rotateY(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/9)
  rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/9)

  const size = width/2;
  const scale = 2.25;
  const font = string.fonts.sans;

  const sampleFactor = 0.15;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const currentLetterPoints = getTextPoints({
    text: "a",
    position: letterPosition,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const nextLetterPoints = getTextPoints({
    text: "b",
    position: letterPosition,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const primary = currentLetterPoints.length > nextLetterPoints.length ? currentLetterPoints : nextLetterPoints;
  const secondary = currentLetterPoints.length > nextLetterPoints.length ? nextLetterPoints : currentLetterPoints;
  
  const depth = 15;

  for (let z = 0; z < depth; z++) {
    translate( 0, 0, map(z, 0, depth, 0, -50) )

    for (let i = 0; i < primary.length; i++) {
      const progression = i / primary.length
      //const targetIndex = ~~constrain(i, 0, secondary.length-1);
      const targetIndex = ~~map(i, 0, primary.length-1, 0, secondary.length-1);

      const { x, y } = animation.ease({
        values: [ primary[i], secondary[targetIndex] ],
        currentTime: time+z/50+progression/10,
        // currentTime: (z/depth)/10,
        duration: 1,
        easingFn: easing.easeInOutExpo,
        //easingFn: easing.easeOutElastic,
        lerpFn: p5.Vector.lerp,
      })
    
      const colorFunction = colors.rainbow
      
      // mappers.circularIndex(time/4+progression+z/100, [
      //   colors.rainbow,
      //   //colors.test,
      // // colors.black
      // ]);

    
      stroke(colorFunction({
        hueOffset: time,
        hueIndex: mappers.fn(progression, 0, 1, -PI, PI),
        opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
        opacityFactor: map(sin(progression*100+time*4), -1, 1, 3, 1),
        //opacityFactor: map(sin(z*50+progression*5+time*4), -1, 1, 10, 1)
      }))
      push()
      // translate(
      //   x*scale*map(z, 0, depth, 0, 1),
      //   y*scale*map(z, 0, depth, 0, 1),
      //   // map(z, 0, depth, 0, -100)
      // )
      translate(
        x*scale,
        y*scale,
      )
      point(0, 0)
      pop()
    }
  }

  orbitControl();


  return 
  
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
      currentTime: time+n,
      duration: 1,
      easingFn: easing.easeInOutExpo
    })

    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    beginShape(POINTS)
    points.forEach( ({x, y}) => {
      vertex(x * letterScale, y * letterScale)
    })
    endShape()

    pop()
  })

  orbitControl();
});
