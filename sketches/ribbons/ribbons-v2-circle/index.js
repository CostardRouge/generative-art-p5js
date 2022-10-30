import { shapes, string, sketch, converters, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 2000,
    defaultValue: 1000,
    category: 'Shape'
  },
  {
    id: "growing-line",
    type: 'switch',
    label: 'Growing line',
    defaultValue: false,
    category: 'Lines'
  },
  {
    id: "change-lines-count",
    type: 'switch',
    label: 'Change lines count over time',
    defaultValue: false,
    category: 'Lines'
  },
  {
    id: "max-lines-count",
    type: 'slider',
    label: 'Max lines count',
    min: 1,
    max: 10,
    step: 0.1,
    defaultValue: 1,
    category: 'Lines'
  },
  {
    id: "lines-length",
    type: 'slider',
    label: 'Lines length',
    min: 1,
    max: 100,
    defaultValue: 40,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 80,
    category: 'Lines'
  },
  {
    id: "ping-pong-opacity",
    type: 'switch',
    label: 'Ping Pong opacity',
    defaultValue: true,
    category: 'Opacity'
  },
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: -2,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 10,
    defaultValue: 2,
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
    id: "rotation-count",
    type: 'slider',
    label: 'Rotation count ?',
    min: -5,
    max: 5,
    defaultValue: 1,
    category: 'Rotation'
  },
  {
    id: "rotation-speed",
    type: 'slider',
    label: 'Rotation speed',
    min: -10,
    max: 10,
    defaultValue: 2,
    category: 'Rotation'
  },
  {
    id: "hue-speed",
    type: 'slider',
    label: 'Hue speed',
    min: -10,
    max: 10,
    defaultValue: 2,
    category: 'Colors'
  },
  {
    id: "hue-rainbow",
    type: 'switch',
    label: 'Hue rainbow',
    defaultValue: false,
    category: 'Colors'
  },
  {
    id: "total-time",
    type: 'slider',
    label: 'Total time',
    min: 1,
    max: 10,
    step: 0.1,
    defaultValue: 1,
    category: 'Motion blur'
  },
  {
    id: "total-frames",
    type: 'slider',
    label: 'Total frames',
    min: 1,
    max: 120,
    defaultValue: 60,
    category: 'Motion blur'
  },
  {
    id: "color-offset",
    type: 'slider',
    label: 'Color offset',
    min: -10,
    max: 10,
    step: 0.1,
    defaultValue: 0.2,
    category: 'Motion blur'
  },
  {
    id: "sample-offset",
    type: 'slider',
    label: 'Sample offset',
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 0.5,
    category: 'Motion blur'
  },
  {
    id: "samples-per-frame",
    type: 'slider',
    label: 'Samples per frame',
    min: 1,
    max: 50,
    defaultValue: 5,
    category: 'Motion blur'
  }
] );

sketch.setup();

const alphaBlurColors = ['#FF0000', '#00FF00', '#0000FF',/* '#FFFF00', '#00FFFF', '#FF00FF'*/];

const motionBlur = ( handler ) => {
  const T = options.get('total-time');
  const totalFrames = options.get('total-frames');
  const colorOffset = options.get('color-offset');
  const colorDelta = colorOffset * T / totalFrames / 4;
  const samplesPerFrame = options.get('samples-per-frame');
  const sampleOffset = options.get('sample-offset');

  blendMode(BLEND);
  background(0); 
  blendMode(ADD);

  for (let i = 0; i < samplesPerFrame; i++) {
    const sampleTime = map(frameCount/6-1 + i * sampleOffset/samplesPerFrame, 0, totalFrames, 0, T);

    for (let colorIndex = 0; colorIndex < alphaBlurColors.length; colorIndex++) {
      const alphaBlurColor = color(alphaBlurColors[colorIndex]);
      const colorTime = sampleTime - colorDelta * colorIndex;

      alphaBlurColor.setAlpha(255/samplesPerFrame);

      handler(colorTime, alphaBlurColor);
    }
  }

  blendMode(SCREEN);
}

