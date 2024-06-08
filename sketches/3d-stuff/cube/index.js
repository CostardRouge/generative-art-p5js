import { sketch, options, iterators, converters, debug, events, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(
    "text-points",
    fontFamily,
    text,
    size,
    sampleFactor,
    simplifyThreshold
  )

  return cache.store( textPointsCacheKey, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return ([
      textPoints.map( ({x, y}) => {
        const testPointVector = createVector(x, y);
  
        testPointVector.add((position.x-xCenter),(position.y-yCenter))
  
        return testPointVector;
      }),
      [
        xMin-xCenter,
        yMin-yCenter,
        xMax-xMin,
        yMax-yMin,
      ],
      textPointsCacheKey
    ])
  });
}

function getAlphaFromMask({ position: { x, y }, maskPoints, distance = 0.015}) {
  const normalizedPosition = createVector(
    map(x, -width/2, width/2, 0, 1),
    map(y, -height/2, height/2, 0, 1)
  );

  return maskPoints.reduce( ( result, pointPosition ) => {
    if (true === result) {
      return result;
    }

    const normalizedPointPosition = createVector(
      map(pointPosition.x, -width /2, width/2, 0, 1),
      map(pointPosition.y, -height /2, height/2, 0, 1)
    );

    const d = normalizedPointPosition.dist(normalizedPosition);

    return Math.max(
      result,
      d > 0 && d < distance
    );
  }, 0);
}

function createGridAlphaPoints(gridOptions, textPointsMatrix) {
  return cache.store( `alpha-points-matrix`, () => {
    const alphaPoints = [];

    grid.draw(gridOptions, position => {
      const alphaLayers = [];

      for ( const [ points ] of textPointsMatrix ) {
        const alpha = getAlphaFromMask({
          position,
          maskPoints: points
        })
    
        alphaLayers.push( alpha );
      }

      alphaPoints.push( {
        position,
        layers: alphaLayers
      } );
    });

    return alphaPoints;
  });
}

