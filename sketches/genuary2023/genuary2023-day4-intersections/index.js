import { sketch, string, mappers, events, easing, animation, iterators, colors, cache, grid } from './utils/index.js';

function flower(size, step, keepSize) {
  const incrementStep = TAU / step;

  for (let angle = 0; angle <= TAU; angle += incrementStep) {
    const position = createVector(
      size * sin(angle),
      size * cos(angle)
    )
  
    const nextPosition = createVector(
      size * sin(angle+incrementStep),
      size * cos(angle+incrementStep)
    )

    const middlePosition = createVector(
      size * sin(angle+incrementStep/2),
      size * cos(angle+incrementStep/2)
    )

    const innerSize = keepSize ? size : position.dist(nextPosition)

    // translate(middlePosition.x, middlePosition.y, )
    circle(middlePosition.x, middlePosition.y, innerSize)
    // point(middlePosition.x, middlePosition.y, innerSize)
    // sphere(innerSize/2)
  }
}

function drawGrid(xCount, yCount){
  const xSize = width / xCount;
  const ySize = height / yCount;

  // rectMode(CENTER);
  strokeWeight(1)
  stroke(255)
  fill(255)

  const offset = 0;

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      hl(y * ySize)
      vl(x * xSize)
    }
  }
}

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

let paths = [];

// vertex(vector.x, vector.y, vector.z);
// vertex(nextVector.x, nextVector.y, nextVector.z);
// circle(vector.x, vector.y, vector.z);

const cols = 150;
const rows = 150;
const pathsCount = 5;
const pathLength = [3, 15]

function createPaths() {
  const [pathMinLength, pathMaxLength] = pathLength;

  randomSeed(56)

  paths = Array(pathsCount)
    .fill()
    .map(() => {
      const max = ~~random(pathMinLength, pathMaxLength);
      const start = [~~random(2, cols), ~~random(2, rows)];
      const path = [ start ];

      for (let i = 1; i < max; i++ ) {
        const XorY = i % 2 === 0;
        const [ previousX, previousY ] = path[ path.length -1 ];

        for (let j = 0; j < 2; j++ ) {
          const x = XorY ? ~~random(2, cols) : previousX;
          const y = !XorY ? ~~random(2, rows) : previousY;

          const found = path.find( ([xx, yy ]) => {
            return xx === x && yy === y
          })

          if (!found) {
            for (let xx = previousX -1; xx > x; xx -= 1) {
              path.push( [ xx, y ]);
            }
            for (let xx = previousX +1; xx < x; xx += 1) {
              path.push( [ xx, y ]);
            }

            for (let yy = previousY -1; yy > y; yy -= 1) {
              path.push( [ x, yy ]);
            }
            for (let yy = previousY +1; yy < y; yy += 1) {
              path.push( [ x, yy ]);
            }

            path.push( [ x, y ]);
            break
          }
        }
      }

      console.log(path)

      return path.map(getPosition);
    })
}

sketch.setup( () => {
  noFill();
  createPaths()

  events.register("engine-mouse-pressed", function () {
    createPaths()
  });
}, { type: 'webgl'});

function cross({ x, y }, size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

function getPosition([x, y]) {
  const xSize = width / cols;
  const ySize = height / rows;

  return createVector(
    ( x * xSize ) + xSize/2,
    ( y * ySize ) + ySize/2
  );
}

sketch.draw( (time, center) => {
  background(0);

  // push()
  // translate(-center.x, -center.y, -120)
  // drawGrid(cols/95, rows/95)
  // pop()

  translate(-center.x, -center.y)

  // stroke(128, 128, 255)
  strokeWeight(4)

  paths.forEach( (vectors, pathIndex) => {
    vectors.forEach( ({x, y, z}, vectorIndex) => {
      const progression = map(vectorIndex, 0, vectors.length-1, 0, 1);

      const colorFunction = mappers.circularIndex(time/4+progression, [
        //colors.purple,
        colors.rainbow,
        //colors.black
      ]);
  
      fill(colorFunction({
        hueOffset: 0,//+pathIndex+progression,
        hueIndex: mappers.fn(progression, 0, 1, -PI, PI)*8,
        opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
        opacityFactor: map(sin(pathIndex+progression*50+time), -1, 1, 3, 1)
      }))

      if (vectorIndex ===0 || vectorIndex === vectors.length-1) {
        fill(0, 0, 32)
      }
      
      const amt = mappers.circularIndex(pathIndex+time/4+progression, [,4]);
      let size = 20//mappers.circularIndex(time/4+progression, [10, 30]);
      size = mappers.fn(sin(time+progression*50), -1, 1, 10, 40, easing.easeInOutQuint)

      push()
      translate(x, y)
      rotate(-time+amt);
      rotate(progression*50);
      flower(size, amt)
      pop()
    })
  })

  orbitControl()
});
