import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl' });
// sketch.setup();

function lerpBezierSpline(bezierSpline, progression) {
  const curveCount = bezierSpline.curves.length;
  const curveIndex = constrain(~~(progression * curveCount), 0, curveCount-1);
  const curve = bezierSpline.curves[curveIndex ];
  const curveProgression = (progression * curveCount) % 1;

  return {
    position: getCubicBezierPoint( curve.p0, curve.c0, curve.c1, curve.p1, curveProgression ),
    tangent: getCubicBezierTangent( curve.p0, curve.c0, curve.c1, curve.p1, curveProgression )
  }
}

function getCubicBezierTangent( p0, p1, p2, p3, t) {
  const u = 1 - t;
  const u2 = u * u;
  const t2 = t * t;

  const tangentX =
    3 * u2 * (p1.x - p0.x) +
    6 * u * t * (p2.x - p1.x) +
    3 * t2 * (p3.x - p2.x);
  const tangentY =
    3 * u2 * (p1.y - p0.y) +
    6 * u * t * (p2.y - p1.y) +
    3 * t2 * (p3.y - p2.y);
  const tangentZ =
    3 * u2 * (p1.z - p0.z) +
    6 * u * t * (p2.z - p1.z) +
    3 * t2 * (p3.z - p2.z);

  const tangentMagnitude = Math.sqrt(
    tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ
  );
  
  // Normalize the tangent vector
  const tangent = {
    x: tangentX / tangentMagnitude,
    y: tangentY / tangentMagnitude,
    z: tangentZ / tangentMagnitude,
  };

  return tangent;
}

function getCubicBezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;

  const b0 = u3;
  const b1 = 3 * u2 * t;
  const b2 = 3 * u * t2;
  const b3 = t3;

  const x = b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x;
  const y = b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y;
  const z = b0 * p0.z + b1 * p1.z + b2 * p2.z + b3 * p3.z;

  return createVector(x, y, z);
}


sketch.draw( (time, center) => {
  background(0);

  // rotateX(frameCount * 0.01);
  // rotateY(frameCount * 0.01);

  const w = width / 4;
  const h = height / 4;

  const bezierSpline = {
    curves: [
      {
        p0: createVector(-w, 0),
        c0: createVector(50, 100),
        c1: createVector(150, -100),
        p1: createVector(200, 0)
      },
      {
        p0: createVector(200, 0),
        c0: createVector(250, 100),
        c1: createVector(350, -100),
        p1: createVector(w, 0)
      }
    ]
  };

  noFill();
  stroke(255)
  strokeWeight(5)

  for (const { p0, c0, c1, p1 } of bezierSpline.curves) {
    const { x: x1, y: y1 } = p0;
    const { x: x2, y: y2 } = c0;
    const { x: x3, y: y3 } = c1;
    const { x: x4, y: y4 } = p1;

    // drawPoint(p0, "red")
    // drawPoint(p1, "red")

    // drawPoint(c0, "green")
    // drawPoint(c1, "green")

    bezier(x1, y1, x2, y2, x3, y3, x4, y4);
  }

  const progression = map(mouseX, 0, width, 0, 1, 1);
  const { position, tangent } = lerpBezierSpline(bezierSpline, progression)

  drawPoint(position, "yellow")
  drawPoint(tangent, "blue")

  orbitControl()
});


function drawPoint(position, color, weight = 20) {
  push()
  stroke(color)
  strokeWeight(weight)
  translate(position)
  point(0, 0)
  pop()
}
