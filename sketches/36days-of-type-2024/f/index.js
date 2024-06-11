import { sketch, animation, mappers, easing, events, string, cache, grid } from './utils/index.js';

sketch.setup( undefined, {
  // size: {
  //   width: 1080,
  //   height: 1080
  // },
  type: "webgl"
});

const imageURLs = Array.from({length: 20}).map( (_, index) => `./images/${index}.png`)

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
  translate(-width/2, -height/2, -10)

  let sizes = [2, 4]
  const columns = 6//mappers.circularIndex(time, sizes);
  const rows = 6//mappers.circularIndex(time/2, sizes);
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

  const { cells: gridCells } = grid.create( gridOptions );

  const imageParts = cache.store(`image-parts-${columns}-${rows}`, () => (
    cache.get("images").map( image => (
      gridCells.reduce( ( imageCells, { x , y } ) => {
        const imagePart = getImagePart( image, x, y, W, H );

        imageCells.push( {
          imagePart,
          // dominantColor: getDominantColor( imagePart, 50 )
        } );

        return imageCells;
      }, [])
    ) )
  ) );

  const imageIndexes = imageParts.map( (_, index) => [index, index]).flat(Infinity);

  gridCells.forEach( ({position, xIndex, yIndex}, cellIndex ) => {
    const { x, y } = position;
    const switchIndex = (
      // -cellIndex/(columns*rows)
      // +mappers.circularIndex(time, [-xIndex, xIndex])/columns
      // +mappers.circularIndex(time, [-yIndex, yIndex])/rows
      +xIndex/columns
      +yIndex/rows
      // +noise(xIndex/columns*4, yIndex*4)
      // +noise(cellIndex/(columns*rows))
    )
    const timeSpeed = 1.5;
    const switchImageSpeed = time*timeSpeed+0.5// * 1.75;
    const rotationSpeed = time*timeSpeed//+cellIndex/(columns*rows)
    const imageIndex = mappers.circularIndex(
      (
        0
        +switchImageSpeed
        +switchIndex
      ),
      imageIndexes
    )

    // fire, fusilli, flowers, feathers, french fries, fruits, focaccia, flan au caramel, frost ice, foam, flannel, fox, folded paper, folded fabric, fluorescent, fur, fluorite

    const currentImage = imageParts?.[~~imageIndex];
    // const nextImage = imageParts?.[ ( ~~imageIndex ) % imageParts.length ];

    const { imagePart: currentImagePart, dominantColor: currentDominantColor } = currentImage?.[~~cellIndex];
    // const { imagePart: nextImagePart, dominantColor: nextDominantColor } = nextImage?.[~~cellIndex];

    if (currentImagePart) {
        push()
        translate(x+W/2, y+H/2)

        const angle = animation.ease({
          values: [ -PI, -PI, 0, 0 ],
          currentTime: (
            0
            +rotationSpeed
            +switchIndex
          ),
          duration: 1,
          easingFn: easing.easeInOutBack
        })

        rotateY(angle);

        const img = currentImagePart//angle < -PI/2 ? currentImagePart : nextImagePart
        const w = map(angle, 0, -PI, 1, -1);

        texture(img)
        // quad(-W/2, -H/2, W/2, -H/2, W/2, H/2, -W/2, H/2)
        strokeWeight(1)
        stroke(favoriteColor)
        rect(-W/2*w, -H/2, W*w, H)
        pop()


           // if (currentDominantColor && veil) {
      //   const { levels: [ r, g, b ]} = currentDominantColor

      //   // strokeWeight(1)
      //   // fill(r, g, b, 128)
      //   // stroke(favoriteColor)
      //   //noStroke()

      //   // rect(x+W/2, y, 60, 60)
      //   // noFill()
      //   // strokeWeight(1)
      //   // stroke(dominantColor)
      //   // rect(x, y, W, H)

      //   // string.write(`E${round(imageIndex)}`, x+18, y+30, {
      //   //   size: 18,
      //   //   stroke: 0,
      //   //   strokeWeight: 2,
      //   //   fill: color(r, g, b, 255),
      //   //   font: string.fonts.openSans
      //   // })

      //   string.write(`F${round(cellIndex)}`, x+W/2, y+H/2, {
      //     center: true,
      //     size: W/2,
      //     stroke: 0,
      //     strokeWeight: 2,
      //     fill: color(r, g, b, 255),
      //     font: string.fonts.openSans
      //   })
      // }

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

  orbitControl()
});
