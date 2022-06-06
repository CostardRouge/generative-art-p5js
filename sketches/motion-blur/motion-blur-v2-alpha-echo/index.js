import { shapes, text, sketch, converters, canvas, events, colors, mappers, options } from './utils/index.js';

options.add( [
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
    defaultValue: 25,
    category: 'Motion blur'
  },
  {
    id: "color-offset",
    type: 'slider',
    label: 'Color offset',
    min: -10,
    max: 10,
    step: 0.1,
    defaultValue: 5,
    category: 'Motion blur'
  },
  {
    id: "sample-offset",
    type: 'slider',
    label: 'Sample offset',
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 1.5,
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

const alphaBlurColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];

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

const drawBackgroundGrid = (count = 7, time, color) => {
  noFill();
  stroke(color);
  strokeWeight(5);
  rectMode(CENTER);
    
  for (let i = 0; i < count; i++) {
    const o = i/10;
    const s = time*5
    const radiusA = (width / count * i) * sin(s+o);
    const radiusB = (width / count * i) * cos(s-o);
    
    rect(
      0, 0,
      width / count * i,
      height / count * i,
      abs(radiusA),
      abs(radiusB),
      abs(radiusA),
      abs(radiusB),
    );
  }
}

sketch.draw((time) => {
  translate(width / 2, height / 2);

  const a = 1+abs(cos(time/2)); 
  const c = 7;
  
  motionBlur( (colorTime, alphaBlurColor) => {
    drawBackgroundGrid(1 + (c * a), colorTime, alphaBlurColor);
    drawBackgroundGrid(1 + ((c-0.5) * a), colorTime, alphaBlurColor);
  })
});
