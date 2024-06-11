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
  "waffle.webp",
  "watches.webp",
  "wave.webp",
  "whale.webp",
  "wildflowers.webp",
  "wolf.webp",
  "walnut.webp",
  "waterfall.webp",
  "wax.webp",
  "wheat.webp",
  "wing.webp",
  "wool.webp"
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

let _imageIndex = 0;

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

function drawCell(x, y, cellWidth, cellHeight, losange) {
  if (losange) {
    // Calculate the half diagonal for the diamond-shaped cell
    const halfDiagonal = cellWidth / sqrt(2);

    // Calculate the vertices for the diamond shape
    let v1 = createVector(x, y - halfDiagonal);
    let v2 = createVector(x + halfDiagonal, y);
    let v3 = createVector(x, y + halfDiagonal);
    let v4 = createVector(x - halfDiagonal, y);

    // Draw the filled shape
    beginShape();
    vertex(v1.x, v1.y);
    vertex(v2.x, v2.y);
    vertex(v3.x, v3.y);
    vertex(v4.x, v4.y);
    endShape(CLOSE);

    // Draw the border
    stroke(0); // Set stroke color for the border
    strokeWeight(1); // Set stroke weight for the border
    line(v1.x, v1.y, v2.x, v2.y);
    line(v2.x, v2.y, v3.x, v3.y);
    line(v3.x, v3.y, v4.x, v4.y);
    line(v4.x, v4.y, v1.x, v1.y);
  } else {
    // Draw a regular square cell
    rect(x, y, cellWidth, cellHeight);
  }
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
  const columns = 3//options.get("grid-columns")
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

  const gridOptions = {
    rows,
    columns,
    losange: true,
    centered: 0,
    topLeft: createVector( L, borderSize ),
    topRight: createVector( R, borderSize ),
    bottomLeft: createVector( L, height-borderSize ),
    bottomRight: createVector( R, height-borderSize )
  }

  const { cells, corners, cellWidth, cellHeight } = grid.create( gridOptions, false );
  // grid.debug( gridOptions, cells, corners )

  const imageParts = cache.store(`image-parts-${columns}-${rows}`, () => (
    cache.get("images").map( ( { image, name } ) => (
      cells.reduce( ( imageCells, { x , y, height, width }  ) => {
        const imagePart = getImagePart( image, x, y, width, height );

        imageCells.push( {
          name,
          imagePart,
          //dominantColor: getDominantColor( imagePart, 50 )
        } );

        return imageCells;
      }, [])
    ) )
  ) );

  const imageIndexes = imageParts.map( (_, index) => [index, index, index]).flat(Infinity);

  cells.forEach( ({position, xIndex, yIndex, x, y, width: cellWidth, height: cellHeight}, cellIndex ) => {
    // const circularX = mappers.circular(xIndex, 0, (columns-1), 0, 1, easingFunction )
    // const circularY = mappers.circular(yIndex, 0, (rows-1), 0, 1, easingFunction )

    // const { x, y } = position;
    const imageIndex = _imageIndex % images.length;
    const imageAtIndex = imageParts?.[imageIndex];
    const { imagePart, dominantColor, name } = imageAtIndex?.[~~cellIndex];

    if (imagePart) {

      // return drawCell(x, y, cellWidth, cellHeight, true)

      push()

      translate(
        x+cellWidth/2,
        y
      )
      rotateZ(PI/4)
      
      push()
      textureMode(NORMAL);
      texture(imagePart)

      const zMax = animation.ease({
        values: [0, 500],
        currentTime: animationProgression,
        easingFn: easing.easeInOutCubic
      })
      const z1 = !(xIndex % 2 === 0) ? zMax : 0;
      const z2 = (xIndex % 2 === 0) ? zMax : 0;

      beginShape();
      vertex(0, 0, z1, 0, 0);
      vertex(0+cellWidth, 0, z2, 1, 0);
      vertex(0+cellWidth, 0+cellHeight, z2, 1, 1);
      vertex(0, 0+cellHeight, z1, 0, 1);
      endShape(CLOSE)
      pop()

      // Draw border
      stroke(favoriteColor);
      strokeWeight(1);
      line(0, 0, z1, 0+cellWidth, 0, z2);
      line(0+cellWidth, 0, z2, 0+cellWidth, 0+cellHeight, z2); 
      line(0+cellWidth, 0+cellHeight, z2, 0, 0+cellHeight, z1);
      line(0, 0+cellHeight, z1, 0, 0, z1);

      pop()
    }
  })
  orbitControl()
});
