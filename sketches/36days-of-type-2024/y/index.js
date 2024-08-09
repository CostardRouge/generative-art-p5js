import { sketch, animation, mappers, easing, events, string, cache, grid, options } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 50,
    defaultValue: 4,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'columns',
    min: 1,
    max: 50,
    defaultValue: 2,
    category: 'Grid'
  },
] );

sketch.setup( undefined, {
  // size: {
  //   width: 1080,
  //   height: 1080
  // },
  type: "webgl"
});

const images = [
    "yams.webp",
    "yarn.webp",
    // "yellow-squash.webp",
    "yerbal-mate.webp",
    "yogurt-1.webp",
    "yolk-1.webp",
    "yuzu-1.webp"
]

events.register("engine-window-preload", () => {
  cache.store("images", () => images.map( name => ({
    name,
    url: `./images/${name}.webp`,
    image: loadImage( `./images/${name}` )
  }) ) )
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
  background(0)
  // rotateX(PI/6)

  // const animationProgression = animation.ease({
  //   values: [0, 1],
  //   currentTime: time,
  //   // currentTime: 0,
  //   // currentTime: map(mouseX, 0, width, 0, 1),
  //   easingFn: easing.easeInOutSine
  // });

  const zoom = animation.ease({
    values: [-10, -10, -1000, -1000, -2000, -2000],
    // values: [-2000, -2000],
    // values: [-10],
    currentTime: (
      // + cellIndex/images.length
      // + imageIndex/images.length
      + time
    ),
    easingFn: easing.easeInOutQuart
  })

  translate(-width/2, -height/2, zoom)

  const foldingSpeed = 0//animationProgression
  const columns = 14//options.get("grid-columns")
  const rows = 1//options.get("grid-rows")

  const L = animation.ease({
    values: [0, width/2],
    currentTime: foldingSpeed,
    easingFn: easing.easeInOutExpo
  });
  const R = animation.ease({
    values: [width, width/2],
    currentTime: foldingSpeed,
    easingFn: easing.easeInOutExpo
  });

  const diamond = 0;

  const gridOptions = {
    rows,
    columns,
    diamond,
    centered: 0,
    topLeft: createVector( L, borderSize ),
    topRight: createVector( R, borderSize ),
    bottomLeft: createVector( L, height-borderSize ),
    bottomRight: createVector( R, height-borderSize )
  }

  const { cells, corners, cellWidth, cellHeight } = grid.create( gridOptions, false );

  const imageParts = cache.store(`image-parts-${columns}-${rows}`, () => (
    cache.get("images").map( ( { image, name } ) => (
      cells.reduce( ( imageCells, { x , y, height, width } ) => {
        const imagePart = getImagePart( image, x, y, width, height );

        imageCells.push( {
          name,
          imagePart,
          // dominantColor: getDominantColor( imagePart, 50 )
        } );

        return imageCells;
      }, [])
    ) )
  ) );

  const images = cache.get("images")

  const imageIndexes = images.map( (_, index) => [index]).flat(Infinity);

  cells.forEach( ({center, xIndex, yIndex, corners, absoluteCorners, width: cellWidth, height: cellHeight, row, column}, cellIndex ) => {

    // const circularX = mappers.circular(xIndex, 0, (columns-1), 0, 1,  easing.easeInOutExpo )
    // const circularY = mappers.circular(yIndex, 0, (rows-1), 0, 1,  easing.easeInOutQuint )

    push()
    translate(center.x, center.y)
    translate(0, cellHeight*(
      animation.ease({
        values: images.map((_, index) => [index * -1]).flat(Infinity),
        currentTime: (
          +column/columns
          // +row/rows
          // +circularX/columns
          + time
        ),
        easingFn: easing.easeInOutQuint
      })
    ))

    for (let imageIndex = 0; imageIndex < imageIndexes.length; imageIndex++) {
      const imageAtIndex = imageParts?.[~~imageIndex];
      const imagePart = imageAtIndex?.[~~cellIndex]?.imagePart;

      push()
      translate(0, cellHeight*imageIndex)

      noFill()
  
      texture(imagePart);
  
      stroke(favoriteColor);
      strokeWeight(2);
      rect(-cellWidth/2, -cellHeight/2, cellWidth, cellHeight);
  
      pop()
    }

    pop()
  })
  
  return orbitControl();
});
