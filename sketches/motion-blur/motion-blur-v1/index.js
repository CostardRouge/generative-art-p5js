import { shapes, sketch, converters, events, colors, mappers, options } from './utils/index.js';

// const motionBlur = {
//   buffer: undefined,
//   t: 0,
//   resetBuffer: ( channelValue = 0 ) => {
//     for (let pixelIndex = 0; pixelIndex < motionBlur.buffer.length; pixelIndex++) {
//       motionBlur.buffer[pixelIndex][0] = channelValue;
//       motionBlur.buffer[pixelIndex][1] = channelValue;
//       motionBlur.buffer[pixelIndex][2] = channelValue;
//       motionBlur.buffer[pixelIndex][3] = 255;

//       // for (let channelIndex = 0; channelIndex < motionBlur.buffer[pixelIndex].length; channelIndex++) {
//       //   motionBlur.buffer[pixelIndex][channelIndex] = channelValue;
//       // }
//     }
//   }
// };


// sketch.setup(() => {
//   pixelDensity(1 )
//   const densityOfPixel = pixelDensity();
//   const numberOfPixels = width * densityOfPixel * height * densityOfPixel;

//   motionBlur.buffer = Array.from(Array(numberOfPixels), () => [0, 0, 0, 255]);
//   motionBlur.resetBuffer();

//   print(motionBlur.buffer)

//   console.table({
//     densityOfPixel,
//     numberOfPixels, 
//     pixelLength: numberOfPixels*4
//   });
// }, { width: 200, height: 200 });

// const motionBlurPixelAveraging = () => {
//   const draw_ = t => {
//     background(0);
  
//     stroke(255);
//     strokeWeight(10);
  
//     point(width/2+width/4*cos(TWO_PI*t),width/2+width/4*sin(TWO_PI*t));
//   }

//   const densityOfPixel = pixelDensity();

//   // return
//   if (!recording) {
//     motionBlur.t = mouseX/width;
//     motionBlur.t = frameCount/width;

//     draw_( motionBlur.t );
//   }
//   else {
//     motionBlur.resetBuffer();

//     for (let sa=0; sa<samplesPerFrame; sa++) {
//       motionBlur.t = map(frameCount-1 + sa*shutterAngle/samplesPerFrame, 0, numFrames, 0, 1);
//       //motionBlur.t %= 1;

//       draw_( motionBlur.t );
//       loadPixels();
      
//       for (let i=0; i < pixels.length; i += 4) {
//         const pixelIndex = (i / 4) / densityOfPixel;

//         motionBlur.buffer[pixelIndex][0] += pixels[i + 0] >> 16 & 0xff;
//         motionBlur.buffer[pixelIndex][1] += pixels[i + 1] >> 8 & 0xff;
//         motionBlur.buffer[pixelIndex][2] += pixels[i + 2] & 0xff;

//         // motionBlur.buffer[i + 0 ] += sq(red(pixels[i])/255.0);
//         // motionBlur.buffer[i + 1] += sq(green(pixels[i])/255.0);
//         // motionBlur.buffer[i + 2] += sq(blue(pixels[i])/255.0);
//       }
//     }

//     loadPixels();
//     for (let i=0; i < pixels.length; i += 4 ) {
//       const pixelIndex = (i / 4) / densityOfPixel;

//       pixels[i] = (
//         0xff << 24 | 
//         (motionBlur.buffer[pixelIndex][0]*1.0/samplesPerFrame) << 16 | 
//         (motionBlur.buffer[pixelIndex][1]*1.0/samplesPerFrame) << 8 | 
//         (motionBlur.buffer[pixelIndex][2]*1.0/samplesPerFrame)
//       );

//       // pixels[i] = (
//       //   color(
//       //     255*sqrt(motionBlur.buffer[i + 0]/samplesPerFrame),
//       //     255*sqrt(motionBlur.buffer[i + 1]/samplesPerFrame),
//       //     255*sqrt(motionBlur.buffer[i + 2]/samplesPerFrame)
//       //   )
//       // )
//     }
//     updatePixels();
//   }
// }

sketch.setup();

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

const alphaBlurColors = ['#FF0000', '#00FF00', '#0000FF', /*'#FFFF00', '#00FFFF', '#FF00FF'*/];

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

      handler(colorTime, alphaBlurColor, colorTime);
    }
  }
}

sketch.draw(time => {
  motionBlur( (colorTime, alphaBlurColor) => {
    fill(alphaBlurColor);
    ellipse(
      width/2 + width/4*sin(TAU*colorTime*3),
      height/2 + height/4*cos(TAU*colorTime*5),
      120
    );
  });
});
