import { sketch, string, mappers, animation, easing, options, colors, iterators, cache, grid } from './utils/index.js';

sketch.setup( () => {
  setAttributes('antialias', true);
}, { type: 'webgl'});

options.add( [
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
    min: 1,
    max: 200,
    defaultValue: 30,
    category: 'Grid'
  }
] );

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

const borderSize = 2;

const pattern = (weight = 3, columns = 7, time) => {
  background(0);

  stroke(255)
  strokeWeight(weight)
  noFill()

  const columnSize = width / columns
  const halfColumnSize = (columnSize /2 )
  const columnPadding = weight + halfColumnSize;
  const precision = 0.01;

  for (let i = 0; i < columns; i++) {
    const x = ( i * columnSize ) + halfColumnSize;
    const top = createVector( x, -200);
    const bottom = createVector(x, height+200);

    if (i > columns-1) {
      stroke(128,128,255)
    }
    else {
      stroke(255)
    }

    beginShape()
    iterators.vector(top, bottom, precision, ( position, lerpIndex ) => {
      const driftBound = (halfColumnSize + columnPadding) * sin(time + i);
      const driftX = map( easing.easeInOutBack((lerpIndex) % 1), 0, 1, -driftBound, driftBound);

      vertex( position.x + driftX, position.y );
    });
    endShape()
  }
}

function a_or_b(value, amount, a = cos, b = sin) {
  return map(amount, 0, 1, a(value), b(value))
}

sketch.draw( (time, center) => {
  background(0);
  strokeWeight(borderSize)

  const screenRatio = 1.5//height/width;

  //const sceneRotationSpeed = time*1.5;
  //rotateY(mappers.fn(sin(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutCubic)/6)
  //rotateX(mappers.fn(cos(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  // rotateX(map(sin(time), -1, 1, -PI, PI)/12)
  // rotateY(map(cos(time/2), -1, 1, -PI, PI)/12)

  const n = animation.ease({
    values: [0,1,2,3,4,5,6,7,8,9, 0],
    currentTime: time,
    duration: 1,
    easingFn: easing.easeInOutExpo,
    //easingFn: easing.easeInOutElastic,
    // lerpFn: p5.Vector.lerp,
    // startIndex: 0,
    // endIndex: 1
  })

  push()
  translate(-center.x, -center.y, -200)
  pattern(3, n, time)
  pop()

  const word = "0123456789 "
  const cols = options.get("grid-cols") ?? 30//map(sin(time), -1, 1, 30, 40);
  const rows = cols*height/width;
  const size = width/cols

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols,
    centered: true
  }

  const fonts = {
    sans: string.fonts.sans,
    //serif: string.fonts.serif
  }

  // rotateZ(time)
  //rotateY(time)
  
  grid.draw(gridOptions, (cellVector, { x, y }) => {
    const xSign = 1//sin(time);
    const ySign = -1//cos(time);
    const commonSwitchingIndex = (xSign*(x/cols)+ySign*(y/rows));
    const currentLetter = mappers.circularIndex(commonSwitchingIndex+time, word)
    const currentFontName = mappers.circularIndex(commonSwitchingIndex+time, Object.keys(fonts))
    const points = getTextPoints({
      font: fonts[currentFontName],
      size: 1000,
      sampleFactor: 1,
      simplifyThreshold: 0,
      text: currentLetter,
      position: createVector(0, 0),
    })
    
    const alphaCacheKey = cache.key(x, y, ~~cols, currentLetter, currentFontName, "alpha")
    const alpha = cache.store(alphaCacheKey, () => {
      return points.reduce( ( result, point ) => {
        if (255 <= result) {
          return result;
        }

        return Math.max(
          result,
          map(point.dist(cellVector), 0, size, 255, 0, true)
        );
      }, 0);
    });

    if (!alpha) {
      return;
    }

    const hue = noise(x/cols, y/rows+time/4 )

    const coco = colors.rainbow({
      hueOffset: 0,
      hueIndex: map(hue, 0, 1, -PI, PI)*4,
      opacityFactor: map(hue, 0, 1, 2.1, 1 ),
    })

    const { levels: [ r, g, b ] } = coco;

    //normalMaterial();
    stroke(coco)
    fill(color(r, g, b, 230))

    const w = size//-borderSize*2//map(sin(time-y/10), -1, 1, 10, 20)
    const h = size//-borderSize*2//map(cos(time+x/10), -1, 1, 10, 20)
    const d = 150// * 20*noise(x/cols/2, y/rows+time/2)

    push()

    rotateX(map(sin(time-y/10), -1, 1, -PI, PI)/6)
    rotateY(map(cos(time+x/20), -1, 1, -PI, PI)/6)

    // rotateX(mappers.fn(cos(t-y/20), -1, 1, -PI, PI, easing.easeInOutQuart)/9)
    // rotateY(mappers.fn(sin(t+x/15), -1, 1, -PI, PI, easing.easeInOutExpo)/9)

    // const angleX = animation.ease({
    //   values: [ -PI, PI ],
    //   currentTime: time+x/cols,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    //   // easingFn: easing.easeInOutQuart,
    //   //easingFn: easing.easeInOutElastic,
    //   // lerpFn: p5.Vector.lerp,
    //   // startIndex: 0,
    //   // endIndex: 1
    // })
    const angleY = animation.ease({
      values: [ -PI, PI ],
      currentTime: time-y/rows,
      duration: 1,
      easingFn: easing.easeInOutExpo,
      easingFn: easing.easeInOutQuart,
      easingFn: easing.easeInOutElastic,
      // lerpFn: p5.Vector.lerp,
      // startIndex: 0,
      // endIndex: 1
    })
    //rotateX(angleX*2)
    rotateY(angleY*2)

    // rotateX(mappers.fn(cos(t+x/cols), -1, 1, -PI, PI, easing.easeInOutQuart)*2)
    // rotateY(mappers.fn(sin(t+y/rows), -1, 1, -PI, PI, easing.easeInOutExpo)*2)

    translate(
      cellVector.x,
      cellVector.y*screenRatio,
      -d/2
    )

    // rotateZ(mappers.fn(sin(t+y/rows), -1, 1, -PI, PI, easing.easeInOutExpo))
    // rotateX(map(sin(2*time-y/10), -1, 1, -PI, PI)/4)
    // rotateY(map(cos(time+x/10), -1, 1, -PI, PI)/4)

    box(w, h*screenRatio, -d)
    pop()
  })

  orbitControl();
});
