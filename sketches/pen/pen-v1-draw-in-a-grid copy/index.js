import { shapes, sketch, converters, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "start-size",
    type: 'number',
    label: 'Start size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 50,
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
  const xCount = 1;
  const yCount = 1;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Churros({
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

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

class Churros {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();
  }

  calculateRelativePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRelativePosition();
  }

  draw(time, index) {
    const { position } = this;
    push();
    translate(position.x, position.y);

    const shadowsCount = 1//map(cos(index+time*3)+sin(-time/3+index), -1, 1, 1, 2, true)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const size = map(
        shadowIndex,
        0,
        shadowsCount,
        options.get("start-size"),
        options.get("end-size")
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(index -time * 5 + shadowIndex * 5), -1,  1,
          // shadowIndex, 0, shadowsCount,
          options.get("start-opacity-factor"),
          options.get("start-opacity-factor") * 5
        ),
        options.get("end-opacity-factor")
      );

      const ys = map(cos(index - time*2), -1, 1, -5, 5);
      const ySpeed = map(cos(index + time*2), -1, 1, -ys, ys);

      const xs = map(sin(index - time*2), -1, 1, -5, 5);
      const xSpeed = map(sin(index + time*2), -1, 1, xs, -xs);

      const l = shadowIndex/3;
      const indexCoefficient = shadowIndex + index;
      const x = map(sin(time + 0 - indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time + 0 - indexCoefficient), -1, 1, -l, l);

      // translate(x*5, y*10);
      translate(
        map(mouseX, 0, width, -5, 5),
        map(mouseY, 0, height, -5, 5),
      );

      const angleCount = 7;
      const angleStep = TAU / angleCount;

      for (let angle = 0; angle < TAU; angle += angleStep) {
        const vector = converters.polar.vector(
          angle,
          size * options.get("size-ratio")
        );
        push();

        beginShape();
        strokeWeight(size);

        // rotate(radians(time*20+shadowIndex*2));
        rotate(sin(time+0+shadowIndex));

        stroke(
          color(
            map(sin(-time+shadowIndex+index+(shadowIndex/5)*10), -1, 1, 0, 360) /
              opacityFactor,
            map(cos(-time-shadowIndex+index-(shadowIndex/2.5)*5), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(-time+shadowIndex+index+(shadowIndex/1)*1), -1, 1, 360, 0) /
              opacityFactor,
              // 50
          )
        );
        
        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);

        endShape();
        pop();
      }
    }

    pop();
  }
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

  const currentPath = paths[currentPathIndex] || [];

  currentPath.push(squarePosition);
  paths[currentPathIndex] = currentPath;
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
    drawPath(paths[id]);
  }
}

function drawPath(path) {
  const step = 1;
  
  for (let i = 0; i < path.length; i += 1) {
    const vector = path[i];
    const nextVector = path[i+step] ?? vector;
    const hueIndex = map(i, 0, path.length/TAU, -PI/2, PI/2)
    
    beginShape(LINES)
  
    // strokeWeight( 150)//circularMap(i+time*5, path.length, 150, 1) );
    strokeWeight( 35 );
    
    stroke(
        map(sin(hueIndex), -1, 1, 0, 360),
        map(cos(hueIndex), -1, 1, 0, 255),
        map(sin(hueIndex), -1, 1, 255, 0),
        //map(i, 0, path.length, 0, 255)
      );
    
    vertex(vector.x, vector.y, vector.z);
    vertex(nextVector.x, nextVector.y, nextVector.z);
  
    endShape(CLOSE)
  }
}

sketch.draw((time) => {
  // background(0, 0, 0, 8);
  background(0);
  drawGrid();
  drawPaths(time);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
