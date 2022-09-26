import { audio, sketch, converters, canvas, events, colors, mappers, iterators, options, string, easing } from './utils/index.js';

options.add( [
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 20,
    defaultValue: 10,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Opacity'
  },

  {
    id: "background-lines-count",
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 120,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 4,
    category: 'Background'
  },

  {
    id: "audio-reactive-bass-amplifier",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    label: 'Bass amplifier',
    defaultValue: 0.5,
    category: 'Audio reactive'
  },
  {
    id: "audio-reactive-bass-threshold",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Bass threshold',
    defaultValue: 0.5,
    category: 'Audio reactive'
  },

  {
    id: "audio-reactive-lowMid-amplifier",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    label: 'Low-mid amplifier',
    defaultValue: 0.5,
    category: 'Audio reactive'
  },
  {
    id: "audio-reactive-lowMid-threshold",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Low-mid threshold',
    defaultValue: 0.4,
    category: 'Audio reactive'
  },

  {
    id: "audio-reactive-mid-amplifier",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    label: 'Mid amplifier',
    defaultValue: 1,
    category: 'Audio reactive'
  },
  {
    id: "audio-reactive-mid-threshold",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Mid threshold',
    defaultValue: 0.3,
    category: 'Audio reactive'
  },

  {
    id: "audio-reactive-highMid-amplifier",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    label: 'High-mid amplifier',
    defaultValue: 1,
    category: 'Audio reactive'
  },
  {
    id: "audio-reactive-highMid-threshold",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.01,
    label: 'High-mid threshold',
    defaultValue: 0.2,
    category: 'Audio reactive'
  },

  {
    id: "audio-reactive-treble-amplifier",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    label: 'Treble amplifier',
    defaultValue: 1,
    category: 'Audio reactive'
  },
  {
    id: "audio-reactive-treble-threshold",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Treble threshold',
    defaultValue: 0.1,
    category: 'Audio reactive'
  },
] );

// const audioEnergy = {
//   bass: {
//     threshold: 0.88,
//     amplifier: 0.5,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   lowMid: {
//     threshold: 0.88,
//     amplifier: 0.5,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   mid: {
//     threshold: 0.7,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   highMid: {
//     threshold: 0.47,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   treble: {
//     threshold: 0.07,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined
//   }
// }

// const audioEnergy = {
//   subBass: {
//     frequencies: [20, 60],
//     threshold: 0.88,
//     amplifier: 0.5,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   bass: {
//     frequencies: [60, 250],
//     threshold: 0.88,
//     amplifier: 0.5,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   lowMid: {
//     frequencies: [250, 500],
//     threshold: 0.3,
//     amplifier: 0.5,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   mid: {
//     frequencies: [500, 2000],
//     threshold: 0.3,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   upperMid: {
//     frequencies: [2000, 4000],
//     threshold: 0.3,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   presence: {
//     frequencies: [4000, 6000],
//     threshold: 0.0,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined,
//   },
//   brilliance: {
//     frequencies: [6000, 20000],
//     threshold: 0.07,
//     amplifier: 1,
//     raw: undefined,
//     smooth: 0,
//     corrected: undefined
//   }
// }

sketch.setup(() => {
  audio.capture.setup();
});

const pattern = (count = 7, time, color) => {
  push()
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));
  translate(width /2, height /2 )

  const center = createVector( 0, 0 );
  const size = (width + height);

  const p = .1

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,//- time,
      size
    );

    beginShape();
    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      vertex(
        vector.x,
        vector.y
      );
    })
    endShape();
  } )
  pop()
}

const drawRadialPattern = (count = 7, time) => {
  noFill();

  const opacitySpeed = options.get('opacity-speed');
  const startOpacityFactor = options.get("start-opacity-factor");
  const endOpacityFactor = options.get("end-opacity-factor");
  const opacityCount = options.get('opacity-group-count');

  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const p = 0.005

  iterators.angle(0, TAU, TAU / count, (angle, index) => {
    const edge = converters.polar.vector(
      angle,//+time
      size,
      size
    );

    const opacityFactor = mappers.circularMap(
      angle,
      TAU,
      map(
        sin(time + opacitySpeed + angle * opacityCount ), -1, 1,
        startOpacityFactor,
        endOpacityFactor
      ),
      endOpacityFactor
    )

    const varyingEdgeAmount = audio.capture.energy.byCircularIndex( index );
    const varyingEdge = p5.Vector.lerp(center, edge, varyingEdgeAmount);

    beginShape();
    iterators.vector(varyingEdge, center, p, (vector, lerpIndex) => {

      const hueIndex = lerpIndex * 5;
      const hueSpeed = time;

      stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(cos(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
      ) );

      strokeWeight(map(lerpIndex, 0, 1, 70, 0));

      point( vector.x, vector.y );
      vertex( vector.x, vector.y );
    })

    stroke(128, 128, 255, 128)
    strokeWeight(3)
    endShape();
  } )
}

sketch.draw((time) => {
  background(0);

  push();
  pattern(
    options.get("background-lines-count"),
    time/4,
    color( 128, 128, 255, 64)
  );

  translate(width / 2, height / 2);
  drawRadialPattern(
    7,
    time
  );

  pop();

  audio.capture.energy.monitor();
  audio.capture.energy.draw(true, false);
});
