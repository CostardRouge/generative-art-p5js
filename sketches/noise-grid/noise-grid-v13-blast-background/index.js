import { events, sketch, converters, grid, animation, colors, midi, mappers, iterators, options, easing, cache } from './utils/index.js';

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
  this.line(0, y, width, y)
}

function vl(x) {
  this.line(x, 0, x, height)
}

function cross({ x, y }, size) {
  // line(x - size/2, y -size/2, x + size/2, y +size/2)
  // line(x + size/2, y -size/2, x - size/2, y +size/2)

  line(x, y - size/2, x, y + size/2)
  line(x - size/2, y, x + size/2, y)
}

const buffers = {};

function cachedGraphics(key, cacheKey, render, w = width, h = height) {
  const existingBuffer = buffers[key];

  if (!existingBuffer) {
    buffers[key] = {
      buffer: createGraphics(w, h)
    }
  }

  const { buffer } = buffers[key];

  if (buffer.cacheKey !== cacheKey ) {
    buffer.cacheKey = cacheKey;

    buffer.clear();
    buffer.resizeCanvas(w, h)
    
    render(buffer)
  }

  image(buffer, 0, 0)
}

let colorsSwitch = 1;

events.register("engine-canvas-mouse-pressed", () => colorsSwitch++ );

sketch.draw((time,center) => {
  const dark = [ 255, 0, 64]
  const light = [ 0, 255, 192]
  const [ primary, secondary, intermediary ] = mappers.circularIndex(colorsSwitch, [dark, light])

  background(secondary);

  const cols = options.get("grid-cols");
  const rows = cols*height/width;
  // const rows = options.get("grid-rows");
  // const cols = options.get("grid-cols");

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

  const commonCacheKey = `${cols}-${rows}-${intermediary}`;

  cachedGraphics(`vl`, commonCacheKey, buffer => {
    buffer.stroke(intermediary)
    buffer.strokeWeight(1)

    grid.draw({
      ...gridOptions,
      rows: 1,
    }, ({ x }, { x: xx }) => {
      if ( xx < 1 ) return;

      vl.call(buffer, x)
    })
  })

  cachedGraphics(`hl`, commonCacheKey, buffer => {
    buffer.stroke(intermediary)
    buffer.strokeWeight(1)

    console.log("dd");

    grid.draw({
      ...gridOptions,
      cols: 1,
    }, ({ y }, { y: yy }) => {
      if ( yy < 1 ) return;

      hl.call(buffer, y)
    })
  })

  stroke(primary)
  strokeWeight(2)
  grid.draw({
    ...gridOptions,
    centered: 0,
  }, (cellVector, { x, y}) => {
    if ( x < 1 || x > cols - 1 ) return;
    if ( y < 1 || y > rows - 1 ) return;
    if ( noise(cellVector.x+cos(time/20), cellVector.y+sin(time/20), time/20) > 0.5 ) return;

    cross(cellVector, scale /2)
  })
});