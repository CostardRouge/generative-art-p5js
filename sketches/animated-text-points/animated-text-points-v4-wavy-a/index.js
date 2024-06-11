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

const word = "2+2=??"

sketch.draw( time => {
  background(0);
  strokeWeight(2)

  const sceneRotationSpeed = time//*1.5;

  rotateY(mappers.fn(sin(sceneRotationSpeed), -1, 1, -PI, PI, easing.easeInOutExpo)/6)
  rotateX(PI/6)

  const font = string.fonts.serif;

  const sampleFactor = 0.5;
  const simplifyThreshold = 0;

  const columns = options.get("grcolumnsolumns") ?? 30;
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
    const xSign = sin(time);
    const ySign = cos(time);
    const chance = noise((xSign*(x/columns)+ySign*(y/rows))+time)

    const currentLetter = mappers.circularIndex(chance+time/2, word)
    const points = getTextPoints({
      text: currentLetter,
      position: createVector(0, 0),
      size: 1200,
      font,
      sampleFactor,
      simplifyThreshold
    })

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

    if (!alpha) {
      return;
    }

    const coco = colors.rainbowCrazy({
      hueOffset: time,//+map(sin(time+y/columns*10), -1, 1, 1, 5),
      hueIndex: cellVector.x+cellVector.y,
      // opacityFactor: map(alpha, 0, 255, 1, 2.5)
      // opacityFactor: map(sin(10*time+y/columns*10), -1, 1, 1, 5)
      //hueIndex: (chance * TAU)*6
    })

    const { levels: [ r, g, b ] } = coco;

    stroke(coco)
    fill(color(r, g, b, alpha))

    if ( chance > 0.5 ) {
      push()

      translate(
        cellVector.x,
        cellVector.y,
        50 * sin(time+y/rows*10)
      )

      circle(0, 0, 20)
      pop()
    }
    else {
      push()

      translate(
        cellVector.x,
        cellVector.y,
        50 * sin(5*time+y/rows*10)
      )

      sphere(size-1)
      pop()
    }
  })

  orbitControl();
});
