import { shapes, sketch, converters, events, colors, mappers, iterators, options, string } from './utils/index.js';

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
    id: "regular-lines-length",
    type: 'switch',
    label: 'Regular lines length',
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
    max: 200,
    defaultValue: 160,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 21,
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
    defaultValue: 400,
    category: 'Background'
  },
] );

sketch.setup();

const fixers = {
  "#8080ff": {
    speed: 1,
    index: 0
  },
  // red: {
  //   speed: 1,
  //   index: 0
  // },
  // green: {
  //   speed: 0.5,
  //   index: 0
  // },
  // blue: {
  //   speed: 0.25,
  //   index: 0
  // }
}

function drawer( lerper, positioner, shaper, time, index ) {
  const [lerpMin, lerpMax, lerpStep] = lerper(time, index);

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; ) {
    push();
    positioner(lerpIndex, lerpMin, lerpMax, lerpStep, time, index);
    shaper(lerpIndex, lerpMin, lerpMax, time, index);
    pop();

    lerpIndex += lerpStep
  }
}

function drawGrid(xCount, yCount, time, color) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  strokeWeight(3)
  stroke( color );

  const offset = -1;
  const xx = xSize * cos(time + xSize )
  const yy = ySize * sin(time + ySize)

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (yy + y * ySize) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

const drawBackground = (count = 7, time, color) => {
  noFill();
  stroke(color);

  for (let i = 0; i < count; i++) {
    strokeWeight(1);
    
    circle(
      0, 0,
      map(sin(time + i * 0.1), -1, 1, 515, width * 2.5)
    );
  }
}


// const drawRadial = (count = 7, time, color) => {
//   noFill();
//   stroke(color);
//   strokeWeight(4);

//   push()
//   for (let i = 0; i < count; i++) {
//     beginShape()
//     let s = map(sin(time + i * 0.1), -1, 1, 515, width * 2.5)
//     s = map(i, 0, count, 275, width*1.2)

//     let aS = 64//map(sin(i+time), -1, 1, 6, 24)

//     for (let angle = 0; angle < TAU; angle += TAU / aS) {

//       let x = s * sin(angle)// + sin(time*2+angle) * 150
//       let y = s * cos(angle)// + sin(time*2+angle) * 250

//       // y = i/2 * 250 * cos(time*5 + angle);
//       // y = s * 250 * cos(time*5 + angle);

//       vertex(x, y);
//     }

//     endShape(CLOSE);
//   }

//   pop()
// }

const drawRadialPattern = (count = 7, time, color) => {
  noFill();
  stroke(color);
  strokeWeight(4);

  const center = createVector( 0, 0 );
  const size = (width + height)/2;

  const p = 0.5//map(sin(time*2), -1, 1, 0.05, 0.9);
  const m = 7//map(sin(time), -1, 1, 1, 50);

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,
      //size * abs(sin(time + angle*5)),

      //size * (sin(time + angle*5) + 2),// * cos(time),
      size * (sin(time + angle) + 1.5),
      size * (cos(time - angle) + 2),
    );

    // point(edge.x, edge.y);
    // line(edge.x, edge.y, center.x, center.y);

    beginShape();

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      const lerpIndexOffset = lerpIndex * 10 * angle;
      const x = map(sin(time*2+lerpIndexOffset), -1, 1, -m, m);
      const y = map(cos(time-lerpIndexOffset), -1, 1, -m, m);

      vertex(
        vector.x + x,// * sin(time + lerpIndex),
        vector.y - y// * cos(time - lerpIndex),
      );
    })

    endShape();
  } )
}

