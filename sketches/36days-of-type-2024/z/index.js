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
  "zucchini.webp",
  // "zombies.webp",
  "zip.webp",
  "zigzag.webp",
  "zenith.webp",
  "zen.webp",
  "zebra.webp",
  "zap.webp",
  "zabaglione.webp"
]

events.register("engine-window-preload", () => {
  cache.store("images", () => images.map( name => ({
    name,
    url: `./images/${name}.webp`,
    image: loadImage( `./images/${name}` )
  }) ) )
});

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
    values: [-2000, -3000, -3000, -2500],
    currentTime: (
      + time/2
    ),
    easingFn: easing.easeInOutQuart
  })

  translate(0, 0, zoom)

  rotateX(animation.ease({
    values: [0, PI/6, -PI/6, PI/2],
    // values: [0, PI/6, -PI/6],
    currentTime: (
      +time/2
    ),
    easingFn: easing.easeInOutExpo
  }))

  // rotateZ(animation.ease({
  //   values: [0, PI/2],
  //   currentTime: (
  //     +time
  //   ),
  //   easingFn: easing.easeInOutExpo
  // }))

  translate(-width/2, -height/2)

  

  const foldingSpeed = 0//animationProgression
  const columns = 1//options.get("grid-columns")
  const rows = 5//options.get("grid-rows")

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
          imagePart
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

    const circonference = cellWidth*images.length;

    push()
    translate(center.x, center.y)

    // translate(cellWidth*(
    //   animation.ease({
    //     values: images.map((_, index) => [index * -1]).flat(Infinity),
    //     currentTime: (
    //       +column/columns
    //       +row/rows
    //       // +circularX/columns
    //       + time
    //     ),
    //     easingFn: easing.easeInOutQuint
    //   })
    // ), 0)

    for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
      const imageAtIndex = imageParts?.[~~imageIndex];
      const imagePart = imageAtIndex?.[~~cellIndex]?.imagePart;

      const angle = map(imageIndex, 0, images.length, 0, TAU)

      push()
      rotateY(angle+time/3)

      rotateY(animation.ease({
        values: images.map((_, index) => [index * images.length/TAU, index * images.length/TAU]).flat(Infinity),
        currentTime: (
          // +column/columns
          +row/rows
          // +circularX/columns
          // +circularX/columns
          +time
        ),
        easingFn: easing.easeInOutExpo
      }))

      translate(0, 0, (circonference/2)/PI)
      // translate(cellWidth*imageIndex, 0)

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
