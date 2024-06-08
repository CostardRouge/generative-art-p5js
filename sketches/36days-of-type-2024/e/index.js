import { sketch, animation, mappers, easing, events, string, cache, grid } from './utils/index.js';

sketch.setup( undefined, {
  size: {
    width: 1080,
    height: 1080
  }
});

const imageURLs = Array.from({length: 21}).map( (_, index) => `./images/${index}.png`)

events.register("engine-window-preload", () => {
  cache.store("images", () => imageURLs.map( url => loadImage( url ) ) )
});

function chunk(array, chunkSize) {
  const chunkedArray = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }

  return chunkedArray;
}

const getDominantColorFromPixels = ( pixels, precision = 100 ) => {
  const chunkedPixels = chunk( pixels, 4 );

  const filteredPixels = chunkedPixels
    .filter( ( [ r, g, b ], index ) => (
      index % precision === 0 && [ r, g, b ].every( channel => channel > 10 )
    ) )

  return filteredPixels.reduce( ( accumulator, [ r, g, b, a ] ) => {
    const pixelColor = color( r, g, b, a );

    if ( null === accumulator ) {
      return pixelColor;
    }

    return lerpColor( accumulator, pixelColor, 0.5 )
  }, null );
};

function getDominantColor( img, precision ) {
  img.loadPixels()

  return getDominantColorFromPixels( img.pixels, precision );
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

  let sizes = [12]
  // sizes = [8, 2, 3, 2, 6, 2]
  // sizes = [8, 1, 2, 1, 3, 1];
  sizes = [6]
  const columns = mappers.circularIndex(time/2, sizes);
  const rows = mappers.circularIndex(time/2, sizes.reverse());
  // const rows = columns*height/width;

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

  const gridCells = grid.create( gridOptions );

  const imageParts = cache.store(`image-parts-${columns}-${rows}`, () => (
    cache.get("images").map( image => (
      gridCells.reduce( ( imageCells, [ { x , y } ] ) => {
        const imagePart = getImagePart( image, x, y, W, H );

        imageCells.push( {
          imagePart,
          dominantColor: getDominantColor( imagePart, 50 )
        } );

        return imageCells;
      }, [])
    ) )
  ) );

  const imageIndexes = imageParts.map( (_, index) => [index, index]).flat(Infinity);

  gridCells.forEach( ([position, xIndex, yIndex], cellIndex ) => {
    const { x, y } = position;
    const switchIndex = (
      // -cellIndex/(columns*rows)
      // +mappers.circularIndex(time, [-xIndex, xIndex])/columns
      // +mappers.circularIndex(time, [-yIndex, yIndex])/rows
      // +xIndex/columns
      // +yIndex/rows
      +noise(xIndex/columns*4, yIndex*4)
      // +noise(cellIndex/(columns*rows))
    )
    const switchTime = time * 1.75;
    const imageIndex = mappers.circularIndex(
      (
        0
        +switchTime
        +switchIndex
      ),
      imageIndexes
    )


    const imageAtIndex = imageParts?.[~~imageIndex];
    const { imagePart, dominantColor } = imageAtIndex?.[~~cellIndex];

    if (imagePart) {

      const veil = mappers.circularIndex(switchTime+switchIndex, [1, 0])

      if (dominantColor && veil) {
        const { levels: [ r, g, b ]} = dominantColor

        // strokeWeight(1)
        // fill(r, g, b, 128)
        // stroke(favoriteColor)
        //noStroke()

        // rect(x+W/2, y, 60, 60)
        // noFill()
        // strokeWeight(1)
        // stroke(dominantColor)
        // rect(x, y, W, H)

        // string.write(`E${round(imageIndex)}`, x+18, y+30, {
        //   size: 18,
        //   stroke: 0,
        //   strokeWeight: 2,
        //   fill: color(r, g, b, 255),
        //   font: string.fonts.openSans
        // })

        string.write(`E${round(imageIndex)}`, x+W/2, y+H/2, {
          center: true,
          size: W/2,
          stroke: 0,
          strokeWeight: 2,
          fill: color(r, g, b, 255),
          font: string.fonts.openSans
        })
      }
      else {
        image(imagePart, x, y, W, H)

        noFill()
        strokeWeight(1)
        stroke(favoriteColor)
        rect(x, y, W, H)
      }

      // strokeWeight(1)
      // cross(x + W - 30, y + H - 30, 20)


      

      // string.write(`${xIndex}`, x+W-30, y+30, {
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })

      // string.write(`${cellIndex}`, x+W-30, y+H-20, {
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })
    }
  })
});
