import { sketch, converters, animation, colors, mappers, iterators, options, easing } from './utils/index.js';

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
    max: 10,
    defaultValue: 6,
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
    id: "hue-speed",
    type: 'slider',
    label: 'Hue speed',
    min: -10,
    max: 10,
    defaultValue: 2,
    category: 'Colors'
  },

  {
    id: "background-lines-count",
    type: 'number',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 100,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 1,
    category: 'Background'
  },
  {
    id: "background-lines-precision",
    type: 'slider',
    min: 0.1,
    max: 1,
    step: 0.001,
    label: 'Lines precision',
    defaultValue: 0.01,
    category: 'Background'
  },
] );

sketch.setup(() => {
  p5.disableFriendlyErrors = true;
  pixelDensity(1)
}, {
  type: "2d",
  size: {
    width: 1080,
    height: 1920,
    // ratio: 9/16
  },
  animation: {
    framerate: 60,
    duration: 10
  }
});

const margin = 50;

const drawRadialPattern = (count = 7, time, _color) => {
  noFill();
  strokeWeight(options.get("background-lines-weight"));

  const size = (width + height)/7;
  const center = createVector( 0, 0 );
  const precision = 1/300//options.get("background-lines-precision")

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      // angle,//+sin(time),//*cos(time*2),
      angle+animation.sinAngle,
      size,
      size*2
    );

    const lineMin = 0;
    const lineMax = TAU;
    const linesCount = 7
    const lineStep = lineMax / linesCount;
  
    iterators.vector(edge, center, precision, (fromEdgeToCenter, lerpIndex) => {
    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const position = createVector(
          fromEdgeToCenter.x * (sin(animation.sinAngle*4 + angle + lerpIndex*2) + 1.5),
          fromEdgeToCenter.y * (cos(animation.cosAngle - angle + lerpIndex) + 1),
          // fromEdgeToCenter.x,
          // fromEdgeToCenter.y,
        );

        const vector = converters.polar.vector(
          // lerpIndex*3*animation.cosOscillation*2+lineIndex+animation.time*3,
          lineIndex+lerpIndex*3,
          mappers.circularPolar(lerpIndex, 0, 1, 10, 150, easing.easeInOutSine_),
        );
        // vector.add(fromEdgeToCenter)
        vector.add(position)

        // beginShape();

        const hueSpeed = (
          // animation.sinAngle
          +animation.time
        )

        const opacityFactor = map(
          Math.sin(
            angle
            +lerpIndex*4
            +(lineIndex/lineMax)/80
            +animation.sinAngle*4
          ),
          -1,
          1,
          map(cos(
            angle
            +(lineIndex/lineMax)*2
            +lerpIndex*4
            +animation.cosAngle*4
          ), -1, 1, 25, 1),
          1
        );

        // strokeWeight(mappers.fn(lerpIndex, 0, 1, 10, 80, easing.easeInOutExpo_));
        strokeWeight(map(lerpIndex, 0, 1, 10, 120));
        strokeWeight(map(lerpIndex, 0, 1, 10, 120));

        stroke(colors.rainbow({
          hueOffset: (
            // +animation.time
            +0
          ),
          hueIndex: mappers.fn(
            Math.cos(
              +angle/10
              +lerpIndex
              +(lineIndex/lineMax)/800
              +animation.angle
            ),
            -1, 1,
            -PI/2, PI/2
          )*8,
          opacityFactor,
          alpha: mappers.circularPolar(lerpIndex, 0, 1, 1, 255),
          // alpha: mappers.fn(lerpIndex, 1, 0, 1, 255),
        }))

        const final = {
          x: constrain(
            vector.x,
            -width/2+margin, width/2-margin
          ),
          y: constrain(
            vector.y,
            -height/2+margin, height/2-margin
          )
        }

        point(final.x, -final.y);
        // vertex(final.x, -final.y);
        // vertex(final.x, -final.y);

        // vertex(final.x, final.y);
        // vertex(-final.x, -final.y);

        // endShape();
      }

    })
  } )
}

sketch.draw((time) => {
  background(0);

  translate(width / 2, height / 2);
  drawRadialPattern(
    7,
    time
  );
});
