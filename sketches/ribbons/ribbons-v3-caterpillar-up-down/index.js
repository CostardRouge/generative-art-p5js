import { shapes, sketch, converters, canvas, events, colors, mappers, options, string } from './utils/index.js';

options.add( [
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 1200,
    defaultValue: 200,
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
    defaultValue: 8,
    category: 'Lines'
  },
  {
    id: "lines-length",
    type: 'slider',
    label: 'Lines length',
    min: 1,
    max: 100,
    defaultValue: 100,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 40,
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
  }
] );

sketch.setup(() => {});

function drawer( lerper, positioner, shaper, time, index ) {
  const [lerpMin, lerpMax, lerpStep] = lerper(time, index);

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; ) {
    push();
    positioner(lerpIndex, lerpMin, lerpMax, lerpStep, time, index);
    shaper(lerpIndex, lerpMin, lerpMax, time, index);
    pop();

    const x = converters.polar.get(sin, width/3, lerpIndex+time, 1);
    const y = converters.polar.get(cos, width/3, lerpIndex+time, 1);

    // if (lerpIndex+lerpStep > lerpMax ) {
    //   rotate(time)
    //   strokeWeight(4)
    //   stroke(
    //     128,
    //     128,
    //     255
    //   );
    //   string.write(Math.ceil(x).toString(), 25+x, -height/2 + 18, 32 )
    //   string.write(Math.ceil(y).toString(), -20+width / 2, y+18, 32 )

    //   string.write(`start`, x, y )
    //   string.write(`${Math.ceil(x)} / ${Math.ceil(y)}`, x, y )
    // }


    // if (lerpIndex == lerpMin) {
    //   rotate(time)
    //   strokeWeight(4)
    //   stroke(
    //     128,
    //     128,
    //     255
    //   );
    //   // string.write(Math.ceil(x).toString(), 25+x, -height/2 + 18, 32 )
    //   // string.write(Math.ceil(y).toString(), -20+width / 2, y+18, 32 )

    //   string.write("end", x, y, 24 )
    // }

    lerpIndex += lerpStep
  }
}

function drawGrid(xCount, yCount, time, color) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  strokeWeight(3)

  // stroke(
  //   128,
  //   128,
  //   255,
  //   // map(sin(time), -1, 1, 0, 100)
  // );

  stroke( color );

  const offset = 0;
  const xx = xSize * cos(time + xSize )
  const yy = ySize * sin(time + ySize)

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (yy + y * ySize) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

sketch.draw((time) => {
  background(0);

  // drawGrid(1, 1, time/4, color( 128, 128, 255));
  drawGrid(3, 3, time, color( 255, 5) );

  translate(width / 2, height / 2);

  drawer(
    ( time, index ) => {
      const lerpMin = 0//map(sin(time), -1, 1, -PI, 0, true);
      const lerpMax = PI//map(cos(time/2), -1, 1, TAU-0.3, 0);
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, lerpStep, time, index ) => {
      // translate(
      //   200 * sin(lerpIndex-time),
      //   350 * cos(lerpIndex-time)
      // );

      const a = map(sin(lerpIndex-time), -1, 1, 0, 1.5);

      translate(
        200 * sin(lerpIndex-time+a),
        map(lerpIndex, lerpMin, lerpMax, -height/2 + 50, height/2 - 50)
      );

      stroke(
        128,
        128,
        255,
        // map(sin(time), -1, 1, 0, 100)
      );
      if (lerpIndex == lerpMin) {
        // stroke('blue')
        line(-width, 0, width, 0)
        line(0, -height, 0, height)
        string.write("end", 0, 0)
      }
      if (lerpIndex+lerpStep > lerpMax ) {
        // stroke('red')
        line(-width, 0, width, 0)
        line(0, -height, 0, height)
        string.write("start", 0, 0)
      }

      rotate(sin(lerpIndex*2-time)*options.get('rotation-speed')+lerpIndex*2*options.get('rotation-count'));
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
        linesCount = map(cos(lerpIndex/2-time), 0, 1, 1, options.get("max-lines-count"), true);
      }

      const c = map(sin(time+lerpIndex), -1, 1, -20, 20);

      const lc = mappers.circularIndex(time + c, [2, 5, 2, 3, 2, 4, 1])/3
      const lw = mappers.circularIndex(time + c, [0, 1.5, 1.5, 1.5, 0, 0])

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;

      const s = mappers.circularMap(lerpIndex, lineMax, 0, options.get('lines-length'))
      const z = options.get('regular-lines-length') ? lw : lc;

      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex*1,
          // s * 1.5,
          // s * lc,
          s * z
        );

        push();
    
        beginShape();
        //strokeWeight(options.get("lines-weight"));
        strokeWeight(mappers.circularMap(lerpIndex, lineMax, 10, options.get('lines-weight')));

        const hueSpeed = -time * options.get("hue-speed");
    
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


        vertex(-vector.y, -vector.x);
        vertex(vector.y, vector.x);
    
        endShape();
        pop()
      }
    },
    time,
    0
  )
});
