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
  constructor(options) {
    Object.assign(this, options);

    this.moves = {
      [LEFT_ARROW]: [-1, 0],
      [RIGHT_ARROW]: [1, 0],
      [UP_ARROW]: [0, -1],
      [DOWN_ARROW]: [0, 1],
    }
  }

  draw() {
    const { position: { x, y }, size, cols, rows } = this;

    const W = width / cols;
    const H = height / rows;

    const position = createVector(
      size/2 + (x * W) - width/2,
      size/2 + (y * W) - height/2,
      size/2,
    )

    push()
    translate(position)
    //translate(0, 0, size/6)

    // rotateY(x)

    stroke(255, 0, 0)
    strokeWeight(2)

    box(size, size, size)
    pop()
  }

  update(time) {
    const { moves, cols,rows,  position } = this;

    for ( const key in moves ) {
      const [ x, y ] = moves[ key ]; 

      if (keyIsDown(key)) {
        position.x = constrain(position.x + x, 0, cols -1)
        position.y = constrain(position.y + y, 0, rows -1)
      }
    }
  }
}

sketch.setup( undefined , { type: 'webgl'});

events.register("post-setup", function () {
  events.register("engine-on-key-typed", function () {
    console.log(events.handle("engine-get-key-typed"));
    if (!events.handle("engine-get-key-typed").includes(" ")) {
      return;
    }
  });
});

sketch.draw( (time, center) => {
  background(0);

  const cols = 10;
  const rows = cols*height/width;
  const cellSize = width/cols;

  rotateX(PI/4)

  stroke(255)
  strokeWeight(1)

  const cubes = cache.store("cubes", () => {
    return [
      new Cube({
        position: createVector(0, 0),
        size: cellSize,
        cols, rows
      })
    ]
  });

  push()
  translate(-center.x, -center.y)
  drawGrid(cols, rows, -time)
  pop()

  cubes.forEach( cube => cube.update(time) );
  cubes.forEach( cube => cube.draw() );
  
  return orbitControl();

  const size = (width);
  const sampleFactor = 1/10;
  const simplifyThreshold = 0;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2),
    rows,
    cols,
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
      +position.x/cols/100
      +position.y/rows/100
    )

    const hue = noise(
      position.x/cols + (
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