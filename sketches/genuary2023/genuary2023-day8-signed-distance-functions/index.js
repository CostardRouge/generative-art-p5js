import { events, sketch, cache, converters, animation, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  }
] );

sketch.setup( undefined, { type: 'webgl'});

function distSquared({x: x1, y: y1}, {x: x2, y: y2}) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return dx * dx + dy * dy;

  // return sq(x1 - x2) + sq(y1 - y2);
}

function signedDistanceLine(x, y, x1, y1, x2, y2) {
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;
  let xx, yy;
  if (param < 0) {
      xx = x1;
      yy = y1;
  }
  else if (param > 1) {
      xx = x2;
      yy = y2;
  }
  else {
      xx = x1 + param * C;
      yy = y1 + param * D;
  }
  let dx = x - xx;
  let dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function signedDistanceCircle({x, y}, {x: cx, y: cy}, radius) {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.sqrt(dx*dx + dy*dy);
  
  return d - radius;
}

function signedDistanceVectors(x, y, vectors) {
  let minDist = Infinity;
  let minDistSign = 1;
  for (let i = 0; i < vectors.length; i++) {
      let v1 = vectors[i];
      let v2 = vectors[(i + 1) % vectors.length];
      let dist = pointToSegmentDistance(x, y, v1.x, v1.y, v2.x, v2.y);
      if (dist < minDist) {
          minDist = dist;
          let v = sub(v2, v1);
          minDistSign = (v.x * (y - v1.y) - v.y * (x - v1.x)) > 0 ? 1 : -1;
      }
  }
  return minDist * minDistSign;
}

function getDistanceFromVectors({
  position,
  vectors,
  distanceFn = (currentVector, vector, [ from, to, min, max ]) => (
    ~~mappers.fn(currentVector.dist(vector), from, to, max, min, easeDistanceFn)
  ),
  distanceRange = [0, 1, 0, 1],
  easeDistanceFn
}) {
  // const [ from, to, min, max ] = distanceRange;

  return vectors.reduce( ( result, vector ) => {
    if (max <= result) {
      return result;
    }

    return Math.max(
      result,
      distanceFn(position, vector, distanceRange)
    );
  }, 0);
}

sketch.draw((time, center) => {
  background(0);

  rotateY(mappers.fn(sin(time), -1, 1, -PI, PI, easing.easeInOutExpo)/6)
  rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/6)


  const W = width/2;
  const H = height/2;

  const cols = options.get("grid-cols");
  const rows = cols*height/width;
  const size = width/cols
  const hSize = size/2;

  randomSeed(56)

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const shapes = cache.store("shapes", () => {
    const shapes = Array(10).fill().map( _ => {
      const size = random(50, 150);

      return {
        position: createVector(
          random(-W + size, W - size),
          random(-H + size, H - size),
        ),
        speed: createVector(
          random(-5, 5),
          random(-7, 7),
        ),
        size,
        // vectors: []
      }
    })

    // for (const shape of shapes) {
    //   const { position, size, vectors } = shape;

    //   const steps = ~~map(size, 50, 150, 20, 60)

    //   for (let a = 0; a < TAU; a += TAU / steps) {
    //     const vector = position.copy();

    //     vector.add(
    //       sin(a) * size,
    //       cos(a) * size
    //     );

    //     vectors.push( vector )
    //   }
    // }

    return shapes;
  })

  for (const shape of shapes) {
    const { position, size, speed: { x: vX, y: vY}, vectors } = shape;

    const nextX = position.x + vX + (size * Math.sign(vX))
    const nextY = position.y + vY + (size * Math.sign(vY))

    if (nextX > W || nextX < -W) {
      shape.speed.x *= -1
    }

    if (nextY > H || nextY < -H) {
      shape.speed.y *= -1
    }

    // vectors.forEach(vector => vector.add(vX, vY))
    position.add(vX, vY)

    //shape.size = 100 * abs(sin(time))
  }

  // const points = shapes.reduce( (accumulator, { position }) => ([
  //   ...accumulator,
  //   position
  // ]), [])

  // stroke("red")
  // points.forEach(vector => {
  //   point(
  //     vector.x,
  //     vector.y
  //   )
  // })

  grid.draw(gridOptions, (currentPosition, { x, y}) => {
    // const distance = getDistanceFromVectors({
    //   vectors: shapes,
    //   position: currentPosition,
    //   distanceRange: [0, size, 0, 255],
    //   distanceFn: (currentVector, { position, size}, [ from, _to, min, max ]) => (
    //     mappers.fn(abs(signedDistanceCircle(currentVector, position, size)), from, size, max, min)
    //   ),
    //   // easeDistanceFn: easing.easeInBack,
    // })

    

    const distance = shapes.reduce( (accumulator, { position, size }) => (
      Math.max(
        accumulator,
        // mappers.fn(abs(signedDistanceLine(
        //   currentPosition.x, currentPosition.y,
        //   0, -W,
        //   0, W
        //   )), 0, size, 255, 0),
        mappers.fn(abs(signedDistanceCircle(currentPosition, position, size)), 0, size, 255, 0)
      )
    ), 0)
    
    if (distance) {
      const currentColor = colors.rainbow({
        hueOffset: noise(x/cols, y/rows)*2,
        hueIndex: mappers.fn(distance, 0, 255, -PI, PI),
        opacityFactor: map(distance, 0, 255, 5, 1.5)
      })

      // currentColor.setAlpha(alpha)
      const z = mappers.fn(distance, 0, 255, 1, 50, easing.easeInOutQuad)

      strokeWeight(size/1.5);
      stroke(currentColor)
      point( currentPosition.x, currentPosition.y, z);
    }
    else {
      const showBackgroundDot = mappers.circularIndex(time/2+noise(x/cols, y/rows), [true, false])

      if (showBackgroundDot)  {
        stroke(32, 32, 64)
        point( currentPosition.x, currentPosition.y)
      }
    }
  })

  orbitControl()
});
