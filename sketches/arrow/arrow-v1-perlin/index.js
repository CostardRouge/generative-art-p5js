import { options, sketch, iterators, colors, mappers, grid } from './utils/index.js';

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

function arrow(options) {
  const {
    position = createVector(0, 0),
    borderColor= color(255),
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

function drawBackgroundPattern(time, columns = 30, rows = 50, center) {
  const gridOptions = {
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height ),
    bottomRight: createVector( width, height ),
    rows,
    columns,
    centered: true
  }

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;
    const angle = noise(yOff + time/5, xOff + time/2)*TAU;

    arrow({
      angle: angle,
      position: cellVector,
      borderColor: colors.rainbow({
        hueOffset: 0,
        hueIndex: map(center.dist(cellVector), 0, 500, -PI,  PI, true),
        opacityFactor: map(center.dist(cellVector), 0, 500, 1, 5, true)
      }),
      borderWidth: 2,
      size: 20
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

  iterators.vector(start, end, 1 / (128*6) , ( vector, lerpIndex, isFirst, isLast) => {
    const angle = noise(lerpIndex+time/4)*TAU;
    const colorFunction = isLast ? colors.purple : colors.rainbow;

    const coco = colorFunction({
      hueOffset: 0,
      hueIndex: mappers.fn(sin(angle), -1, 1, -PI, PI)*4,
      opacityFactor: mappers.fn(cos(angle), -1, 1, 2, 1, )
    })

    arrow({
      position: vector,
      sides: 1,
      borderColor: coco,
      borderWidth: 40,
      size: 150,
      angle: (
        angle +
        mappers.fn(lerpIndex, 0, 1, 0, PI*2) +
        mappers.fn(sin(angle), -1, 1, -PI, PI, )
      )
    })
  })
});