function drawGrid(xCount, yCount){
  const xSize = width / xCount;
  const ySize = height / yCount;

  rectMode(CENTER);

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

class Cube {
  moves = {
    x: {
      LEFT_ARROW: -1,
      RIGHT_ARROW: 1
    },
    y: {
      UP_ARROW: -1,
      DOWN_ARROW: 1
    }
  }

  constructor(options) {
    Object.assign(this, options);

    this.animation = {
      x: 1,
      y: 1
    };
    this.next = this.position.copy();
    this.rotation = createVector(0, 0);
  }

  draw() {
    const {
      size, columns, rows,
      position: { x, y },
      rotation: { x: rX, y: rY },
      next: { x: nextX, y: nextY },
      animation: { x: xAnimation, y: yAnimation },
    } = this;

    const W = width / columns;
    const H = height / rows;

    const position = createVector(
      size/2 + (x * W) - width/2,
      size/2 + (y * H) - height/2,
      size/2,
    )

    push()
    translate(position)

    rotateX(rY)
    rotateY(rX)

    stroke(255, 0, 0)
    strokeWeight(2)

    box(size, size, size)
    pop()
  }

  update(time) {
    const {
      columns, rows, position, next, animation, animationSpeed,
    } = this;

    if ( animation.x < 1 ) {
      this.animation.x += animationSpeed;
      this.position.x = lerp( position.x, next.x, constrain(
        animation.x, 0, 1
      ) )

      const rDirection = position.x >= next.x ? -PI/2 : PI/2

      this.rotation.x = lerp( 0, rDirection, constrain(
        animation.x, 0, 1
      ) )
    }

    if ( animation.y < 1 ) {
      this.animation.y += animationSpeed;
      this.position.y = lerp( position.y, next.y, constrain(
        animation.y, 0, 1
      ) )

      const rDirection = position.y >= next.y ? PI/2 : -PI/2

      this.rotation.y = lerp( 0, rDirection, constrain(
        animation.y, 0, 1
      ) )
    }

    if ( animation.y >= 1 ) {
      if (keyIsDown(UP_ARROW)) {
        next.y = constrain(position.y - 1, 0, rows -1)
        this.animation.y = 0;
      }

      if (keyIsDown(DOWN_ARROW)) {
        next.y = constrain(position.y + 1, 0, rows -1)
        this.animation.y = 0;
      }
    }

    if ( animation.x >= 1 ) {
      if (keyIsDown(LEFT_ARROW)) {
        next.x = constrain(position.x - 1, 0, columns -1)
        this.animation.x = 0;
      }

      if (keyIsDown(RIGHT_ARROW)) {
        next.x = constrain(position.x + 1, 0, columns -1)
        this.animation.x = 0;
      }
    }
  }
}

sketch.setup( undefined , { type: 'webgl'});

// events.register("post-setup", function () {
//   events.register("engine-on-key-typed", function () {
//     console.log(events.handle("engine-get-key-typed"));
//     if (!events.handle("engine-get-key-typed").includes(" ")) {
//       return;
//     }
//   });
// });

sketch.draw( (time, center) => {
  background(0);

  const columns = 10;
  const rows = columns*height/width;
  const cellSize = width/columns;

  rotateX(PI/4)

  stroke(255)
  strokeWeight(1)

  const cubes = cache.store("cubes", () => {
    return [
      new Cube({
        position: createVector(0, 0),
        animationSpeed: 0.1,
        size: cellSize,
        columns, rows
      })
    ]
  });

  push()
  translate(-center.x, -center.y)
  drawGrid(columns, rows, -time)
  pop()

  cubes.forEach( cube => cube.update(time) );
  cubes.forEach( cube => cube.draw() );
  
  return orbitControl();

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2),
    rows,
    columns,
    centered: true
  }

  const fonts = [
    string.fonts.martian,
    // string.fonts.tilt,
    string.fonts.multicoloure,
    string.fonts.openSans,
    string.fonts.sans,
    string.fonts.serif
  ]

  const textPointsMatrix = fonts.map( font => (
    getTextPoints({
      text: "9",
      position: createVector(0, 0),
      size,
      font,
      sampleFactor,
      simplifyThreshold
    })
  ))

  const alphaPoints = createGridAlphaPoints(
    gridOptions,
    textPointsMatrix
  )

  const rotationMax = PI*2
  const generalAnimationTime = time/2

  const {
    x: rX,
    y: rY,
    //z: rZ
  } = animation.ease({
    values: [
      createVector(), 
      createVector(0, rotationMax),
      createVector(rotationMax, rotationMax),
      createVector(rotationMax),
    ],
    currentTime: generalAnimationTime,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInOutElastic,
    // easingFn: easing.easeInOutCirc,
  })

  rotateX(rX)
  rotateY(rY)

  // const finalPoints = alphaPoints

  alphaPoints.forEach( ( { layers, position }, index ) => {
    const layer = mappers.circularIndex(
      generalAnimationTime+1/2,
      layers
    )
    // const layer = animation.ease({
    //   values: layers,
    //   currentTime: generalAnimationTime+1/2,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo
    // })

    if (!layer) {
      return;
    }

    const switchIndex = generalAnimationTime*2+(
      +index/alphaPoints.length/5
      +position.x/columns/100
      +position.y/rows/100
    )

    const hue = noise(
      position.x/columns + (
        +map(sin(time), -1, 1, 0, 1)
      ),
      position.y/rows + (
        +map(cos(time), -1, 1, 0, 1)
      )
    )

    const tint = colors.rainbow({
      hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI)*2,
      opacityFactor: 1.5
    })

    const { levels: [ red, green, blue ] } = tint;

    push()

    const w = cellSize//-2
    const h = cellSize//-2
    const d = cellSize*20

    translate( position )

    const fillAlpha = animation.ease({
      values: [ 240, 0 ],
      currentTime: switchIndex,
      duration: 1,
      easingFn: easing.easeInOutExpo,
    });

    fill( red, green, blue, fillAlpha )
    stroke( red, green, blue, 200 )
    box(w, h, -d)

    pop()
  } );

  orbitControl();
});
