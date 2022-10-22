import { events, sketch, converters, audio, grid, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  }
] );

sketch.setup();

let min = Math.PI, max =Math.PI;

String.prototype.hashCode = function() {
  var hash = 0;
  for (var i = 0; i < this.length; i++) {
      var char = this.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const cache = {};

sketch.draw((time,center) => {
  background(0);

  const rows = options.get("grid-rows");
  const cols = options.get("grid-cols");

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }
  const z = frameCount/300//mappers.fn(sin(time), -1, 1, 3, 3.5)
  const scale = (width / cols)//-2;

  // noiseDetail(1.1, 2, 1);
  // noiseSeed()
  // noFill()

  strokeWeight(2);



  grid.draw(gridOptions, (cellVector, { x, y}) => {
    push();
    translate( cellVector.x, cellVector.y );

    const angle = noise(x/cols+time/4, y/rows+time/8, time/6) * (TAU*4);
    const weight = map(center.dist(cellVector), 0, width, 0, scale, true )

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    const distance = cellVector.dist(center);
    const w = mappers.fn(sin(time+angle), -1, 1, width/2, width, Object.entries(easing)[2][1] )


    // strokeWeight(weight);
    // const hash = angle//String(angle).hashCode();

    // if (!cache[hash]) {
    //   cache[hash] = colors.rainbow({
    //     hueOffset: 0,
    //     hueIndex: map(angle, min, TAU, -PI/2, PI/2 ),
    //     // opacityFactor: map(angle, min, max, 3, 1 ),
    //     opacityFactor: mappers.fn(distance, 0, width/3, 15, 1, Object.entries(easing)[2][1] ),
    //   })
    // }

    // fill(cache[hash])

    stroke( colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -PI/4, PI/4 ),
      // opacityFactor: map(angle, min, max, 3, 1 ),
      opacityFactor: mappers.fn(distance, 0, w, 100, 1, Object.entries(easing)[4][1] ),
    }))

    // strokeWeight(map(distance, 0, w, 0, 4));
    // strokeWeight(mappers.fn(distance, 0, w, 0, 2, Object.entries(easing)[2][1] ));
    // rect( 0, 0, scale);
    strokeWeight(weight);
    point( 0, 0);
    // point(0, 0, )
    pop();
  })

  // console.log({
  //   max, min
  // });
});