sketch.draw((time) => {
  background(0);

  // drawGrid(1, 1, time/4, color( 128, 128, 255));
  // drawGrid(3, 7, time, color( 128, 128, 255, 64) );


  translate(width / 2, height / 2);
  // drawRadial(10, time/4, color( 128, 128, 255, 128));
  // drawRadialPattern(
  //   options.get("background-lines-count"),
  //   time, color( 128, 128, 255, 32)
  // );

  // drawBackground(15, time, color(128, 128, 255));

  drawer(
    ( time, index ) => {
      const lerpMin = map(cos(time), -1, 1, -PI, 0, true);
      const lerpMax = PI//]map(cos(time/2), -1, 1, TAU-0.3, 0);
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index ) => {
      // stroke(
      //   128,
      //   128,
      //   255,
      //   // map(sin(time), -1, 1, 0, 100)
      // );
      // if (lerpIndex == lerpMin) {
      //   // stroke('blue')
      //   line(-width, 0, width, 0)
      //   line(0, -height, 0, height)
      //   string.write("end", 0, 0)
      // }
      // if (lerpIndex+lerpStep > lerpMax ) {
      //   // stroke('red')
      //   line(-width, 0, width, 0)
      //   line(0, -height, 0, height)
      //   string.write("start", 0, 0)
      // }

      //const shapeIndex = Math.ceil(map(lerpIndex, lerpMin, lerpMax, 0, options.get('quality'), true) );

      for (const fixer in fixers) {
        const { speed, index } = fixers[fixer];

        // fixers[fixer].index = Math.ceil(time*speed)%options.get('quality');
        fixers[fixer].index = Math.ceil(map(sin(time*speed), -1, 1, 0, options.get('quality'), true));
      }


      rotate(cos(lerpIndex*2-time*2)*options.get('rotation-speed')+lerpIndex*options.get('rotation-count'));
    },
    ( lerpIndex, lerpMin, lerpMax, time, index ) => {

      const opacitySpeed = options.get('opacity-speed');
      const opacityCount = options.get('opacity-group-count');

      let opacityFactor = mappers.circularMap(
        lerpIndex,
        // angleMin,
        lerpMax*4,
        map(
          sin(-time * opacitySpeed + lerpIndex * opacityCount ), -1, 1,
          options.get("start-opacity-factor"),
          options.get("end-opacity-factor")
        ),
        options.get("end-opacity-factor")
      );

      if (options.get('ping-pong-opacity')) {
        opacityFactor = map(
          map(sin(lerpIndex*opacityCount-time*opacitySpeed), -1, 1, -1, 1),
          -1,
          1,
          // map(sin(lerpIndex), -1, 1, 1, 50),
          map(cos(lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 1, 150),
          // 10,
          1
        );
      }
    
      let linesCount = options.get("max-lines-count");

      if (options.get("change-lines-count")) {
        linesCount = map(cos(lerpIndex/2-time), -1, 1, 1, options.get("max-lines-count"), true);
      }

      const c = map(sin(time+lerpIndex), -1, 1, -20, 20);

      const lc = mappers.circularIndex(time + c, [2, 5, 2, 3, 2, 4, 1])/3
      const lw = 1.5//mappers.circularIndex(time + c, [1.5, 2.5, 2, 1.5,])

      const lineMin = -PI;
      const lineMax = PI / mappers.circularIndex(c + time / 2 , [2, 1, 1, 1, 2]);
      let lineStep = lineMax / linesCount;
      //lineStep = lineMax / mappers.circularIndex(time, [2, 5, 3, 2, 4, 1]);

      const ll = options.get('lines-length');

      const s = mappers.circularMap(lerpIndex, lineMax, 0, ll)
      const z = options.get('regular-lines-length') ? lw : lc;

      const shapeIndex = Math.ceil( map(lerpIndex, lerpMin, lerpMax, 0, options.get('quality'), true) );

      let colorOn = shapeIndex < fixers?.["#8080ff"]?.index;

      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex,
          // s * 1.5,
          s * z 
        );

        push();
        beginShape();
        strokeWeight(mappers.circularMap(lerpIndex, lineMax, 10, options.get('lines-weight')));

        const hueSpeed = -time * options.get("hue-speed");

        if (options.get('hue-palette') === "rainbow") {
          stroke( color(
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
        
        if (colorOn || options.get('hue-palette') === "purple") {
          stroke( color(
            90 / opacityFactor,
            map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0) / opacityFactor,
            360 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }
        
        if (options.get('hue-palette') === "pink") {
          stroke( color(
            360 / opacityFactor,
            90 / opacityFactor,
            192 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        if (options.get('hue-palette') === "rainbow-trip") {
          stroke( color(
            map(cos(hueSpeed-lerpIndex*4), -1, 1, 360, 0)  / opacityFactor,
            map(sin(hueSpeed-lerpIndex*4), -1, 1, 128, 0)  / opacityFactor,
            90 / opacityFactor,
            mappers.circularMap(lerpIndex, lerpMax, 1, 255)
          ) );
        }

        const a = 1//map(sin(time * 2 + lerpIndex), -1, 1, -1, 1);
        const b = 1//map(cos(time + lerpIndex), -1, 1, -1, 1);

        if (shapeIndex == lerpIndex) {
          stroke('red');
          noFill();
          strokeWeight(10)
          circle(vector.x, vector.y, 50);
        }

        vertex(vector.y * a, vector.x * b);
        vertex(vector.y * a, vector.x) * b;

        // vertex(-vector.y, -vector.x);
        // vertex(vector.y, vector.x);
    
        endShape();
        pop()
      }
    },
    time,
    0
  )
});
