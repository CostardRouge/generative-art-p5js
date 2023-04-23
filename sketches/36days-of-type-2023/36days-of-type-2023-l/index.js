import { sketch, audio, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

// events.register("post-setup", () => {
//   audio.capture.setup()
//   // midi.setup()
// });

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
    startLeft: createVector( -width, -height/2 ),
    startRight: createVector( width, -height/2 ),
    endLeft: createVector( -width, height/2 ),
    endRight: createVector( width, height/2 ),
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

  rotate(PI/4)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(xSign*x/cols+time, ySign*y/rows, time)*4;

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
          // fill(0)
          circle(x, y, 15)
          rect(x-7.5, y-7.5, 15)
        }
        else {
          ikks(x, y, 15)
          // cross(x, y, 15)
        }

      }
    )
  })
}

sketch.draw( (time, center) => {
  background(0);

  push()
  drawGrid(4, time/2)
  pop()

  push()

  // const xSign = sin(time);
  // const ySign = cos(-time);

  // rotateY(mappers.fn(sin(xSign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)
  // rotateX(mappers.fn(cos(ySign+time), -1, 1, -PI, PI, easing.easeInOutQuart)/24)

  const size = (width)/3;
  const sampleFactor = 1/3;
  const simplifyThreshold = 0;

  const depthSteps = 50;
  const depthStart = createVector(0, 0, 1000);
  const depthEnd = createVector(0, 0, 0);

  //rotateZ(time)

  for (let z = 0; z < depthSteps; z++) {
    // const d = map(sin(time+z/100), -1, 1, 0, 1000)
    // const depthEnd = createVector(0, 0, d);

    push()
    translate(p5.Vector.lerp( depthEnd, depthStart, z/depthSteps))
    // translate(p5.Vector.lerp( depthStart, depthEnd, d))

    const font = mappers.circularIndex( time+z/50, [
      // string.fonts.multicoloure,
      string.fonts.martian,
      // string.fonts.serif
    ])

    const [ firstLetterPoints ] = getTextPoints({
      text: "elle",
      position: createVector(0, 0),
      size,
      font,
      sampleFactor,
      simplifyThreshold
    })
  
    const [ nextLetterPoints ] = getTextPoints({
      text: "L",
      position: createVector(0, 0),
      size,
      font,
      sampleFactor,
      simplifyThreshold
    })

    let letterProgression = animation.ease({
      values: [ 0, 1 ],
      currentTime: time/3+z/depthSteps/4,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      // easingFn: easing.easeInOutQuart,
      easingFn: easing.easeInOutElastic,
    })

    //letterProgression = z/depthSteps;

    const points = lerpPoints(firstLetterPoints, nextLetterPoints, letterProgression )

    points.forEach( ({x, y}, index) => {
      const xSign = sin(time);
      const ySign = cos(-time);
      const hueOpacityDirection = (xSign*(x/(width/8))+ySign*(y/(height/8)));

      const hue = noise(
        x/(width/4),
        y/(height/4),
        z/depthSteps+time/2
      )
      
      const hueOpacitySpeed = -time*6;
      const darkness = map(z, 0, depthSteps, 20, 3)

      stroke( colors.rainbow({
        hueOffset: time,//+hueOpacitySpeed,//+t/c+z/50,
        hueIndex: map(hue, 0, 1, -PI, PI)*4,
        opacityFactor: map(
          sin(
            hueOpacityDirection
            +hueOpacitySpeed
            +index/20
            +z/10
          ),
          -1,
          1,
          darkness,
          1
        ),
      }))

      // let m = 80*audio.capture.audioIn.getLevel()*5;
      // m = audio.capture.energy.byIndex( 2, "raw")*100
      // m = audio.capture.energy.byIndex( 1, "raw")*100
      let m = 100
      let f = 0.5//mappers.circularIndex(2*time, [0.5, 1,2,4,8, 16])
      const zz = map(sin(
        6*time
        +index*f
        // +x/5
        // +y/100
        // +z*10
      ), -1, 1, -m, m)

      point(
        x,
        y,
        zz
      )

      // const aa = animation.ease({
      //   values: [ 0.5, 1.5 ],
      //   currentTime: time/2+index/500+z/100,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo
      // })

      // const bb = animation.ease({
      //   values: [ 1.5, 0.5 ],
      //   currentTime: time/2-y/1500+index/1500,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo
      // })


      // point(
      //   x ,//* (scale * mappers.fn(z, 0, depthSteps, bb, aa, easing.easeInOutSine)),
      //   y //* (scale * mappers.fn(z, 0, depthSteps, bb, aa, easing.easeInOutSine))
      // )
    })

    pop()
  }

  orbitControl();
});
