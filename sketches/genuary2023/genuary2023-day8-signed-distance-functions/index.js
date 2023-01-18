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

// events.register("post-setup", () => {
//   audio.capture.setup(0, 512)
//   events.register("post-draw", audio.capture.energy.recordHistory );
//   midi.setup()
// });

sketch.setup( undefined, { type: 'webgl'});

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

function getAlphaFromMask({ position, maskPoints, maskId, distance = 0.025, alphaRange = [0, 255]}) {
  const { x, y } = position;

  const alpha = cache.store(`${x}-${y}-${maskId}-alpha`, () => {
    const [ minAlpha, maxAlpha ] = alphaRange;

    return maskPoints.reduce( ( result, pointPosition ) => {
      if (255 <= result) {
        return result;
      }

      return Math.max(
        result,
        ~~map(pointPosition.dist(position), 0, distance, maxAlpha, minAlpha, true)
      );
    }, 0);
  });

  return alpha;
}

sketch.draw((time, center) => {
  background(0);

  const cols = options.get("grid-cols");
  const rows = cols*height/width;
  const size = width/cols
  const hSize = size/2;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols,
    // startLeft: createVector( 0, 0 ),
    // startRight: createVector( width, 0 ),
    // endLeft: createVector( 0, height ),
    // endRight: createVector( width, height ),
    // rows,
    // cols,
    centered: options.get("grid-cell-centered")
  }

  const values = [ 
    createVector(1, 3),
    // createVector(3, 6),
    // createVector(3, 2),
    // createVector(2, 4),
    // createVector(5, 4),
  ]

  const d = width / 4;
  const samplingCount = 60;

  // const generatedAnimatedMaskPoints = cache.store("generated-animated-mask-points", () => {
  //   const result = [ ]
  //   const totalDuration = values.length;
  //   const totalMaskPoints = totalDuration * samplingCount;

  //   for (let i = 0; i < totalMaskPoints; i += 1) {
  //     const points = [];

  //     const { x, y } = animation.ease({
  //       values,
  //       currentTime: map(i, 0, totalMaskPoints, 0, totalDuration, true),
  //       duration: 1,
  //       easingFn: easing.easeInOutExpo,
  //       lerpFn: p5.Vector.lerp,
  //     })

  //     for (let a = 0; a < TAU; a += TAU / 120) {
  //       points.push(
  //         createVector(
  //           sin(a*x) * d,
  //           cos(a*y) * d,
  //         )
  //       )
  //     }

  //     result.push({
  //       id: `points-group-id-${i}`,
  //       points
  //     });
  //   }

  //   return result;
  // })

  // const generatedAnimatedMaskPoints = cache.store("generated-animated-mask-points", () => {
  //   const input = [2, 3, 4, 5]

  //   const result = [ ]
  //   const totalDuration = input.length;
  //   const totalMaskPoints = totalDuration * samplingCount;

  //   for (let i = 0; i < totalMaskPoints; i += 1) {
  //     const points = [];
  //     const inputIndex = map(i, 0, totalMaskPoints, 0, totalDuration, true);

  //     const f = animation.ease({
  //       values: input,
  //       currentTime: inputIndex,
  //       duration: 1,
  //       easingFn: easing.easeInOutExpo,
  //       // lerpFn: p5.Vector.lerp,
  //     })

  //     const r = map(inputIndex, 0, totalDuration, width / 6, width / 3)

  //     for (let a = 0; a < TAU; a += TAU / 360) {
  //       points.push(
  //         createVector(
  //           sin(a*f) * r,
  //           cos(a) * r,
  //         )
  //       )
  //     }

  //     result.push({
  //       id: `points-group-id-${i}`,
  //       points
  //     });
  //   }

  //   return result;
  // })

  const generatedAnimatedMaskPoints = cache.store("generated-animated-mask-points", () => {
    const input = Array(10).fill(undefined).map( _ => {
      const size = random(50, 150);
      const W = width/2 - size
      const H = height/2 - size

      return {
        position: createVector(
          random(-W, W),
          random(-H, H),
        ),
        speed: createVector(
          random(-10, 10),
          random(-10, 10),
        ),
        size
      }
    })

    const result = [ ]
    const totalDuration = input.length;
    const totalMaskPoints = totalDuration * samplingCount;

    for (let i = 0; i < totalMaskPoints; i += 1) {
      const points = [];

      for (const dot of input) {
        const { position, size, speed: { x: vX, y: vY} } = dot;

        const steps = map(size, 50, 150, 40, 60)
        for (let a = 0; a < TAU; a += TAU / steps) {
          const p = position.copy();

          p.add(
            sin(a) * size,
            cos(a) * size
          )

          

          // if (p.y > height/2) {
          //   p.y = -height/2
          // }
          // if (p.y < -height/2) {
          //   p.y = height/2
          // }

          // if (p.x > width/2) {
          //   p.x = -width/2
          // }
          // if (p.x < -width/2) {
          //   p.x = width/2
          // }

          // if (p.y > height/2) {
          //   p.y = -height/2
          // }
          // if (p.y < -height/2) {
          //   p.y = height/2
          // }
          points.push( p )
        }

        position.add(vX, vY)

        const nextX = position.x + vX + size
        const nextY = position.y + vY + size

        if (nextX >= width/2 || nextX <= -width/2) {
          dot.speed.x *= -1
        }

        if (nextY >= height/2 || nextY <= -height/2) {
          dot.speed.y *= -1
        }
      }

      result.push({
        id: `points-group-id-${i}`,
        points
      });
    }

    return result;
  })


  // console.log(generatedAnimatedMaskPoints);

  const { id, points  } = mappers.circularIndex(time*60, generatedAnimatedMaskPoints);

  // for (const vector of points) {
  //   stroke("red")

  //   point(
  //     vector.x,
  //     vector.y
  //   )
  // }

  // return

  grid.draw(gridOptions, (currentPosition, { x, y}) => {
    const alpha = getAlphaFromMask({
      maskId: id,
      maskPoints: points,
      position: currentPosition,
      distance: size*4,
    })

    //currentPosition.add(0, 0, map(alpha, 0, 255, 1, 100))

    
    if (alpha) {

      const currentColor = colors.rainbow({
        hueOffset: 0,
        hueIndex: mappers.fn(alpha, 0, 255, -PI/2, PI/2)*2,
        opacityFactor: map(alpha, 0, 255, 5, 1.5)
      })

      //currentColor.setAlpha(alpha)



      fill(currentColor)
      noStroke()

      push();
      translate( currentPosition.x, currentPosition.y, currentPosition.z );

      //strokeWeight(size);
      strokeWeight(10);
      stroke(currentColor)
      point( 0, 0, currentPosition.z);

      // rect(-hSize, -hSize, size)


      pop();
    }
    else {
      stroke(32, 32, 64)
      point( currentPosition.x, currentPosition.y)
    }

    
    
    
  })

  orbitControl()
});
