import { sketch, converters, colors, mappers, options, animation, easing } from './utils/index.js';

options.add( [
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 1200,
    defaultValue: 400,
    category: 'Shape'
  },
  {
    id: "change-lines-count",
    type: 'switch',
    label: 'Change lines count over time',
    defaultValue: true,
    category: 'Lines'
  },
  {
    id: "max-lines-count",
    type: 'slider',
    label: 'Max lines count',
    min: 1,
    max: 10,
    step: 0.1,
    defaultValue: 3,
    category: 'Lines'
  },
  {
    id: "lines-length",
    type: 'slider',
    label: 'Lines length',
    min: 1,
    max: 100,
    defaultValue: 75,
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
    defaultValue: false,
    category: 'Opacity'
  },
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
    max: 10,
    defaultValue: 3,
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

sketch.setup(() => {
  p5.disableFriendlyErrors = true;
  pixelDensity(1)
}, {
  type: "2d",
  // size: {
  //   // width: 1080,
  //   // height: 1080,
  //   // ratio: 9/16
  // },
  animation: {
    framerate: 60,
    duration: 10
  }
});

function drawer( lerper, positioner, shaper, time, index ) {
  const [lerpMin, lerpMax, lerpStep] = lerper(time, index);
  // noStroke();

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; ) {
    push();
    positioner(lerpIndex, lerpMin, lerpMax, lerpStep, time, index);
    shaper(lerpIndex, lerpMin, lerpMax, time, index);
    pop();

    lerpIndex += lerpStep
  }
}

const size = 250;
const halfSize = size/2;

sketch.draw((time, center, favoriteColor) => {
  background(0);

  // ellipse(map(animation.circularProgression, 0, 1, halfSize, width-halfSize), height / 2, size);
  
  const timeProgression = animation.circularProgression//(frameCount / (60 * 10)) * PI;

  drawer(
    ( time, index ) => {
      const lerpMin = 0//map(cos(time), -1, 1, 0.1, -PI);
      const lerpMax = mappers.fn(animation.circularProgression, 0, 1, PI/2, TAU-0.2, easing.easeInSine);
      // const lerpMax = map(sin(animation.sinAngle*3), -1, 1, PI/2, TAU-0.2)
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index ) => {
      translate(
        map(sin(lerpIndex+animation.sinAngle*3), -1, 1, width/2-200, width/2+200),
        map(cos(lerpIndex*2+animation.cosAngle/3), -1, 1, 250, height-250),
        // map(lerpIndex, lerpMin, lerpMax,
        //   map(sin(animation.sinAngle*2+lerpIndex), -1, 1, 250, height-250),
        //   map(sin(animation.cosAngle*3-lerpIndex/2), -1, 1, 250, height-250),

        //   // map(sin(animation.sinAngle+lerpIndex), -1, 1, 150, height-200),
        //   // map(cos(animation.cosAngle+lerpIndex), -1, 1, 150, height-200),
        // )
        // map(lerpIndex, lerpMin, lerpMax, 150, height-150, true)
      );

      // translate(
      //   mappers.fn(sin(lerpIndex*2+animation.sinAngle*2), -1, 1, width/2-200, width/2+200, easing.easeInSine),
      //   mappers.fn(cos(lerpIndex+animation.cosAngle/2), -1, 1, 300, height-300, easing.easeInExpo)
      // );

      strokeWeight(4)
      stroke(favoriteColor);

      if (lerpIndex == lerpMin) {
        // stroke('red')
        line(-width, 0, width, 0)
        line(0, -height, 0, height)
      }

      if (lerpIndex+lerpStep > lerpMax ) {
        // stroke('red')
        line(-width, 0, width, 0)
        line(0, -height, 0, height)
      }
 
      // rotate(timeProgression)
      rotate(lerpIndex*2+animation.sinAngle*2);
    },
    ( lerpIndex, lerpMin, lerpMax, time, index ) => {

      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');


      const linesCount = 6//mappers.fn(lerpIndex, lerpMin, lerpMax, 2, 6)
      strokeWeight(mappers.circularPolar(lerpIndex, lerpMin, lerpMax, 40, 80));

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          mappers.circularPolar(lerpIndex, lerpMin, lerpMax, 1, 150),
          // mappers.circularPolar(sin(lineIndex+timeProgression), -1, 1, 1, 250),
          // mappers.circularPolar(cos(lerpIndex+animation.cosAngle), -1, 1, 1, 250)

        // map(cos(lerpIndex+animation.sinAngle), -1, 1, 100, 250),

        );
        push();

        beginShape();

        const hueSpeed = animation.sinAngle+timeProgression*5


      const opacityFactor = map(
        map(sin(timeProgression*5+animation.sinAngle+lerpIndex), -1, 1, -1, 1),
        -1,
        1,
        map(cos(timeProgression+animation.cosAngle*3+lerpIndex+lineIndex), -1, 1, 1, 3),
        // 10,
        1
      );

        // stroke(colors.rainbow({
        //   hueOffset: (
        //     // +horizontalProgression
        //     // +time
        //     // +(lineIndex/lineMax)*2
        //     // +lerpIndex

        //     // +animation.circularProgression*2
        //     +timeProgression
        //     +0
        //   ),
        //   hueIndex: mappers.fn(sin(
        //     +lerpIndex
        //     +(lineIndex/lineMax)
        //     +hueSpeed
        //   ), -1, 1, -PI, PI)*2,
        //   opacityFactor,
        //   alpha: mappers.circularPolar(lerpIndex, lerpMin, lerpMax, 0, 100)
        // }))
    
        stroke( color(
          map(sin(hueSpeed+lerpIndex*7), -1, 1, 0, 360) /
            opacityFactor,
          map(sin(hueSpeed-lerpIndex*7), -1, 1, 360, 0) /
            opacityFactor,
          map(sin(hueSpeed+lerpIndex*7), -1, 1, 360, 0) /
          opacityFactor,
          mappers.circularMap(lerpIndex, lerpMax, 0, 100)
        ) );

        // const mode = mappers.circularIndex(timeProgression-lerpIndex, [true, false])

        // if (mode) {
        //   // vertex(vector.x, vector.y);
        //   // vertex(-vector.x, -vector.y);
        // }
        // else {
        //   // vertex(vector.x, -vector.y);
        //   // vertex(vector.x, -vector.y);
        // }

        // vertex(vector.x, vector.y);
        // vertex(-vector.x, -vector.y);

        vertex(vector.x, -vector.y);
        vertex(vector.x, -vector.y);
    
        endShape();
        pop()
      }
    },
    time,
    0
  )

});
