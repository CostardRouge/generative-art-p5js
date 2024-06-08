import { options, sketch, iterators, colors, mappers, grid, easing } from './utils/index.js';

options.add( [
  {
    id: "noise-detail-lod",
    type: 'number',
    label: 'Noise detail lod',
    min: 0,
    max: 32,
    defaultValue: 3,
    category: 'Noise'
  },
  {
    id: "noise-detail-falloff",
    type: 'slider',
    label: 'Noise detail falloff',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.45,
    category: 'Noise'
  },
] );

sketch.setup( );

const easingFunctions = Object.entries(easing)

function arrow(options) {
  const {
    position = createVector(0, 0),
    borderColor = color(255),
    borderWidth = 1,
    backgroundColor = color(0),
    size,
    angle = 0,
  } = options;

  push();
  translate(position)
  rotate(angle)

  stroke(borderColor)
  strokeWeight(borderWidth)
  fill(backgroundColor)

  line( -size, 0, size, 0 );
  line( size, 0, size/2, size/2 );
  line( size, 0, size/2, -size/2 );
  pop()
}

function drawBackgroundPattern(time, cols = 30, rows = 50, center) {
  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;
    const angle = noise(yOff + time/5, xOff + time/2)*TAU;

    // const energy = audio.capture.energy.getHistoryFromVector(xOff, yOff)
    const borderWidth = 2//map(energy, 0, 255, 0, 5)

    arrow({
      angle,
      position: cellVector,
      borderColor: colors.rainbow({
        hueOffset: 0,
        hueIndex: map(center.dist(cellVector), 0, 500, -PI,  PI, true),
        opacityFactor: mappers.fn(center.dist(cellVector), 0, 250, 1, 5),
        opacityFactor: mappers.fn(center.dist(cellVector), 0, 250, 2, 5, easingFunctions[4][1])
      }),
      borderWidth: borderWidth,
      size: 15
    })
  })
}

sketch.draw( (time, center) => {
  background(0);

  drawBackgroundPattern(time, 10, 15, center);

  const boundary = 250;
  const start = createVector( width/2, boundary );
  const end = createVector( width/2, height - boundary );

  noiseDetail(
    options.get("noise-detail-lod"),
    options.get("noise-detail-falloff"),
  );

  // let nrj = 0
  // vectorAngles.push(map( mouseX, 0, width, 0, TAU, true));

  const vectorsCount = (128*6);
  const lerpStep = 1 / vectorsCount;

  iterators.vector(start, end, lerpStep, ( vector, lerpIndex, isFirst, isLast) => {
    let angle = noise(lerpIndex+time/3)*TAU;
    // angle = map(sin(time/2+lerpIndex+cos(angle-time/2)), -1, 1, -PI, PI);

    angle = map(sin(time/1.25+lerpIndex), -1, 1, -PI, PI);

    const colorFunction = isLast ? colors.purpleSimple : colors.rainbow;

    const coco = colorFunction({
      hueOffset: 0,
      hueIndex: mappers.fn(sin(angle), -1, 1, -PI, PI)*4,
      opacityFactor: mappers.fn(cos(angle), -1, 1, 2.5, 1),
      opacityFactor: mappers.fn(lerpIndex, 0, 1, 5, 1, easingFunctions[4][1])
    })

    arrow({
      position: vector,
      borderColor: coco,
      borderWidth: 40,
      size: 150,//*nrl/255,
      angle: (
        angle + PI +
        mappers.fn(sin(angle), -1, 1, -PI, PI)
      )
    })
  })

  // vectorAngles.shift()
  // debug.print(nrj)
});
