import { audio, sketch, converters, events, colors, mappers, iterators, options, string, easing } from './utils/index.js';

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

events.register("post-setup", () => {
  audio.capture.setup()
});
sketch.setup()

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

  const easingFunctions = Object.entries( easing );

  iterators.angle(0, TAU, TAU / count, (angle, index) => {
    const edge = converters.polar.vector(
      angle,//+time
      size,
      size
    );

    const varyingEdgeAmount = audio.capture.energy.byCircularIndex( index );
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


sketch.draw((time) => {
  background(0);

  push();
  pattern(
    options.get("background-lines-count"),
    time/4,
    color( 128, 128, 255, 64)
  );

  let c;
  const [ start, end ] = audio.capture.fft.highMid;

  if ( frameCount % 300 ) {
    c = lerp( c ?? 10, (map(audio.capture.fft.getEnergy( start, end ), 0, 255, 1, 15)), 0.5)
  }

  c = lerp( c, 1, 0.0005)

  translate(width / 2, height / 2);
  drawRadialPattern(
    c,
    time
  );

  pop();

  audio.capture.energy.monitor();
  audio.capture.energy.draw(true, false);
});
