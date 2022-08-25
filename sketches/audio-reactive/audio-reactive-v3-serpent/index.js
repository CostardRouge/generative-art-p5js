import { shapes, sketch, converters, canvas, events, colors, mappers, iterators, options, string, easing } from './utils/index.js';

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
    defaultValue: 70,
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
    defaultValue: 0.3,
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
    defaultValue: 0.3,
    category: 'Audio reactive'
  },

  {
    id: "audio-reactive-mid-amplifier",
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    label: 'Mid amplifier',
    defaultValue: 2,
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
    defaultValue: 0.3,
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
    defaultValue: 0.3,
    category: 'Audio reactive'
  },
] );

let mic;
let fft;

const audioEnergy = {
  bass: {
    threshold: 0.88,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  lowMid: {
    threshold: 0.88,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  mid: {
    threshold: 0.7,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  highMid: {
    threshold: 0.47,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  treble: {
    threshold: 0.07,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined
  }
}

const bins = 2048;

sketch.setup(() => {
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.5, bins);

  events.register( "mousePressed", function () {
    userStartAudio();

    if (mic?.enabled) {
      return
    }
    
    mic.start();
    fft.setInput(mic);

    console.log({
      mic,
      fft
    });

    // for (const rangeName in audioEnergy) {
    //   const range = audioEnergy[rangeName];

    //   range.peakDetect = new p5.PeakDetect(
    //     fft[ rangeName][0],
    //     fft[ rangeName][1]
    //   );

    //   range.peakDetect.onPeak( peak => {
    //     console.log(`${rangeName}`, peak)

    //     range.smooth = peak//lerp( range.smooth, peak, 0.67 );
    //   });
    // }
  });
});

const computeAudioEnergy = () => {
  if ( false === mic?.enabled ) {
    return;
  }

  fft.analyze();

  for (const rangeName in audioEnergy) {
    const range = audioEnergy[rangeName];

    range.amplifier = options.get(`audio-reactive-${rangeName}-amplifier`);
    range.threshold = options.get(`audio-reactive-${rangeName}-threshold`);

    range.raw = fft.getEnergy( rangeName ) / 255;
    range.corrected = range.raw * range.amplifier;

    if ( range.raw >= range.threshold) {
      range.smooth = lerp( range.smooth, range.corrected, 0.67 );
    }

    range.smooth = lerp( range.smooth, 0, 0.067 );
  }
};

const showAudioEnergy = ( spectrum = true, waveform = true ) => {
  if ( false === mic?.enabled ) {
    return
  }

  // if (true === waveform ) {
  //   const wf = fft.waveform();
  //   const w = width / bins;

  //   stroke('blue')
  //   fill('red')
  //   for (let i = 0; i < wf.length; i++) {
  //     const y = map(wf[ i ], -1, 1, height / 2, 0);

  //     rect(i * w, height / 2 - y/2, w, y );
  //   }
  // }

  if (true === spectrum ) {
    const wf = fft.analyze();

    // console.log(wf);

    stroke('red')
    fill('blue')
    for (let i = 0; i < wf.length; i++) {
      const h = map(wf[ i ], 0, 255, 0, height/4);
      const x = map(i, 0, wf.length, 0, width);

      // line(i, height, i, y );
      // rect(i * w, y + height/2, w, height/2 -y );
      rect(x, height, width / wf.length, -h);
    }
  }
};

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

  const ranges = Object.keys( audioEnergy );
  const easingFunctions = Object.entries( easing );

  iterators.angle(0, TAU, TAU / count, (angle, index) => {
    const edge = converters.polar.vector(
      angle,//+time
      size,
      size
    );

    const shapeAudioRangeIndex = index % ranges.length// ceil(map( angle, 0, TAU, 0, ranges.length - 1));
    const rangeName = ranges[ shapeAudioRangeIndex ];

    const varyingEdgeAmount = map(audioEnergy[rangeName]?.smooth, 0, 1, 0, 0.8)
    const varyingEdge = p5.Vector.lerp(center, edge, 1-varyingEdgeAmount);

    const [ , easingFunction ] = mappers.circularIndex( time, easingFunctions);

    beginShape();
    iterators.vector(varyingEdge, center, p, (vector, lerpIndex) => {

      const opacityFactor = mappers.circularMap(
        angle,
        TAU,
        map(
          sin(time * opacitySpeed + lerpIndex + 0 * opacityCount ), -1, 1,
          startOpacityFactor,
          endOpacityFactor
        ),
        endOpacityFactor
      )

      const hueIndex = lerpIndex * 5;
      const hueSpeed = time+varyingEdgeAmount;

      stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(cos(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
        // map(lerpIndex, 0, 1, 255, 0),
        // mappers.fn(lerpIndex, 0, 1, 255, 0, easingFunction)
      ) );

        // stroke( color(
        //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, 0, 360, easingFunctions[7][1]) / opacityFactor,
        //   mappers.fn(cos(hueSpeed+hueIndex), -1, 1, 0, 360, easingFunctions[7][1]) / opacityFactor,
        //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, 360, 0, easingFunctions[7][1]) / opacityFactor,
        //   // mappers.fn(sin(hueSpeed+hueIndex), -1, 1, 360, 0, easingFunctions[7][1]) / opacityFactor,
        // ) );


        strokeWeight(map(lerpIndex, 0, 1, 70, 0));
        // strokeWeight(map(lerpIndex, 0, 1, 0, 70));
        // strokeWeight(mappers.fn(lerpIndex, 0, 1, 70, 0, easingFunctions[7][1]));
      // strokeWeight(mappers.fn(lerpIndex, 0, 1, 70, 0, easingFunction));

      point( 
        vector.x,
        vector.y
      );

      // stroke(128, 128, 255, 128)

      // vertex( vector.x, vector.y );
    })

    strokeWeight(3)
    endShape();
  } )
}

let c = 10;

sketch.draw((time) => {
  background(0);

  push();
  pattern(
    options.get("background-lines-count"),
    time/4,
    color( 128, 128, 255, 64)
  );

  // const [ start, end ] = fft.highMid;

  // if ( frameCount % 300 ) {
  //   c = lerp( c, ceil(map(fft.getEnergy( start, end ), 0, 255, 1, 15)), 0.5)
  // }

  // c = lerp( c, 1, 0.05)

  translate(width / 2, height / 2);
  drawRadialPattern(
    c,
    time
  );

  pop();

  computeAudioEnergy();
  showAudioEnergy();
});
