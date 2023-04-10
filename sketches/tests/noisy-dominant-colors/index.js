import { sketch, string, mappers, easing, events, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined);
// sketch.setup( undefined, { type: 'webgl'});

events.register("engine-window-preload", () => {
  // cache.store("image", () => loadImage( "img.png" ))
  cache.store("image", () => loadImage( "img.jpeg" ))
});

function hl(y, w = width) {
  line(0, y, w, y)
}

function vl(x, h = height) {
  line(x, 0, x, h)
}

function chunk(array, chunkSize) {
  const chunkedArray = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }

  return chunkedArray;
}

const getDominantColorFromPixels = ( pixels, precision = 100 ) => {
  const chunkedPixels = chunk( pixels, 4 );

  const filteredPixels = chunkedPixels.filter( ( _, index ) => (
      index % precision === 0
  ) );

  return filteredPixels.reduce( ( accumulator, [ r, g, b, a ] ) => {
    const pixelColor = color(  r, g, b, a );

    if ( null === accumulator ) {
      return pixelColor;
    }

    return lerpColor( accumulator, pixelColor, 0.5 )
  }, null );
};

function getColor( img, x, y, w, h = w ) {
  const cacheKey = cache.key("dominant-color", ...arguments)

  return cache.store(cacheKey, () => {
    const { width: imageWidth, height: imageHeight } = img;
    const subImage = img.get( 
      constrain(x/width * imageWidth, 0, imageWidth),
      constrain(y/height * imageHeight, 0, imageHeight),
      constrain(w/width * imageWidth, 0, imageWidth),
      constrain(h/width * imageWidth, 0, imageWidth),
    );

    subImage.loadPixels()

    return getDominantColorFromPixels( subImage.pixels );
  });
}

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

function debugImage(img) {
  const { width: imageWidth, height: imageHeight } = img;

  image(img, 0, 0)

  noFill()
  stroke("red")
  rect(0, 0, imageWidth, imageHeight )

  const pos = createVector( mouseX, mouseY )
  const testSize = 100;

  const x = constrain(pos.x/width * imageWidth, 0, imageWidth);
  const y = constrain(pos.y/height * imageHeight, 0, imageHeight);
  const w = constrain(testSize/width * imageWidth, 0, imageWidth);
  const h = constrain(testSize/width * imageWidth, 0, imageWidth);

  fill( getColor( img, pos.x, pos.y, testSize ))
  rect( x, y, w, h)

  stroke("blue")
  rect(pos.x, pos.y, testSize, testSize )
}

const borderSize = 2;

sketch.draw( (time, center) => {
  background(0);

  const cols =10;
  //const rows = 10;
  const rows = cols*height/width;

  const gridOptions = {
    startLeft: createVector( borderSize, borderSize ),
    startRight: createVector( width-borderSize, borderSize ),
    endLeft: createVector( borderSize, height-borderSize ),
    endRight: createVector( width-borderSize, height-borderSize ),
    rows,
    cols,
    centered: true
  }

  const W = width / cols;
  const H = height / rows;

  noStroke()
  strokeWeight(borderSize)

  const img = cache.get("image");

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    let n = noise(x/cols, y/rows + time)*4;
    n = ~~map(
      cellVector.dist(center),
      0,
      map(sin(time*2), -1, 1, 0, width),
      8,
      1
    );

    // n = ~~map(
    //   cellVector.dist(center),
    //   0,
    //   4*frameCount%width,
    //   4,
    //   1
    // );

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {
        const dominantColor = getColor( img, x, y, w, h );

        const { levels: [r, g, b, a ] } = dominantColor

        // stroke(dominantColor)
        fill(r, g, b, 230)
        rect(x, y, w, h )

        // stroke(255)
        // line(x, y, x+w, y)
        // line(x, y+h, x+w, y+h)
        // line(x, y, x, y+h)
        // line(x+w, y, x+w, y+h)
        // vl(x, height)
      }
    )
  })

  //debugImage(img)
});
