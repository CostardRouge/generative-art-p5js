import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl' });

const easingFunctions = Object.entries(easing)


function pipe({position, radius, height, angleStart, angleStop, sides}) {
  const angleStep = (angleStop - angleStart) / sides;
  
  push();
  translate(position.x, position.y, position.z);
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= sides; i++) {
    const angle = angleStart + i * angleStep;
    const x1 = radius * cos(radians(angle));
    const y1 = radius * sin(radians(angle));
    vertex(x1, y1, 0);
    vertex(x1, y1, height);
  }
  endShape();
  pop();
}

function drawPipe(path, radius) {
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    push();
    translate(start.x, start.y, start.z);
    const direction = createVector(end.x - start.x, end.y - start.y, end.z - start.z);
    const distance = direction.mag();
    if (distance > 0) {
      const angle1 = atan2(direction.y, direction.x);
      const angle2 = acos(direction.z / distance);
      rotateZ(angle1);
      rotateY(angle2);
    }
    const sides = 16;
    const angle = 360 / sides;
    const height = distance;
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j <= sides; j++) {
      const x1 = radius * cos(radians(j * angle));
      const y1 = radius * sin(radians(j * angle));
      vertex(x1, y1, 0);
      vertex(x1, y1, height);
    }
    endShape();
    pop();
  }
}

sketch.draw( (time, center) => {
  background(0);
  stroke(255)

  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);

  const path = [    createVector(-50, 0, 0),    createVector(0, 0, 50),    createVector(50, 0, 0),    createVector(0, 0, -50),    createVector(-50, 0, 0),  ];

  followPath(path, (pos, dir) => { // Call the followPath function with the desired path and a callback function that receives the current position and direction
    push();
    translate(pos.x, pos.y, pos.z);
    rotateY(dir.heading());
    drawArrow(5, 20);
    pop();
  });

  orbitControl()
});

function drawArrow(arrowSize, lineSize) {
  fill(255, 0, 0);
  cone(arrowSize, lineSize);
  translate(0, lineSize / 2, 0);
  cylinder(arrowSize / 2, lineSize);
}

function followPath(path, callback) {
  for (let i = 0; i < path.length - 1; i++) {
    const pos = path[i];
    const dir = p5.Vector.sub(path[i+1], pos);
    callback(pos, dir);
  }
}
