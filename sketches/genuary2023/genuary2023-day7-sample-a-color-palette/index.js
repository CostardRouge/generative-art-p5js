import { audio, debug, sketch, events, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

events.register("engine-window-preload", () => {
  cache.store("image", () => loadImage( "homogenic.webp" ))
});

events.register("post-setup", () => {
  audio.capture.setup(0.9, 8192)
  events.register("post-draw", audio.capture.energy.recordHistory );
});

function chunk(array, chunkSize) {
  const chunkedArray = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }

  return chunkedArray;
}

export const getDominantColorFromPixels = ( pixels, precision = 28 ) => {
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

const dominantColors = {}

let audioActivity = 0
let bassActivity = 0
let mediumActivity = 0

sketch.draw( (time, center) => {
  background(0);

  background(
    lerpColor(
      color(0),
      color(32,32,64,1),
      //color(96,0,32,1),
      audio.capture.energy.byIndex( 0 )
      // audio.capture.energy.byIndex( 4, "count" )
    )
  );

  translate(0, 0, -600)
  rotateX(PI/6)

  const audioAverage = audio.capture.energy.average("smooth");
  const bassAverage = audio.capture.energy.byIndex(1, "raw");
  const mediumAverage = audio.capture.energy.byIndex(1, "smooth");

  bassActivity += map(bassAverage, 0, 1, 0, 0.03, true);
  audioActivity += map(audioAverage, 0, 1, 0, 0.03, true);
  mediumActivity += mediumAverage*0.03

  // rotateY(mediumActivity)
  // rotateX(audioActivity)

  const cc = 20//~~map(bassAverage, 0, 1, 2, 30)
  // const cc = ~~map(sin(time+audioEnergyAverage), -1, 1, 4, 30)

  const cols = cc;
  const rows = cc*height/width;
  const size = width/cols

  if (Object.values(dominantColors).length === 0) {
    const img = cache.get("image");

    const gridOptions = {
      startLeft: createVector( -width/2, -height/2 ),
      startRight: createVector( width/2, -height/2 ),
      endLeft: createVector( -width/2, height/2 ),
      endRight: createVector( width/2, height/2 ),
      rows,
      cols,
      centered: true
    }

    grid.draw(gridOptions, (cellVector, { x, y}) => {
      const dominantColor = cache.store(`image-pixels-${x}-${y}-${rows}-${cols}`, () => {
        const { width: imageWidth, height: imageHeight } = img;
  
        const subWidth = imageWidth / cols;
        const subHeight = imageHeight / rows;
        const subX = x/cols * imageWidth;
        const subY = y/rows * imageHeight;
        const subImage = img.get( subX, subY, subWidth, subHeight );
  
        subImage.loadPixels()
  
        return getDominantColorFromPixels( subImage.pixels );
      });
  
      dominantColors[`${x}-${y}`] = {
        position: cellVector,
        color: dominantColor,
        x,
        y
      }
    })
  }

  ambientLight(128)
  directionalLight(128, 128, 128, -1, -1, -1);

  for ( const key in dominantColors ) {
    const { color, position, x, y } = dominantColors[key]
    const nextX = x//~~map(sin(time-x/cols), -1, 1, 0, cols);
    const nextY = y//~~map(sin(time/8+y/rows), -1, 1, 0, rows);

    const {color: nextColor } = dominantColors[ `${nextX}-${nextY}` ];

    if (noise(x, y, audioActivity) > audioAverage) {
      //continue
    }

    const { levels: [ r, g, b ] } = nextColor;

    const xx = ~~(x/cols*audio.capture.bins)
    const yy = ~~(y/rows*audio.capture.historyBufferSize)
    const audioHistoryLine = audio.capture.history?.spectrum[yy];
    const energy = audioHistoryLine?.[xx]

    const n = noise(x/cols, y/rows+energy/255)
    const z = energy/255 * 500 * bassAverage//map((((r+g+b)/3)/255), 1, 0, 0, 1)

    push()
    // fill(nextColor);
    ambientMaterial(nextColor);

    // rotateY(audioActivity+x/cols)
    translate(position.x, position.y, z/2)

    //rotateZ(time+x/cols)

    box(size, size, z+100*bassAverage)
    pop()
  }
  //orbitControl()
});
