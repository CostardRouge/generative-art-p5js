import { sketch, string, mappers, easing, options, colors, cache, grid } from './utils/index.js';

sketch.setup( () => {
  setAttributes('antialias', true);
}, { type: 'webgl'});

options.add( [
  {
    id: "grid-columns",
    type: 'slider',
    label: 'columns',
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

function cross({ x, y }, size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

const borderSize = 2;

sketch.draw( (time) => {
  background(0);
  strokeWeight(borderSize)

  //const sceneRotationSpeed = time*1.5;
  //rotateY(mappers.fn(sin(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutCubic)/6)
  //rotateX(mappers.fn(cos(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  //rotateX(map(sin(time), -1, 1, -PI, PI)/12)
  //rotateY(map(cos(time/2), -1, 1, -PI, PI)/12)

  const word = "Turbulence "
  const columns = options.get("grid-columns") ?? 40//map(sin(time), -1, 1, 30, 40);
  const rows = columns*height/width;
  const size = width/columns

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2 ),
    rows,
    columns,
    centered: true
  }

  const fonts = {
    //sans: string.fonts.sans,
    serif: string.fonts.serif
  }

  function a_or_b(value, amount, a = cos, b = sin) {
    return map(amount, 0, 1, a(value), b(value))
  }
  
  grid.draw(gridOptions, (cellVector, { x, y }) => {
    const xSign = sin(time);
    const ySign = cos(time);
    const commonSwitchingIndex = (xSign*(x/columns)+ySign*(y/rows));
    const currentLetter = mappers.circularIndex(commonSwitchingIndex+time, word)
    const currentFontName = mappers.circularIndex(commonSwitchingIndex+time, Object.keys(fonts))
    const points = getTextPoints({
      font: fonts[currentFontName],
      size: 900,
      sampleFactor: 1,
      simplifyThreshold: 0,
      text: currentLetter,
      position: createVector(0, 0),
    })
    
    const alphaCacheKey = cache.key(x, y, ~~columns, currentLetter, currentFontName, "alpha")
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

    const hue = noise(x/columns, y/rows+time/4 )

    const coco = colors.rainbow({
      hueOffset: 0,
      hueIndex: map(hue, 0, 1, -PI, PI)*4,
      opacityFactor: map(hue, 0, 1, 2.1, 1 ),
    })

    //const { levels: [ r, g, b ] } = coco;

    normalMaterial();
    stroke(coco)

    // if ( hue > 0.7 ) {
    //   stroke(color(r, g, b, 230))
    //   fill(0)
    // }

    const w = size//-borderSize*2//map(sin(time-y/10), -1, 1, 10, 20)
    const h = size//-borderSize*2//map(cos(time+x/10), -1, 1, 10, 20)
    const d = 150// * 20*noise(x/columns/2, y/rows+time/2)

    push()

    rotateX(map(sin(time-y/10), -1, 1, -PI, PI)/6)
    rotateY(map(cos(time+x/20), -1, 1, -PI, PI)/6)

    const t = time// * 1.5;

    rotateX(mappers.fn(cos(t-y/20), -1, 1, -PI, PI, easing.easeInOutQuart)/6)
    rotateY(mappers.fn(sin(t+x/15), -1, 1, -PI, PI, easing.easeInOutExpo)/6)

    // rotateX(mappers.fn(cos(t+x/columns), -1, 1, -PI, PI, easing.easeInOutQuart)*2)
    // rotateY(mappers.fn(sin(t+y/rows), -1, 1, -PI, PI, easing.easeInOutExpo)*2)

    translate(
      cellVector.x,
      cellVector.y*1.5,
      -d/2
    )

    // rotateZ(mappers.fn(sin(t+y/rows), -1, 1, -PI, PI, easing.easeInOutExpo))

    // rotateX(map(sin(2*time-y/10), -1, 1, -PI, PI)/4)
    // rotateY(map(cos(time+x/10), -1, 1, -PI, PI)/4)

    box(w, h*1.5, -d)
    pop()
  })

  orbitControl();
});
