import { shapes, sketch, converters, events, animation, mappers, iterators, options, string } from './utils/index.js';

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
    defaultValue: false,
    category: 'Lines'
  },
  {
    id: "max-lines-count",
    type: 'slider',
    label: 'Max lines count',
    min: 1,
    max: 10,
    step: 0.5,
    defaultValue: 2,
    category: 'Lines'
  },
  {
    id: "lines-length",
    type: 'slider',
    label: 'Lines length',
    min: 1,
    max: 500,
    defaultValue: 200,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 500,
    step: 10,
    defaultValue: 150,
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
    max: 50,
    defaultValue: 20,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 20,
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
    defaultValue: 0,
    category: 'Rotation'
  },
  {
    id: "rotation-speed",
    type: 'slider',
    label: 'Rotation speed',
    min: -10,
    max: 10,
    step: 0.1,
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
    defaultValue: 'gold',
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
    id: "background-lines-count",
    type: 'number',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 200,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 3,
    category: 'Background'
  },
  {
    id: "background-lines-precision",
    type: 'slider',
    min: 0.05,
    max: 1,
    step: 0.05,
    label: 'Lines precision',
    defaultValue: 0.5,
    category: 'Background'
  },
  {
    id: "background-pixelated-blur",
    type: 'slider',
    min: 1,
    max: 8,
    label: 'Pixelated blur value',
    defaultValue: 4,
    category: 'Background'
  },
  {
    id: "background-pixel-density",
    type: 'slider',
    min: 0.01,
    max: 1,
    step: 0.01,
    label: 'Pixelated pixel density',
    defaultValue: 0.05,
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
  // translate(width /2, height /2 )

  noFill();
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));

  const center = createVector( 0, 0 );
  const size = (width + height)/4;

  const p = options.get("background-lines-precision")//map(sin(time*2), -1, 1, 0.05, 0.9);
  const m = 0//map(cos(time), -1, 1, -100, 100);
  // const m = map(cos(time), -1, 1, 1, 100);

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,
      // size * abs(sin(time)),
      // size * abs(cos(time+angle)),

      size * (abs(sin(time + angle*5) + l)+2 * abs(cos(time + angle*8)+2))/l,
      // size * (abs(sin(time + angle) + l) * abs(cos(time + angle)))/l,
      // size * (sin(time*2 - angle) + 1.5),
      // size * (cos(time*2 + angle*2) + 2),
    );

    beginShape();

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      const lerpIndexOffset = lerpIndex * 10 * angle;
      const x = map(sin(time+lerpIndexOffset), -1, 1, m, -m);
      const y = map(cos(time-lerpIndexOffset), -1, 1, -m, m);

      vertex(
        vector.x + x,//* sin(time + lerpIndex),
        vector.y - y// * cos(time - lerpIndex),
      );
    })

    endShape();
  } )
  pop()
}

let l

sketch.draw((time) => {
  background(0);

  l = animation.sequence(
    "l",
    time,
    [
      1.5, 1.5, 2, 2.5, 3, 0.5, 0.5, 0.5
    ],
    0.05
  );

  // l = 3

  pixilatedCanvas.filter(BLUR, options.get("background-pixelated-blur"));
  pixilatedCanvas.background(0, 0, 0, 48);
  image(pixilatedCanvas, 0, 0 );

  drawRadialPattern(
    options.get("background-lines-count"),
    time,
    color( 128, 128, 255, 96)
  );

  drawer(
    ( time, index ) => {
      const lerpMin = 0//map(cos(time), -1, 1, -PI, 0, true);
      const lerpMax = PI/6//map(sin(time), -1, 1, 3, 4);
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index, givenCanvas ) => {
      givenCanvas.translate(width / 2, height / 2);
      // givenCanvas.rotate(lerpIndex+options.get('rotation-count'));
      givenCanvas.rotate(time+1*cos(time));
      // givenCanvas.rotate(-time);
    },
    ( lerpIndex, lerpMin, lerpMax, time, index, givenCanvas) => {

      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');

      // let opacityFactor = mappers.circularMap(
      //   lerpIndex,
      //   // angleMin,
      //   lerpMax*4,
      //   map(
      //     sin(-time * opacitySpeed + lerpIndex * opacityCount ), -1, 1,
      //     options.get("start-opacity-factor"),
      //     options.get("end-opacity-factor")
      //   ),
      //   options.get("end-opacity-factor")
      // );

      // if (options.get('ping-pong-opacity')) {
      //   opacityFactor = map(
      //     map(sin(lerpIndex*opacityCount-time*opacitySpeed), -1, 1, -1, 1),
      //     -1,
      //     1,
      //     // map(sin(lerpIndex), -1, 1, 1, 50),
      //     map(cos(lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 15, 1),
      //     1
      //   );
      // }
    
      let linesCount = options.get("max-lines-count");

      if (options.get("change-lines-count")) {
        linesCount = map(cos(lerpIndex/2-time), -1, 1, 1, options.get("max-lines-count"), true);
      }

      const lineMin = -PI;
      const lineMax = PI

      const ll = options.get('lines-length');
      const s = mappers.circularMap(lerpIndex, lineMax, -ll, ll)
    
      const lineStep = lineMax / l;

      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector( lineIndex, s * 1.55 );

      // const strokeCoeff = animation.sequence(
      //   "strokeCoeff",
      //   time+(lineIndex+PI),
      //   [
      //   0.5, 0.75, 1, 1.25, 1.5, 1.75, 2
      //   ],
      //   1.1
      // );

        givenCanvas.push();
        givenCanvas.beginShape();
        givenCanvas.strokeWeight(mappers.circularMap(lerpIndex, lineMax/6, 10, options.get('lines-weight')));
        // givenCanvas.strokeWeight(mappers.circularMap(lerpIndex, lineMax/6, 10, options.get('lines-weight')*strokeCoeff));

        const opacityFactor = map(
          sin(lineIndex+lerpIndex*opacityCount+time*opacitySpeed),
          -1,
          1,
          map(cos(lineIndex+lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 1, 10),
          1
        );
        
        const hueSpeed = -time * options.get("hue-speed");
        const hueIndex = lineIndex;

        if (options.get('hue-palette') === "rainbow") {
          givenCanvas.stroke( color(
            map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) /
              opacityFactor,
            map(sin(hueSpeed-hueIndex), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) /
              opacityFactor,
            // map(lerpIndex, lerpMin, lerpMax, 0, 100)
            //mappers.circularMap(lerpIndex, lerpMax/10, 1, 255)
          ) );
        }
        
        if (options.get('hue-palette') === "purple") {
          givenCanvas.stroke( color(
            90 / opacityFactor,
            map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0) / opacityFactor,
            360 / opacityFactor,
            //mappers.circularMap(lerpIndex, lerpMax, 1, 255)
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

        if (options.get('hue-palette') === "red") {
          givenCanvas.stroke( color(
            360 / opacityFactor,
            32 / opacityFactor,
            64 / opacityFactor,
            //mappers.circularMap(lerpIndex, lerpMax, 1, 255)
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
            //mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        givenCanvas.vertex(vector.y, vector.x);
        givenCanvas.vertex(vector.y, vector.x);
    
        givenCanvas.endShape();
        givenCanvas.pop()
      }
    },
    time,
    0
  )
});
