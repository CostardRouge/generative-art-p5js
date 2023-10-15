import { events, sketch, string, mappers, easing, animation, colors, cache, audio, options } from './utils/index.js';

options.add( [
  {
    id: "shape-stroke-weight",
    type: 'slider',
    label: 'Stroke weight',
    min: 1,
    max: 60,
    defaultValue: 5,
    category: 'Shape'
  },
  {
    id: "shape-vertical-count",
    type: 'slider',
    label: 'Vertical count',
    min: 10,
    max: 500,
    defaultValue: 100,
    category: 'Shape'
  },
  {
    id: "noise-detail-lod",
    type: 'number',
    label: 'Noise detail lod',
    min: 0,
    max: 32,
    defaultValue: 3,
    category: 'Noise'
  },
  {
    id: "noise-detail-falloff",
    type: 'slider',
    label: 'Noise detail falloff',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.6,
    category: 'Noise'
  },
  {
    id: "max-angle-step",
    type: 'slider',
    label: 'Max angle step',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 60,
    category: 'Angle step'
  },
  {
    id: "min-angle-step",
    type: 'slider',
    label: 'Min angle step',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 30,
    category: 'Angle step'
  },
] );

sketch.setup( undefined, { type: "webgl" } );

events.register("post-setup", () => {
  audio.capture.setup(0.85, 4096);
  events.register("post-draw", audio.capture.energy.recordHistory);
});

let direction = 1;

events.register("engine-mouse-pressed", () => {
  direction *= -1
});

let tt = 0;

sketch.draw( (time, center) => {
  background(0);
  noFill();
  stroke(128, 128, 255);

  noiseDetail(
    options.get("noise-detail-lod"),
    options.get("noise-detail-falloff"),
  );

  tt += 0.01 * direction ;

  const W = width/2;
  const H = height/2

  let audioLevel = audio.capture.audioIn.getLevel()

  audioLevel = audio.capture.energy.byIndex( 0, "raw")

  const {
    smooth: smoothLevel,
    min: minReachedAudioLevel,
    max: maxReachedAudioLevel,
  } = mappers.valuer("audio-level", audioLevel)

  point(
    -W+50,
    map(audioLevel, 0, 1, H-50, -H+50)
  )

  point(
    -W+100,
    map(smoothLevel, 0, 1, H-50, -H+50),
  )

  stroke("red")
  let maxY = map(maxReachedAudioLevel, 0, 1, H-50, -H+50)
  let minY = map(minReachedAudioLevel, 0, 1, H-50, -H+50)

  line(-W, maxY, W, maxY)
  line(-W, minY, W, minY)

  const count = options.get("shape-vertical-count");
  const scale = 1.55;

  const angleStart = 0;
  const angleEnd = TAU;

  const [ radiusMin, radiusMax ] = [ 50, 200 ]; 

  // const from = createVector(-W, 0);
  // const to = createVector(W, 0);

  rotateY(time/4)
  // rotateX(time/4)

  const from = createVector(0, H);
  const to = createVector(0, -H);

  for (let t = 0; t < count; t++) {
    const horizontalProgression = t/count;
    const horizontalPolarProgression = map(horizontalProgression, 0, 1, -PI/2, PI/2);
    const energyLevel = audio.capture.energy.mapLevel(horizontalProgression, 0.07);

    // const horizontalPolarProgression = map(energyLevel?.smooth, energyLevel?.min, energyLevel?.max, -PI/2, PI/2);


    const stageRatio = t/(count/2);

    push();
    translate( p5.Vector.lerp(from, to, horizontalProgression) )
    rotateX(PI/2)
    // rotateY(PI/2)

    strokeWeight( options.get("shape-stroke-weight") ) 

    // rotateZ(
    //   animation.ease({
    //     values: [ PI/2, PI/6 ],
    //     currentTime: sin(time+horizontalPolarProgression+energyLevel?.smooth)+time/3,
    //     currentTime: sin(time*2+smoothLevel*2)+time/2,
    //     duration: 1,
    //     easingFn: easing.easeInOutExpo,
    //     easingFn: easing.easeInOutCubic,
    //     // easingFn: easing.easeInOutQuint,
    //   })
    // )

    // const angleCount = map(sin(time+horizontalPolarProgression+energyLevel?.smooth), -1, 1, 30, 60);

    // const angleCount = mappers.fn(
    //   noise(horizontalProgression+energyLevel?.smooth), 0, 1,
    //   options.get("min-angle-step"),
    //   options.get("max-angle-step"),
    //   easing.easeInOutExpo
    // )

    // const angleCount = mappers.fn(
    //   horizontalProgression+energyLevel?.smooth, energyLevel?.min, energyLevel?.max,
    //   options.get("min-angle-step"),
    //   options.get("max-angle-step"),
    //   easing.easeInOutExpo
    // )

    const angleCount = 60

    // const angleCount = mappers.fn(
    //   smoothLevel, minReachedAudioLevel, maxReachedAudioLevel,
    //   options.get("min-angle-step"),
    //   options.get("max-angle-step"),
    //   easing.easeInOutExpo
    // )

    const angleStep = angleEnd / angleCount;

    for (let angle = angleStart; angle < angleEnd; angle += angleStep) {
      const progression = angle / angleEnd;
      const polarAngleProgression = map( angle, angleStart, angleEnd, -PI/2, PI/2 );
      // const energy = audio.capture.energy.map(progression, horizontalProgression);

      // const r = map(noise(progression, stageRatio+time, polarAngleProgression), 0, 1, radiusMin, radiusMax);
      // const r = map(noise(energyLevel?.smooth, progression, polarAngleProgression), 0, 1, radiusMin, radiusMax);
      const r = mappers.fn(energyLevel?.smooth, energyLevel?.min, energyLevel?.max, radiusMin, radiusMax, easing.easeInOutCubic)
      // const r = mappers.fn(energy?.smooth, energy?.min, energy?.max, radiusMin, radiusMax, easing.easeInOutCubic)
      // const r = mappers.fn(energy, 0, 1, radiusMin/2, radiusMax)
      // const r = map(energy, 0, 1, 150, 300);
      const x = sin( angle /*- polarAngleProgression + time*/ ) * r;
      const y = cos( angle /*+ progression*polarAngleProgression*/ ) * r;
      // const colorFunction = mappers.circularIndex(noise(x/width)+time, [ colors.purple, colors.green, colors.rainbow ]);
      const colorFunction = colors.rainbow //mappers.circularIndex(noise(polarAngleProgression+time, progression+time)*3, [ colors.purple, colors.green, colors.rainbow ]);
      const opacityFactor = mappers.fn(sin(time*3+progression*horizontalPolarProgression), -1, 1, 5, 1.5, easing.easeInOutExpo);
      // const opacityFactor = mappers.fn(audioLevel, 0, 1, 3, 5, easing.easeInExpo);
      // const opacityFactor = mappers.fn(r, radiusMin, radiusMax, 4, 1, easing.easeInExpo);

      stroke(colorFunction({
        hueOffset: (
          // +horizontalProgression
          // +time
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI/2, PI/2)*2,
        hueIndex: mappers.fn(noise(x/width*3, y/height*3, horizontalProgression*2+(tt)), 0, 1, -PI/2, PI/2)*8,
        opacityFactor: 1.5
        // opacityFactor,
      }))

      point(x*scale, y*scale)
    }

    pop()
  }

  orbitControl();
});
