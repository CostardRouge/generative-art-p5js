import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing, cache } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 75,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: false,
    category: 'Grid'
  },
  {
    id: "noise-detail-lod",
    type: 'number',
    label: 'Noise detail lod',
    min: 0,
    max: 32,
    defaultValue: 6,
    category: 'Noise'
  },
  {
    id: "noise-detail-falloff",
    type: 'slider',
    label: 'Noise detail falloff',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.6,
    category: 'Noise'
  },
] );

sketch.setup();

function hl(y) {
  line(0, y, width, y)
}

function vl(x) {
  line(x, 0, x, height)
}

function cross({ x, y }, size) {
  // line(x - size/2, y -size/2, x + size/2, y +size/2)
  // line(x + size/2, y -size/2, x - size/2, y +size/2)

  line(x, y - size/2, x, y + size/2)
  line(x - size/2, y, x + size/2, y)
}

function cacheGraphics(key, render, w = width, h = height) {
  return cache.store(key, () => {
    const newGraphicsBuffer = createGraphics(w, h);

    render.bind(newGraphicsBuffer)

    render(newGraphicsBuffer);

    return newGraphicsBuffer;
  })
}

sketch.draw((time,center) => {
  background(255);

  const rows = options.get("grid-rows");
  const cols = options.get("grid-cols");

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }
  const scale = (width / cols)

  noiseDetail(
    options.get("noise-detail-lod"),
    options.get("noise-detail-falloff"),
  );

  stroke(192)
  strokeWeight(1)
  grid.draw({
    ...gridOptions,
    rows: 1,
  }, (cellVector, { x, y}) => {
    vl(cellVector.x)
  })

  

  image(cacheGraphics("hl", (buffer) => {
    grid.draw({
      ...gridOptions,
      cols: 1,
    }, (cellVector, { x, y}) => {
      hl(cellVector.y)
    })
  }))

  stroke(0)
  strokeWeight(2)
  grid.draw({
    ...gridOptions,
    centered: 0,
  }, (cellVector, { x, y}) => {
    if ( x < 1 || x > cols - 1 ) return;
    if ( y < 1 || y > rows - 1 ) return;
    if ( noise(cellVector.x+cos(time), cellVector.y+sin(time), time/20) > 0.5 ) return;

    cross(cellVector, scale /3)
  })
});
