import { shapes, sketch, converters, animation, colors, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 1200,
    defaultValue: 150,
    category: 'Shape'
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
    max: 200,
    defaultValue: 190,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 110,
    category: 'Lines'
  },
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 2,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 10,
    defaultValue: 1,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 12,
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
    step: 0.1,
    defaultValue: 0.1,
    category: 'Rotation'
  },
  {
    id: "rotation-speed",
    type: 'slider',
    label: 'Rotation speed',
    min: -10,
    max: 10,
    defaultValue: 0,
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
    id: 'hue-palette',
    type: 'select',
    label: 'Hue palette',
    defaultValue: 'rainbow',
    options: [
      {
        value: 'rainbow',
        label: 'Rainbow',
      },
      {
        value: 'rainbow-trip',
        label: 'Rainbow trip',
      },
      {
        value: 'purple',
        label: 'Purple',
      },
      {
        value: 'pink',
        label: 'Pink',
      },
      {
        value: 'gold',
        label: 'Gold',
      },
      {
        value: 'red',
        label: 'Red',
      }
    ],
    category: 'Colors'
  },
  {
    id: "background-lines-amount",
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines amount',
    defaultValue: 141,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 50,
    label: 'Lines weight',
    defaultValue: 10,
    category: 'Background'
  },
  {
    id: "background-pixelated-blur",
    type: 'slider',
    min: 1,
    max: 8,
    label: 'Pixelated blur value',
    defaultValue: 2,
    category: 'Background'
  },
  {
    id: "background-pixel-density",
    type: 'slider',
    min: 0.01,
    max: 1,
    step: 0.01,
    label: 'Pixelated pixel density',
    defaultValue: 0.1,
    category: 'Background',
    onChange: value => {
      pixilatedCanvas.pixelDensity(value); 
    }
  },
] );

let pixilatedCanvas;

sketch.setup( () => {
  pixilatedCanvas = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );
  pixilatedCanvas.pixelDensity(options.get("background-pixel-density"));
});

function drawer( lerper, positioner, shaper, time, index ) {
  const [lerpMin, lerpMax, lerpStep] = lerper(time, index);

  const targets = [pixilatedCanvas, window]

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; ) {
    targets.forEach( canvas => {
      canvas.push();
      positioner(lerpIndex, lerpMin, lerpMax, lerpStep, time, index, canvas);
      shaper(lerpIndex, lerpMin, lerpMax, time, index, canvas);
      canvas.pop();
    })

    lerpIndex += lerpStep
  }
}

const drawRadialPattern = (count = 7, time, color) => {
  push()
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));
  translate(width /2, height /2 )

  const center = createVector( 0, 0 );
  const size = (width + height);

  const p = 0.1//map(sin(time*2), -1, 1, 0.05, 0.9);
  const m = 0//map(sin(time), -1, 1, 1, 50);

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle + time/4,
      // size * abs(sin(time + angle*5)),

      // size * (sin(time + angle*5) + 2) * cos(time),
      size// * (sin(time + angle) + 1.5),
      // size * (cos(time - angle) + 2),
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

function spring(start, end, amount, length, time, handler, fn = easing.easeInBounce) {
  const _drawer = handler ?? (position => {
    stroke('white')
    strokeWeight(10);
    point( position.x, position.y );
  })

  const halfLength = length / 2;
  const springCenter = p5.Vector.lerp(
    start,
    end,
    fn(map(cos(time), -1, 1, 0, 1))
  );

  const springTop = createVector(springCenter.x, constrain( springCenter.y - halfLength, start.y, end.y ) );
  const springBottom = createVector(springCenter.x, constrain( springCenter.y + halfLength, start.y, end.y ) );

  iterators.vector(springTop, springBottom, 1 / amount, ( position, lerpIndex ) => {
    _drawer(position, lerpIndex)
  });
}

