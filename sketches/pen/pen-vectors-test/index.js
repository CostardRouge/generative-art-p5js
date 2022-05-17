import { shapes, sketch, converters, mappers, events, colors, iterators, options } from './utils/index.js';

options.add( [
  {
    id: "x-count",
    type: 'slider',
    label: 'x count',
    min: 1,
    max: 50,
    defaultValue: 15,
    category: 'Integers'
  },
  {
    id: "y-count",
    type: 'slider',
    label: 'y count',
    min: 1,
    max: 50,
    defaultValue: 15,
    category: 'Integers'
  }
] );

const paths = [];
let currentPathIndex = 0;

sketch.setup(() => {
  events.register("mouseDragged", function () {
    addVector(mouseX, mouseY);
  });

  events.register("mouseReleased", function () {
    currentPathIndex = paths.length;
  });

  events.register("doubleClicked", function () {
    paths.pop();
  });
});

function addVector(x, y) {
  const xCount = options.get("x-count");
  const yCount = options.get("y-count");

  const xSize = width / xCount;
  const ySize = height / yCount;
  
  const squarePosition = createVector(
    // x, y,
    Math.floor((x/width)*xCount)*xSize+xSize/2,
    Math.floor((y/height)*yCount)*ySize+ySize/2
  );
  // if array
  // const currentPath = paths[currentPathIndex] || [];
  // currentPath.push(squarePosition);

  // if (!paths[currentPathIndex]) {
  //   paths[currentPathIndex] = currentPath;
  // }

  // if object
  const currentSegment = paths[currentPathIndex] || {};
  currentSegment[ squarePosition.x + "-" + squarePosition.y ] = squarePosition;;
  paths[currentPathIndex] = currentSegment;
}

function drawGrid(){
  let drawn = false;
  const xCount = options.get("x-count");
  const yCount = options.get("y-count");

  const xSize = width / xCount;
  const ySize = height / yCount;

  rectMode(CENTER);
  strokeWeight(2);
  stroke(128, 128, 255);
  fill(128, 128, 255);

  const offset = 0;

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, y * ySize, width, y * ySize);
      line(x * xSize, 0, x * xSize, height);

      if (drawn) {
        continue;
      }
      if ( mouseX > x * xSize && mouseX < (x + 1) * xSize &&
           mouseY > y * ySize && mouseY < (y + 1) * ySize ) {
        rect(( x + 1/2 ) * (xSize), ( y + 1/2) * ySize, xSize-8, ySize-8);
        drawn = true;
      }
    }
  }
}

function drawPaths(time) {
  //console.log("drawPaths", {paths});
  paths.forEach( (path, pathIndex) => {
    noFill();
    beginShape(LINES)

    const vectors = path.length ? path : Object.values(path);

    iterators.vectors( vectors, (vector, nextVector, vectorIndex, vectorStep) => {
      const hueIndex = pathIndex + map(vectorIndex, 0, vectors.length, -PI, PI)
      const hueSpeed = -time;

      const hueOpacity = mappers.circularMap(
        vectorIndex,
        vectors.length / vectorStep,
        map(
          sin(-time * 2 + vectorIndex / 2 ), -1, 1,
          1,
          5
        ),
        1
      );

      strokeWeight( 80 );

      stroke(
        map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / hueOpacity,
        map(cos(hueSpeed-hueIndex), -1, 1, 360, 0) / hueOpacity,
        map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / hueOpacity
      );

      vertex(vector.x, vector.y, vector.z);
      vertex(nextVector.x, nextVector.y, nextVector.z);
      // circle(vector.x, vector.y, vector.z);
    }, 0.05);

    endShape()
  })
}

function drawMouseLines() {
  stroke(128, 128, 255);
  strokeWeight(2);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);
}

sketch.draw(time => {
  // background(0, 0, 0, 8);
  background(0);
  drawGrid();
  drawPaths(time);
  //drawMouseLines();
});
