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

sketch.draw( (time) => {
  background(0);
  strokeWeight(2)

  const speed = time*1.5;
  const word = "#*test-abc-123!"
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

    const ww = noise(cellVector.x+time) > 0.15;
    const hh = noise(cellVector.y+time) > 0.15;
    const extraLines = ( ww && hh )

    if (!alpha && extraLines) {
      return;
    }

    const xSign = sin(time);
    const ySign = cos(time);
    let chance = noise((xSign*(x/columns)+ySign*(y/rows))+time)

    chance = noise(x, y+time/10)

    const coco = colors.rainbow({
      hueOffset: time,
      hueIndex: cellVector.x+ cellVector.y,
    })

    const { levels: [ r, g, b ] } = coco;

    stroke(coco)
    fill(color(r, g, b, alpha))

    if ( chance > 0.5 ) {
      circle(cellVector.x, cellVector.y, 20)
    }
    else {
      const w = 15//size-1//map(sin(cellVector.x+time), -1, 1, 10, 20)
      const h = 15//size-1//map(cos(cellVector.x+time), -1, 1, 10, 20)
      const d = 75// * noise(x/columns/2, y/rows+time/2)

      push()
      
      rotateY(mappers.fn(sin(time*1.5), -1, 1, -PI, PI, easing.easeInOutExpo)/12)
      rotateX(mappers.fn(cos(time*1.5), -1, 1, -PI, PI, easing.easeInOutQuart)/12)
      
      translate(
        cellVector.x,
        cellVector.y,
        d/2
      )

      box(w, h, d)
      pop()
    }
  })

  orbitControl();
});
