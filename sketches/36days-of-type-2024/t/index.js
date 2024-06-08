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

let images = [
  "tagliatelle.webp",
  "tangerine.webp",
  "tomato.webp",
  "tiramisu.webp",
  "tortilla.webp",
  "tofu-2.webp",
  "turnip.webp",
  "tamarin.webp",
  // "terracotta.webp",
  // "topaz-1.webp",

  // "topaz-2.webp",
  // "tungsten.webp",
  // "talc.webp",
  // "tempura.webp",
  // "titanium.webp",

  // "tofu-1.webp",
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
  translate(-width/2, -height/2, -10)

  const columns = 8//options.get("grid-columns")
  const rows = 8//options.get("grid-rows")

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

  const easingFunction = easing.easeInOutSine;

  const anchorData = {
    x: {
      left: [ 0, 0 ],
      middle: [ W/2, -W/2 ],
      right: [ W, -W ]
    },
    y: {
      top: [ 0, 0 ],
      middle: [ H/2, -H/2 ],
      bottom: [ H, -H ]
    }
  }

  gridCells.forEach( ([position, xIndex, yIndex], cellIndex ) => {
    const circularX = mappers.circular(xIndex, 0, (columns-1), 0, 1, easingFunction )
    const circularY = mappers.circular(yIndex, 0, (rows-1), 0, 1, easingFunction )

    const { x, y } = position;
    const switchImageSpeed = time//*1.5;
    const rotationSpeed = switchImageSpeed;
    const switchIndex = +(
      0
      //+yIndex/rows
      //+noise(circularX, circularY)
      //+noise(xIndex/rows, yIndex/columns)
      +circularX
      +circularY
      //+cellIndex/(columns+rows)
    )
    const imageIndex = mappers.circularIndex(
      (
        0
        +switchImageSpeed+0.5
        +switchIndex
      ),
      imageIndexes
    )

    const imageAtIndex = imageParts?.[~~imageIndex];
    const { imagePart, dominantColor, name } = imageAtIndex?.[~~cellIndex];

    if (imagePart) {
      const rotationMin = 0;
      const rotationMax = PI;
      const rotationRange = [rotationMin, rotationMax];
      const [xRotationStart, xRotationEnd] = yIndex % 2 === 0 ? rotationRange : rotationRange.toReversed();
      const [yRotationStart, yRotationEnd] = xIndex % 2 === 0 ? rotationRange : rotationRange.toReversed();
      
      const xAngle = animation.ease({
        values: [  xRotationEnd, xRotationEnd, xRotationStart, xRotationStart ],
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        duration: 1,
        easingFn: easing.easeInOutCubic
      })
      const yAngle = animation.ease({
        values: [ yRotationEnd, yRotationEnd, yRotationStart, yRotationStart ],
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        duration: 1,
        easingFn: easing.easeInOutCubic
      })
      
      const direction = [ 1, 1 ]
      
      push()
      const z = 0
      animation.ease({
        values: [ -300, 0 ],
        currentTime: (
          0
          +rotationSpeed
          +switchIndex
        ),
        duration: 1,
        easingFn: easingFunction
      })

      const anchor = position.copy()

      const anchorXType = !(xIndex % 2 === 0) ? "right" : "left"
      const anchorYType = !(yIndex % 2 === 0) ? "bottom" : "top"

      const [ anchorX, rectX ] = anchorData.x?.[anchorXType];
      const [ anchorY, rectY ] = anchorData.y?.[anchorYType];

      anchor.add(anchorX, anchorY)

      translate(anchor.x, anchor.y, anchor.z)

      rotateX(xAngle) && (direction[0] = map(xAngle, rotationMin, rotationMax, 1, -1))
      rotateY(yAngle) && (direction[1] = map(yAngle, rotationMin, rotationMax, 1, -1))
      //rotateZ(yAngle)// && (direction[1] = map(yAngle, rotationMin, rotationMax, 1, -1))

      const weight = (
        0
        +mappers.circularPolar(direction[0], 1, -1, 0, 4)
        +mappers.circularPolar(direction[1], 1, -1, 0.25, 4)
        +mappers.circularPolar(z, 0, 1000, 0, 4)
      )

      const [ yDirection, xDirection ] = direction

      noFill()
      
      stroke(favoriteColor)
      //stroke(lerpColor(favoriteColor, dominantColor ?? favoriteColor, weight)) && 
      strokeWeight(weight)

      texture(imagePart)
      rect(
        rectX*xDirection,
        rectY*yDirection,
        W*xDirection,
        H*yDirection
      )

      pop()

      // push()
      // translate(0, 0, 10)
      // const letter = name[ cellIndex % name.length]

      // string.write(`${letter}`, x+18, y+30, {
      //   // center: true,
      //   size: 18,
      //   stroke: 0,
      //   strokeWeight: 2,
      //   fill: favoriteColor,
      //   font: string.fonts.openSans
      // })
      // pop()
    }
  })
  orbitControl()
});
