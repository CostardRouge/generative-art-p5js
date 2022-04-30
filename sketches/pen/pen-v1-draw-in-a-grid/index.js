import { shapes, sketch, converters, iterators, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "start-size",
    type: 'number',
    label: 'Start size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 15,
    category: 'Integers'
  },
  {
    id: "end-size",
    type: 'number',
    label: 'End size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 15,
    category: 'Integers'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
    category: 'Integers'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Integers'
  },
  {
    id: "size-ratio",
    type: 'number',
    label: 'Size ratio',
    min: 1,
    max: 10,
    defaultValue: 6,
    category: 'Integers'
  },
  {
    id: "x-count",
    type: 'slider',
    label: 'x count',
    min: 1,
    max: 50,
    defaultValue: 10,
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
    currentPathIndex = paths.length;
  });
});

function drawChurros(time){
  let colorIndex = 1
  for (let id = 0; id < paths.length; id++) {
    if (!paths[id]) {
      return;
    }

    const path = paths[id];
    const pathKeys = Object.keys( path );

    // console.log({
    //   path,
    //   pathKeys
    // });

    for (let i = 0; i < pathKeys.length; i++) {
      const vector = path[pathKeys[i]];
      const nextVector = path[pathKeys[i+1]] ?? vector;

      colorIndex = drawChurro(vector, nextVector, i, colorIndex, time, 0);
    }
  }
}

function drawChurro(start, end, index, colorIndex, time) {
  iterators.vector(start, end, 0.03, (position, lerpIndex) => {
    push();
    translate(position);
    // rotate(lerpIndex+radians(-time*20+lerpIndex*2));

    // const size = map(
    //   colorIndex,
    //   0,
    //   100,
    //   options.get("start-size"),
    //   options.get("end-size")
    // );
  
    // const opacityFactor = map(
    //   colorIndex,
    //   0,
    //   100,
    //   map(
    //     sin(lerpIndex + -time * 5 + colorIndex * 5), -1, 1,
    //     options.get("start-opacity-factor"),
    //     options.get("start-opacity-factor") * 2
    //   ),
    //   options.get("end-opacity-factor")
    // );

    // stroke(
    //   color(
    //     map(sin(-time+colorIndex), -1, 1, 0, 360) /
    //       opacityFactor,
    //     map(cos(-time-colorIndex), -1, 1, 360, 0) /
    //       opacityFactor,
    //     map(sin(-time+colorIndex), -1, 1, 360, 0) /
    //       opacityFactor,
    //       // 50
    //   )
    // );

    noStroke()
    // noFill()
    circle(0, 0, 20);

    // const angleCount = 2;
    // const angleStep = TAU / angleCount;

    // iterators.angle(0, TAU, angleStep, angle => {
    //   const vector = converters.polar.vector(
    //     angle,
    //     size * options.get("size-ratio")
    //   );
    //   push();
    //   beginShape();
    //   // strokeWeight(size/2);
  
    //   rotate(sin(0+time+colorIndex));
  
    //   stroke(
    //     color(
    //       map(sin(-time+colorIndex), -1, 1, 0, 360) /
    //         opacityFactor,
    //       map(cos(-time-colorIndex), -1, 1, 360, 0) /
    //         opacityFactor,
    //       map(sin(-time+colorIndex), -1, 1, 360, 0) /
    //         opacityFactor,
    //         // 50
    //     )
    //   );

    //   // line(-vector.x, vector.y, vector.x, -vector.y);
    //   // line(-vector.x, vector.y, vector.x, -vector.y);
    //   // line(vector.x, vector.y, 0, 0, );
      
    //   vertex(vector.x, vector.y);
    //   vertex(-vector.x, -vector.y);
  
    //   endShape();
    //   pop();
    // } );

    pop()
  } );

  return 0;
}

function addVector(x, y) {
  const xCount = options.get("x-count");
  const yCount = options.get("y-count");
  const xSize = width / xCount;
  const ySize = height / yCount;
  
  const squarePosition = createVector(
    Math.floor((x/width)*xCount)*xSize+xSize/2,
    Math.floor((y/height)*yCount)*ySize+ySize/2
  );

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
  stroke(255)
  fill(255)

  const offset = 0;

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      strokeWeight(2)
      line(0, y * ySize, width, y * ySize);
      line(x * xSize, 0, x * xSize, height);

      if (drawn) {
        continue;
      }
      if ( mouseX > x * xSize && mouseX < (x + 1) * xSize &&
           mouseY > y * ySize && mouseY < (y + 1) * ySize ) {
            strokeWeight(0)
        rect(( x + 1/2 ) * (xSize), ( y + 1/2) * ySize, xSize-8, ySize-8);
        drawn = true;
      }
    }
  }
}

function drawPaths(time){
  for (let id = 0; id < paths.length; id++) {
    if (!paths[id]) {
      return;
    }

    drawPath(paths[id], time);

    // console.log(paths[id])
  }
}

function drawPath(path, time) {
  const step = 1;
  const segmentKeys = Object.keys( path );
  
  for (let i = 0; i < segmentKeys.length; i++) {
    const vector = path[segmentKeys[i]];
    const nextVector = path[segmentKeys[i+1]] ?? vector;
    // const hueIndex = map(i, 0, segmentKeys.length/2, -PI/2, PI/2)
    const hueIndex = map(sin(i/10+time), -1, 1, -PI/2, PI/2)

    // const angleCount = 5;
    // const angleStep = TAU / angleCount;

    // for (let angle = 0; angle < TAU; angle += angleStep) {
     
    //   push();
  
    //   beginShape();
    //   strokeWeight(35);
  
    //   // rotate(hueIndex+radians(-time*20+hueIndex*2));
    //   // rotate(sin(0+time+lerpIndex+colorIndex));
  
    //   stroke(
    //     color(
    //       map(sin(-time+hueIndex), -1, 1, 0, 360) /
    //         1,
    //       map(cos(-time-hueIndex), -1, 1, 360, 0) /
    //         1,
    //       map(sin(-time+hueIndex), -1, 1, 360, 0) /
    //         1,
    //         // 50
    //     )
    //   );

    //   vertex(vector.x, vector.y, vector.z);
    //   vertex(nextVector.x, nextVector.y, nextVector.z);

    //   // line(vector.x, vector.y, 0, 0, );
      
    //   // vertex(vector.x, vector.y);
    //   // vertex(-vector.x, -vector.y);
  
    //   endShape();
    //   pop();
    // }
    
    beginShape(LINES)
  
    // strokeWeight( map(i+time*5, path.length, 150, 1) );
    strokeWeight( 50 );
    
    stroke(
        map(sin(-time+hueIndex), -1, 1, 0, 360),
        map(cos(-time-hueIndex), -1, 1, 0, 255),
        map(sin(-time+hueIndex), -1, 1, 255, 0),
        //map(i, 0, path.length, 0, 255)
      );
    
    vertex(vector.x, vector.y, vector.z);
    vertex(nextVector.x, nextVector.y, nextVector.z);
  
    endShape(CLOSE)
  }
}

sketch.draw((time) => {
  background(0);
  drawGrid();
  drawPaths(time);
  drawChurros(time);
});
