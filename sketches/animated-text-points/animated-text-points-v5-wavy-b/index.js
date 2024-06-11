import { sketch, string, mappers, easing, options, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

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
  return cache.store( `${text}-text-points`, () => {
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

sketch.draw( (time) => {
  background(0);

  strokeWeight(2)

  const sceneRotationSpeed = time*1.5;
  rotateY(mappers.fn(sin(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutCubic)/6)
  //rotateX(mappers.fn(cos(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutQuart)/6)

  const speed = time;
  const word = "#test!"
  const font = string.fonts.serif;
  const currentLetter = mappers.circularIndex(speed, word)

  const sampleFactor = 0.5;
  const simplifyThreshold = 0;

  const points = getTextPoints({
    text: currentLetter,
    position: createVector(0, 0),
    size: 1200,
    font,
    sampleFactor,
    simplifyThreshold
  })

  const columns = options.get("grid-columns") ?? 30;
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
  
  grid.draw(gridOptions, (cellVector, { x, y }) => {
    const alpha = cache.store(`${x}-${y}-${currentLetter}-alpha`, () => {
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

    const ww = noise(x/columns+time*2) > 0.2;
    const hh = noise(y/rows-time) > 0.25;
    const extraLines = ( ww && hh )// * (noise(x/columns+cos(time/4), y/rows+sin(time/2)) > 0.5)

    if (!alpha && extraLines) {
      return;
    }

    const xSign = sin(time);
    const ySign = cos(time);
    const chance = noise((xSign*(x/columns)+ySign*(y/rows))+time)

    const coco = colors.rainbow({
      hueOffset: time,
      hueIndex: cellVector.x+ cellVector.y,
    })

    const { levels: [ r, g, b ] } = coco;

    stroke(coco)
    fill(color(r, g, b, alpha))

    if ( chance > 0.5 ) {
      stroke(32,32,255)
      cross(cellVector, size)
    }
    else {

      const w = size-1//map(sin(cellVector.x+time), -1, 1, 10, 20)
      const h = size-1//map(cos(cellVector.x+time), -1, 1, 10, 20)
      let d = 100 * noise(x/columns/2, y/rows+time/2)
      d = sin(5*time+y/rows*4) * 100

      push()
      
      // rotateY(mappers.fn(sin(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutExpo)/6)
      // rotateX(mappers.fn(cos(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutQuart)/10)
      
      translate(
        cellVector.x,
        cellVector.y,
        d/2
      )

      //box(w, h, d)
      sphere(w)
      pop()
    }
  })

  orbitControl();
});