sketch.draw((time) => {
  background(0);

  const hueSpeed = time * options.get("hue-speed");

  pixilatedCanvas.filter(BLUR, options.get("background-pixelated-blur"));
  pixilatedCanvas.background(0, 0, 0, 16);
  image(pixilatedCanvas, 0, 0 );
  
  drawRadialPattern(
    options.get("background-lines-amount"),
    time/4,
    color( 128, 128, 255, 40)
  );

  push()
  translate(width /2, height /2 )
  stroke('red');
  strokeWeight(20);

  const center = createVector( 0, 0 );
  const size = (width + height)/10;
  const p = 0.01;

  const c = 20//map(sin(time), -1, 1, 10, 44)

  const functionChangeSpeed = time;
  const easingFunctions = Object.entries( easing );

  iterators.angle(0, TAU, TAU / c, angle => {
    const edge = converters.polar.vector(
      angle - time/4,
      size
    );

    const movingPart = p5.Vector.lerp(
      edge,
      center,
      // easing.easeInOutElastic(map(cos(time-angle), -1, 1, 0.2, 1)),
      // easing.easeInBounce(map(sin(time+angle), -1, 1, 0, 1)),
      map(cos(time+angle), -1, 1, 0.5, 1),
      // constrain((sin(angle-time)), -0.5, 1)//3*cos(time)
      // noise(angle, time)
    );

    iterators.vector(edge, movingPart, p, (vector, vectorIndex) => {
      const [ easingFunctionName, easingFunction ] = mappers.circularIndex( functionChangeSpeed+angle/5, easingFunctions);

      const opacityFactor = mappers.circularMap(
        map(sin(-time+vectorIndex+angle), -1, 1, 0, 1),
        1,
        map(
          sin(time * options.get("opacity-speed") + vectorIndex * options.get("opacity-group-count") ), -1, 1,
          options.get("start-opacity-factor"),
          options.get("end-opacity-factor")
        ),
        options.get("end-opacity-factor")
      );
      const hueIndex = time + angle
      stroke(
        map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(cos(hueSpeed-hueIndex), -1, 1, 360, 0) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
      )

      // strokeWeight(40);
      strokeWeight(mappers.fn(vectorIndex, 0, 1, 70, 3, easingFunction));
      point( vector.x, vector.y );
    })

    // spring(
    //   edge,
    //   center,
    //   25,
    //   100,
    //   time+angle/2,
    //   ( position, lerpIndex ) => {
    //     const opacityFactor = mappers.circularMap(
    //       lerpIndex,
    //       1,
    //       map(
    //         sin(-time * options.get("opacity-speed") + lerpIndex * options.get("opacity-group-count") ), -1, 1,
    //         options.get("start-opacity-factor"),
    //         options.get("end-opacity-factor")
    //       ),
    //       options.get("end-opacity-factor")
    //     );
    //     const hueIndex = lerpIndex
    //     stroke(
    //       map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
    //       map(cos(hueSpeed-hueIndex), -1, 1, 360, 0) / opacityFactor,
    //       map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
    //     )

    //     strokeWeight(40);
    //     point( position.x, position.y );
    //   },
    //   easing.easeInOutElastic
    // );

    // beginShape();
    // iterators.vector(edge, center, p, (vector, vectorIndex) => {
    //   // point(
    //   //   vector.x,
    //   //   vector.y
    //   // );
    // })
    // endShape();
  } )
  pop()

  return;

  drawer(
    ( time, index ) => {
      const lerpMin = 0;
      const lerpMax = PI
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index, givenCanvas ) => {
      givenCanvas.translate(width / 2, height / 2);
      givenCanvas.rotate(-time/2)

      givenCanvas.rotate(lerpIndex+cos(time));
    },
    ( lerpIndex, lerpMin, lerpMax, time, index, givenCanvas ) => {
      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');
      const hueSpeed = -time * options.get("hue-speed");

      const lineMin = -PI
      const lineMax = PI

      let linesCount = options.get("max-lines-count")
      linesCount = animation.sequence(
        "linesCount",
        time/2,
        [
          1, 2, 3, 4
        ],
        0.0001
      );

      let lineStep = lineMax / linesCount;
      // lineStep = lineMax / mappers.circularIndex(time, [2, 5, 3, 2, 4, 1]);

      // const i = map(lerpIndex, 0, lerpMax, 0, 1)
      // const acc = easing.easeInOutElastic(i)

      const weight = mappers.circularMap(lerpIndex, lineMax, 10, options.get('lines-weight'));

      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        givenCanvas.push();
        givenCanvas.beginShape();

        const vector = converters.polar.vector(
          lineIndex,//*abs(sin(0+time)),
          options.get('lines-length')*abs(cos(time+lineIndex))
        );

        givenCanvas.strokeWeight( weight );
        // givenCanvas.strokeWeight( options.get('lines-weight') );

        const opacityFactor = map(
          sin(lerpIndex*opacityCount+time*opacitySpeed),
          -1,
          1,
          map(cos(lineIndex+lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 25, 1),
          1
        );

        // const colors = [
        //   color(
        //     map(sin(hueSpeed+lerpIndex*5), -1, 1, 0, 360) /
        //       opacityFactor,
        //     map(sin(hueSpeed-lerpIndex*5), -1, 1, 360, 0) /
        //       opacityFactor,
        //     map(sin(hueSpeed+lerpIndex*5), -1, 1, 360, 0) /
        //       opacityFactor,
        //     // map(lerpIndex, lerpMin, lerpMax, 0, 100)
        //     mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        //   ),
        //   color(
        //     90 / opacityFactor,
        //     map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0) / opacityFactor,
        //     360 / opacityFactor,
        //     mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        //   ),
        //   color(
        //     360 / opacityFactor,
        //     90 / opacityFactor,
        //     192 / opacityFactor,
        //     mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        //   ),
        //   color(
        //     map(cos(hueSpeed-lerpIndex*4), -1, 1, 360, 0)  / opacityFactor,
        //     map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0)  / opacityFactor,
        //     90 / opacityFactor,
        //     mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        //   ),
        //   color(
        //     255  / opacityFactor,
        //     225  / opacityFactor,
        //     0 / opacityFactor,
        //     mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        //   ),
        //   color(
        //     360 / opacityFactor,
        //     32 / opacityFactor,
        //     64 / opacityFactor,
        //     mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        //   )
        // ];

        // const switchSpeed = time*2// + abs(lineIndex);

        // let cc = mappers.circularIndex(switchSpeed, colors)

        // givenCanvas.stroke( cc );

        if (options.get('hue-palette') === "rainbow") {
          givenCanvas.stroke( color(
            map(sin(hueSpeed+lerpIndex*5), -1, 1, 0, 360) /
              opacityFactor,
            map(sin(hueSpeed-lerpIndex*5), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueSpeed+lerpIndex*5), -1, 1, 360, 0) /
              opacityFactor,
            // map(lerpIndex, lerpMin, lerpMax, 0, 100)
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }
        
        if ( options.get('hue-palette') === "purple") {
          givenCanvas.stroke( color(
            90 / opacityFactor,
            map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0) / opacityFactor,
            360 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }
        
        if (options.get('hue-palette') === "pink") {
          givenCanvas.stroke( color(
            360 / opacityFactor,
            90 / opacityFactor,
            192 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        if (options.get('hue-palette') === "rainbow-trip") {
          givenCanvas.stroke( color(
            map(cos(hueSpeed-lerpIndex*4), -1, 1, 360, 0)  / opacityFactor,
            map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0)  / opacityFactor,
            90 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        if (options.get('hue-palette') === "gold") {
          givenCanvas.stroke( color(
            255  / opacityFactor,
            225  / opacityFactor,
            0 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        if (options.get('hue-palette') === "red") {
          givenCanvas.stroke( color(
            360 / opacityFactor,
            32 / opacityFactor,
            64 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        givenCanvas.stroke( color(
          map(sin(hueSpeed+lineIndex*5), -1, 1, 0, 360) /
            opacityFactor,
          map(sin(hueSpeed-lineIndex*5), -1, 1, 360, 0) /
            opacityFactor,
          map(sin(hueSpeed+lineIndex*5), -1, 1, 360, 0) /
            opacityFactor,
          // mappers.circularMap(lerpIndex, lerpMax, 1, 255)
        ) );

        givenCanvas.vertex(vector.x, vector.y);
        givenCanvas.vertex(vector.x, vector.y)

        givenCanvas.endShape();
        givenCanvas.pop()
      }
    },
    time,
    0
  )
});
