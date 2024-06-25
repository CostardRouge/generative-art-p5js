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
  size: {
    width: 1080,
    height: 1080
  },
  type: "webgl"
});

const images = [
  "style-a.webp",
  "x-ray.webp",
  "xenoliths.webp",
  "xenon.webp",
  "xylophone.webp"
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

let _imageIndexes = {

};

const cursor = {
  current: 0,
  speed: 1/100,
  direction: 1
}

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

  const animationProgression = animation.ease({
    values: [0, 1],
    currentTime: time,
    currentTime: 0,
    // currentTime: map(mouseX, 0, width, 0, 1),
    easingFn: easing.easeInOutSine
  });

  if ( animationProgression === 1) {
    _imageIndex++
  }

  const zoom = animation.ease({
    values: [-10, -500],
    currentTime: animationProgression,
    easingFn: easing.easeInOutSine
  })

  translate(-width/2, -height/2, zoom)

  const foldingSpeed = animationProgression
  const columns = 6//options.get("grid-columns")
  const rows = 6//options.get("grid-rows")

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

  const diamond = 1;

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

  // console.log(cells.length);

  // console.log(cells);
  // grid.debug( gridOptions, cells, corners )

  // const imageParts = cache.store(`image-parts-${columns}-${rows}`, () => (
  //   cache.get("images").map( ( { image, name } ) => (
  //     cells.reduce( ( imageCells, { x , y, height, width } ) => {
  //       const imagePart = getImagePart( image, x, y, width, height );

  //       imageCells.push( {
  //         name,
  //         imagePart,
  //         //dominantColor: getDominantColor( imagePart, 50 )
  //       } );

  //       return imageCells;
  //     }, [])
  //   ) )
  // ) );
  const images = cache.get("images")

  const imageIndexes = images.map( (_, index) => [index]).flat(Infinity);

  cells.forEach( ({center, corners, absoluteCorners, width: cellWidth, height: cellHeight, row, column}, cellIndex ) => {
    const circularX = mappers.circular(row, 0, (columns-1), 0, 1, easing.easeInOutExpo )
    const circularY = mappers.circular(column, 0, (rows-1), 0, 1, easing.easeInOutExpo )

    const switchImageSpeed = time//*1.5;
    const rotationSpeed = switchImageSpeed;
    const switchIndex = (
      // +column/columns
      // +row/rows
      +circularX/columns*2
      +circularY/rows*2
    )
    const imageIndex = mappers.circularIndex(
      (
        0
        +switchImageSpeed+0.5
        +switchIndex
      ),
      imageIndexes
    )

    const imageAtIndex = images?.[~~imageIndex]?.image;
    // const { imagePart, dominantColor, name } = imageAtIndex?.[~~cellIndex];

    // const cellCacheKey = `cell-${row}-${column}`;
    // const imageIndex = _imageIndexes[cellCacheKey] || (_imageIndexes[cellCacheKey] = 0 );
    // const imageAtIndex = images?.[imageIndex]?.image;

    // if (cursor.current === 1 && cursor.direction === 1) {
    //   _imageIndexes[cellCacheKey] = (imageIndex + 1) % images.length
      
    // }
  
    if (imageAtIndex) {
      push()

      const angle = animation.ease({
        values: [0, PI ],
        currentTime: switchIndex,
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        easingFn: easing.easeInOutCubic
      });

      
      beginClip();
      translate(center.x, center.y)
      rotateY(angle)

      // stroke(favoriteColor);
      // strokeWeight(1);
      // noFill()
      // circle(0, 0, cellWidth)
      
      // stroke("red");
      // strokeWeight(15);
      // point(0, 0)

      // strokeWeight(10);
      // for (const corner of corners) {
      //   point(corner.x, corner.y);
      // }

      beginShape();
      // translate(center.x, center.y)

      // stroke("green");
      // strokeWeight(5);
      for (const corner of corners) {
        vertex(corner.x, corner.y);
      }
      endShape(CLOSE);

      endClip();

      stroke(favoriteColor);
      strokeWeight(2);
      image(imageAtIndex, 0, 0, width, height);

      pop()

      push()
      translate(center.x, center.y)
      rotateY(angle)
      stroke(favoriteColor);
      strokeWeight(2);
      for (let i = 0; i < corners.length; i++) {
        const nextIndex = (i + 1) % corners.length;
        line(corners[i].x, corners[i].y, corners[nextIndex].x, corners[nextIndex].y);
      }
      pop()
    }
  })
  orbitControl()
});