function drawer( lerper, positioner, shaper, time, index ) {
  const [lerpMin, lerpMax, lerpStep] = lerper(time, index);
  // noStroke();

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; ) {
    push();
    positioner(lerpIndex, lerpMin, lerpMax, lerpStep, time, index);
    shaper(lerpIndex, lerpMin, lerpMax, time, index);
    pop();

    lerpIndex += lerpStep;
  }
}

const drawBackground = (count = 7, time, color) => {
  noFill();
  stroke(color);
  const w = 2.5 * width;
  const ss = 50;

  for (let i = 0; i < count; i++) {
    const s = w / count * i;
    const min = map(sin(-time+i), -1, 1, 1, s);
    const max = map(cos(time+i), -1, 1, 1, s);

    strokeWeight(map(i, 0, count, 1, ss));
    
    circle(
      0, 0,
     ( s + time * 100) % w
    );
  }
}

sketch.draw((time) => {
  background(0);
  translate(width / 2, height / 2);

  const ll = options.get('lines-length');
  
  // motionBlur( (colorTime, alphaBlurColor) => {
  //   drawBackground(10, colorTime, alphaBlurColor);
  // })

  drawBackground(15, time, color(128, 128, 255));

  drawer(
    ( time, index ) => {
      const lerpMin = 0;
      const lerpMax = TAU//options.get('growing-line') ? map(sin(time/2), -1, 1, 0, TAU*1.5) : TAU*1.5;
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index ) => {

      const w = map(lerpIndex, lerpMin, lerpMax, 0, width /2);
      const h = map(lerpIndex, lerpMin, lerpMax, 0, height /4);

      const x = converters.polar.get(sin, w, lerpIndex, 1)
      const y = converters.polar.get(cos, h, lerpIndex, 1)

      const a = map(sin(time/2), -1, 1, 0, TAU);

      translate(
        x * cos(-time+lerpIndex),
        y// * cos(lerpIndex*time-a)//* 90
      );

      rotate(+time*options.get('rotation-speed')+lerpIndex+a*options.get('rotation-count'));
    },
    ( lerpIndex, lerpMin, lerpMax, time, index ) => {
      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');

      let opacityFactor = mappers.circularMap(
        lerpIndex,
        lerpMax,
        map(
          sin(-time * opacitySpeed + lerpIndex * opacityCount ), -1, 1,
          options.get("start-opacity-factor"),
          options.get("end-opacity-factor")
        ),
        options.get("end-opacity-factor")
      );
    
      let linesCount = options.get("max-lines-count");

      if (options.get("change-lines-count")) {
        linesCount = map(cos(lerpIndex/2-time*2), 0, 1, 1, options.get("max-lines-count"), true);
      }

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          // options.get("lines-weight"),
          // map(sin(lerpIndex+time*2), -1, 1, 1, options.get('lines-weight'), true),
          map(lerpIndex, lerpMin, lerpMax, 1, options.get('lines-weight'), true)
        );

        push();
        beginShape();
        strokeWeight(ll);

        const hueSpeed = -time * options.get("hue-speed");

          // BLUE - PURPLE
          stroke( color(
            90 / opacityFactor,
            map(sin(hueSpeed-lerpIndex*5), -1, 1, 128, 0) / opacityFactor,
            360 / opacityFactor
          ) );

        // PINK
        // stroke( color(
        //   360 / opacityFactor,
        //   90 / opacityFactor,
        //   360 / opacityFactor,
        // ) );

        // if (options.get('hue-rainbow')) {
        //   stroke( color( 
        //     map(sin(hueSpeed+lerpIndex), -1, 1, 0, 360) / opacityFactor,
        //     map(cos(hueSpeed-lerpIndex), -1, 1, 360, 0) / opacityFactor,
        //     map(sin(hueSpeed+lerpIndex), -1, 1, 360, 0) / opacityFactor
        //   ) );
        // }
        // else {
        //   stroke( color( 
        //     map(sin(hueSpeed * 2), -1, 1, 0, 360) / opacityFactor,
        //     map(cos(hueSpeed * 2), -1, 1, 360, 0) / opacityFactor,
        //     map(sin(hueSpeed * 2), -1, 1, 360, 0) / opacityFactor
        //   ) );
          
        // }

        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);
    
        endShape();
        pop()
      }
    },
    time,
    0
  )
});
