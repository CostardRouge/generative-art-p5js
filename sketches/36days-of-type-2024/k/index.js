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

let images = [
  "koi-fish.webp",
  "knit-wool.webp",
  "kiwi.webp",
  "kinitic.webp",
  "kimchi.webp",
  "key-lime-pie.webp",
  "kevlar.webp",
  "kerosene.webp",
  "kebab-wrap.webp",
  "katsudon.webp",
  "katana.webp"
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
  background(0);
  translate(-width/2, -height/2, -10)

  const columns = 30//options.get("grid-columns")
  // const columns10 mappers.circularIndex(time+0.625, [2, 10]);
  const rows = 30 //options.get("grid-rows")//mappers.circularIndex(time/2, []);
  // const rows = mappers.circularIndex(time/4, [2, 10, 30, 50]);
  //
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
    cache.get("images").map( ( { image, name } ) => (
      gridCells.reduce( ( imageCells, [ { x , y } ] ) => {
        const imagePart = getImagePart( image, x, y, W, H );

        imageCells.push( {
          name,
          imagePart,
          //dominantColor: getDominantColor( imagePart, 50 )
        } );

        return imageCells;
      }, [])
    ) )
  ) );

  const imageIndexes = imageParts.map( (_, index) => [index, index]).flat(Infinity);

  gridCells.forEach( ([position, xIndex, yIndex], cellIndex ) => {
    const { x, y } = position;
    const switchImageSpeed = time//*1.5;
    const rotationSpeed = switchImageSpeed;
    const switchIndex = -(
      // -cellIndex/(columns*rows)
      // +mappers.circularIndex(time, [-xIndex, xIndex])/columns
      // +mappers.circularIndex(time, [-yIndex, yIndex])/rows
      +xIndex/columns
      +yIndex/rows
      //+[ 5, 4, 2, 0, 1, 3 ][cellIndex]/(columns*rows)
      +noise(xIndex/columns, yIndex/rows)
      //+noise(xIndex, yIndex)
      // +noise(cellIndex/(columns*rows))
    )
    const imageIndex = mappers.circularIndex(
      (
        0
        +switchImageSpeed//+0.5
        +switchIndex
      ),
      imageIndexes
    )

    const imageAtIndex = imageParts?.[~~imageIndex];
    const { imagePart, dominantColor, name } = imageAtIndex?.[~~cellIndex];

    if (imagePart) {
      const rotationRange = [0, PI];
      const xRotationRange = yIndex % 2 === 0 ? rotationRange : rotationRange.toReversed();
      const yRotationRange = xIndex ? rotationRange : rotationRange.toReversed();
      
      const [xRotationStart, xRotationEnd] = xRotationRange;
      const xRotationMin = Math.min(...xRotationRange);
      const xRotationMax = Math.max(...xRotationRange);

      const [yRotationStart, yRotationEnd] = yRotationRange;
      const yRotationMin = Math.min(...yRotationRange);
      const yRotationMax = Math.max(...yRotationRange);

      const xAngle = animation.ease({
        values: [  xRotationEnd, xRotationEnd, xRotationStart, xRotationStart, ],
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo
      })
      const yAngle = animation.ease({
        values: [ yRotationEnd, yRotationEnd, yRotationStart, yRotationStart, ],
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo
      })
      
      const direction = [ 1, 1 ]
      
      push()
      translate(x+W/2, y+H/2, animation.ease({
        values: [ 1000, 0 ],
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        duration: 1,
        easingFn: easing.easeInOutExpo
      }))

      //rotateX(xAngle) && (direction[0] = map(xAngle, xRotationMin, xRotationMax, 1, -1))
      //rotateY(yAngle) && (direction[1] = map(yAngle, yRotationMin, yRotationMax, 1, -1))

      const weight = (
        0
        +mappers.circularPolar(direction[0], 1, -1, 0, 4)
        +mappers.circularPolar(direction[1], 1, -1, 0, 4)
      )

      const [ yDirection, xDirection ] = direction

      noFill()
      
      stroke(favoriteColor)
      //stroke(lerpColor(favoriteColor, dominantColor ?? favoriteColor, weight)) && strokeWeight(weight)

      texture(imagePart)
      rect(
        -W/2*xDirection,
        -H/2*yDirection,
        W*xDirection,
        H*yDirection
      )

      pop()

      push()
      translate(0, 0, 10)
      // string.write(`${name}`, x+18, y+30, {
      //   // center: true,
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })

      // string.write(`${name}`, x+W/2, y+H/2, {
      //   center: true,
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })
      pop()
    }
  })
  orbitControl()
});
