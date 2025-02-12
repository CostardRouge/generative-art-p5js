import { sketch, string, mappers, easing, options, colors, cache, grid } from './utils/index.js';

sketch.setup( () => {
  setAttributes('antialias', true);
  //perspective(PI / 3.0, width / height, 0.1, 500);
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

  rotateX(map(sin(time), -1, 1, -PI, PI)/12)
  rotateY(map(cos(time/2), -1, 1, -PI, PI)/12)

  const word = "abcdefgh"
  const font = string.fonts.sans;

  const columns = options.get("grcolumnsolumns") ?? 30//map(sin(time), -1, 1, 20, 30);
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
    const xx = sin(time);
    const yy = cos(time);
    const currentLetter = mappers.circularIndex((xx*(x/columns)+yy*(y/rows))+time, word)
    const points = getTextPoints({
      font,
      size: 800,
      sampleFactor: 0.5,
      simplifyThreshold: 0,
      text: currentLetter,
      position: createVector(0, 0),
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

    const xSign = sin(time);
    const ySign = cos(time);
    const chance = noise((xSign*(x/columns)+time/3+ySign*(y/rows))+time)

    const coco = colors.rainbow({
      hueOffset: time*5,
      hueIndex: cellVector.x + cellVector.y,
    })

    const { levels: [ r, g, b ] } = coco;

    normalMaterial();
    stroke(coco)
    //fill(color(r, g, b, alpha))

    if ( chance > 0.5 ) {
      // stroke(32,32,255)
      cross(cellVector, size-1)
    }
    else {
  
      const w = size-1//map(sin(cellVector.x+time), -1, 1, 10, 20)
      const h = size-1//map(cos(cellVector.x+time), -1, 1, 10, 20)
      const d = -10000// * noise(x/columns/2, y/rows+time/2)

      push()
      
      // rotateY(mappers.fn(xx*sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/12)
      // rotateX(mappers.fn(yy*cos(time*2), -1, 1, -PI, PI, easing.easeInOutQuart)/6)
      
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
