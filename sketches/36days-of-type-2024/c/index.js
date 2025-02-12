import { sketch, animation, mappers, easing, events, string, cache, grid } from './utils/index.js';

sketch.setup( undefined, {
  size: {
    width: 1080,
    height: 1080
  }
});

const imageURLs = Array.from({length: 16}).map( (_, index) => `./images/${index+1}.png`)

events.register("engine-window-preload", () => {
  // cache.store("image", () => loadImage( "img.png" ))
  cache.store("images", () => imageURLs.map( url => loadImage( url) ))
});

function ikks( x, y , size) {
  line(x - size/2, y -size/2, x + size/2, y +size/2)
  line(x + size/2, y -size/2, x - size/2, y +size/2)
}

function cross( x, y , size) {
  line(x, y -size/2, x, y +size/2)
  line(x + size/2, y, x - size/2, y)
}

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

function getColor( img, x, y, w, h = w, key ) {
  const cacheKey = cache.key("dominant-color", ...arguments, key)

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

function drawGridCell(_x, _y, w, h, columns, rows, drawer) {
  const xSize = w / columns;
  const ySize = h / rows;

  for (let x = 0; x <= columns; x++) {
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

const borderSize = 0;

function getImagePart(img, x, y, w, h) {
  // return img.get( x, y, w, h)
  
  return (
    img
      .get(
        x/width*img.width,
        y/height*img.height,
        img.width/(width/w),
        img.height/(height/h),
      )
  )
}
sketch.draw( ( time, center, favoriteColor ) => {
  background(0);

  const columns = 2//mappers.circularIndex(time, [2, 3, 4, 5, 6, 7]);
  // const rows = mappers.circularIndex(time, [2, 3, 4, 5, 6, 7, 8, 9, 10].reverse())//columns*height/width;
  const rows = columns*height/width;

  const gridOptions = {
    topLeft: createVector( borderSize, borderSize ),
    topRight: createVector( width-borderSize, borderSize ),
    bottomLeft: createVector( borderSize, height-borderSize ),
    bottomRight: createVector( width-borderSize, height-borderSize ),
    rows,
    columns,
    centered: false
  }

  const W = width / columns;
  const H = height / rows;

  const { cells: gridCells } = grid.create( gridOptions );

  const imageParts = cache.store(`image-parts-${columns}-${rows}`, () => (
    cache.get("images").map( image => (
      gridCells.reduce( ( imageCells, { x , y } ) => {
        imageCells.push( getImagePart( image, x, y, W, H ) );
        return imageCells;
      }, [])
    ) )
  ) );

  const imageIndexes = imageParts.map( (_, index) => [index, index]).flat(Infinity);

  gridCells.forEach( ({position, xIndex, yIndex}, cellIndex ) => {
    const { x, y } = position;
    // const imageIndex = (noise(xIndex+time/5, yIndex+time/5)*imageURLs.length)%imageURLs.length;
    // const imageIndex = (noise(cellIndex/(columns*rows)+time/10)*imageURLs.length)%imageURLs.length;

    // cellIndex = [
    //   1, 0, 2, 3
    // ][cellIndex]

    const imageIndex = mappers.circularIndex(
      (
        0
        +time*2
        //+mappers.circularIndex(time, [ 1, 0, 2, 3 ])
        +[ 1, 0, 2, 3 ][cellIndex]/(columns*rows)
        // +mappers.circularIndex(time/2, [-xIndex, +xIndex])/14
        // +mappers.circularIndex(1+time/2, [-yIndex, +yIndex])/14
        // +xIndex/15
        // -yIndex/15
        //+noise(xIndex+time, yIndex+time)*imageURLs.length
        // +xIndex*mappers.fn(sin(time/2), -1, 1, -3, 3, easing.easeInExpo)
        // +yIndex*mappers.fn(cos(time/2), -1, 1, -3, 3, easing.easeOutExpo)
        //+yIndex/10
      ),
      imageIndexes
    )

    const imageAtIndex = imageParts?.[~~imageIndex];
    const imagePart = imageAtIndex?.[~~cellIndex];

    if (imagePart) {
      image(imagePart, x, y, W, H)

      //const { levels: [ r, g, b ]} = getColor(imagePart, x, y, W, H, `${columns}-${round(imageIndex)}`)

      noFill()
      //fill(r, g, b, 170)
      strokeWeight(1)
      stroke(favoriteColor)
      rect(x, y, W, H)

      // strokeWeight(1)
      // cross(x + W - 30, y + H - 30, 20)

      const II = round(imageIndex);

      string.write(`C${II}`, x+18, y+30, {
        size: 18,
        stroke: 0,
        strokeWeight: 2,
        fill: favoriteColor,
        font: string.fonts.openSans
      })

      // string.write(`${xIndex}`, x+W-30, y+30, {
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })

      // string.write(`${xIndex}`, x+W-30, y+H-20, {
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })
    }

    
    // const cellImage = imageAtIndex[10]

    // const cellImage = getImagePart(img, x, y, W, H);

    // image(getImagePart(cache.get("images")[~~imageIndex], x, y, W, H), x, y, W, H)

    // let n = noise(x/columns, y/rows + time)*8;
    //  n = map(
    //   position.dist(center),
    //   0,
    //   width,//map(sin(time*2), -1, 1, 0, width),
    //   4,
    //   1
    // );

    // n = ~~map(
    //   position.dist(center),
    //   0,
    //   4*frameCount%width,
    //   4,
    //   1
    // );

    // drawGridCell(
    //   position.x-W/2,
    //   position.y-H/2,
    //   W,
    //   H,
    //   ~~n,
    //   ~~n,
    //   ( x, y, w, h ) => {
    //     //const dominantColor = getColor( img, x, y, w, h );

    //     //const { levels: [r, g, b, a ] } = dominantColor

    //     // stroke(dominantColor)
    //     // fill(r, g, b, 230)
    //     // rect(x, y, w, h )

    //     image(cellImage, x, y, w, h)

    //     // stroke(255)
    //     // line(x, y, x+w, y)
    //     // line(x, y+h, x+w, y+h)
    //     // line(x, y, x, y+h)
    //     // line(x+w, y, x+w, y+h)
    //     // vl(x, height)
    //   }
    // )
  })

  //debugImage(img)
});
