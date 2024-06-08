import { sketch, string, mappers, easing, options, colors, cache, grid } from './utils/index.js';

sketch.setup( () => {
  setAttributes('antialias', true);
  //perspective(PI / 3.0, width / height, 0.1, 500);
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

function cross({ x, y }, size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

const borderSize = 2;

sketch.draw( (time) => {
  background(0);
  strokeWeight(borderSize)

  const sceneRotationSpeed = time
  rotateY(mappers.fn(sin(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutCubic)/6)
  //rotateX(mappers.fn(cos(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  rotateX(map(sin(time), -1, 1, -PI, PI)/12)
  rotateY(map(cos(time*2), -1, 1, -PI, PI)/12)

  const word = "#sans"
  const cols = options.get("grid-cols") ?? 30//map(sin(time), -1, 1, 20, 30);
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
    serif: string.fonts.serif
  }
  
  grid.draw(gridOptions, (cellVector, { x, y }) => {
    const xx = sin(time);
    const yy = cos(time);
    const currentLetter = mappers.circularIndex((xx*(x/cols)+yy*(y/rows))+time, word)
    const currentFontName = mappers.circularIndex((xx*(x/cols)+yy*(y/rows))+time, Object.keys(fonts))
    const points = getTextPoints({
      font: fonts[currentFontName],
      size: 1200,
      sampleFactor: 0.5,
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
          ~~map(point.dist(cellVector), 0, size, 255, 0, true)
        );
      }, 0);
    });

    if (!alpha) {
      return;
    }

    const xSign = sin(time);
    const ySign = cos(time);
    const chance = noise((xSign*(x/cols)+time/3+ySign*(y/rows))+time)

    const coco = colors.rainbow({
      hueOffset: time*2,
      hueIndex: cellVector.x + cellVector.y,
      hueIndex: (x/cols*8*2)+(y/rows*8*2)
    })

    const { levels: [ r, g, b ] } = coco;

    //normalMaterial();
    stroke(coco)
    //fill(color(r, g, b, alpha ))

    ambientLight(0);
    //ambientMaterial(r, g, b);

    const w = size-borderSize//map(sin(cellVector.x+time), -1, 1, 10, 20)
    const h = size-borderSize//map(cos(cellVector.x+time), -1, 1, 10, 20)
    const d = 1000// * noise(x/cols/2, y/rows+time/2)

    push()
    
    translate(
      cellVector.x,
      cellVector.y,
      -d/2
    )      

    // rotateX(map(sin(time-y/10), -1, 1, -PI, PI)/6)
    // rotateY(map(cos(time+x/10), -1, 1, -PI, PI)/2)

    // rotateY(mappers.fn(sin(time-y/rows), -1, 1, -PI, PI, easing.easeInOutExpo)/6)
    // rotateX(mappers.fn(cos(time+x/cols), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

    box(w, h, d)
    
    if ( chance > 0.5 ) {
      translate(0, 0, d/2)
      //point(0, 0)
      //fill(coco)
      circle(0, 0, size/2-borderSize)
      // cross({
      //   x: 0,
      //   y: 0
      // }, 2)
    }

    pop()
  })

  orbitControl();
});
