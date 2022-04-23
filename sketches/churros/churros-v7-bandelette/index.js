import { shapes, sketch, converters, canvas, events, colors, mappers, options } from './utils/index.js';

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
    defaultValue: 90,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 70,
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
    defaultValue: 4,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 10,
    defaultValue: 5,
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

  for (let lerpIndex = lerpMin; lerpIndex <= lerpMax; lerpIndex += lerpStep) {
    push();
    positioner(lerpIndex, lerpMin, lerpMax, time, index);
    shaper(lerpIndex, lerpMin, lerpMax, time, index);
    pop();
  }
}

function churro(time) {
  // const angleMin = 0//map(sin(time), -1, 1, PI*1.5, 0);
  const angleMax = map(cos(time), -1, 1, 0.5, PI);
  const angleMin = -map(cos(time), -1, 1, 0.5, PI);
  const angleStep = angleMax / options.get('quality');

  rotate(-time)
  
  for (let angle = angleMin; ( angle <= angleMax-1); angle += angleStep) {
    
    // rotate(radians(cos(time+(angle)*2)*sin(time+angle*2)*1));
    // rotate(radians(cos(time-(angle)*2)*sin(time/3-angle*2)*1));
    
    push();
    // translate(converters.polar.vector(angle, width/3, height/3));
    // translate(
    //   converters.polar.get(sin, width/10, angle, map(sin(time/3), -1, 1, -3, 3)),
    //   converters.polar.get(cos, height/7, angle, map(cos(time/3), -1, 1, 2, -2))
    // );

    translate(
      converters.polar.get(sin, width/4, angle, 1),
      converters.polar.get(cos, height/4, angle, 1)
    );

    rotate(time*options.get('rotation-speed')+angle*angle/2*options.get('rotation-count'));

    const opacitySpeed = options.get('opacity-speed');
    const opacityCount = options.get('opacity-group-count');

    let opacityFactor;
    
    // map(
    //   angle,
    //   angleMin,
    //   angleMax,
    //   map(
    //     sin(-time * opacitySpeed + angle * opacityCount ), -1, 1,
    //     options.get("start-opacity-factor"),
    //     options.get("start-opacity-factor") * 10
    //   ),
    //   options.get("end-opacity-factor")
    // );

    opacityFactor = mappers.circularMap(
      angle,
      // angleMin,
      angleMax*4,
      map(
        sin(-time * opacitySpeed + angle * opacityCount ), -1, 1,
        options.get("start-opacity-factor"),
        options.get("end-opacity-factor")
      ),
      options.get("end-opacity-factor")
    );

    if (options.get('ping-pong-opacity')) {
      opacityFactor = map(
        map(sin(angle*opacityCount-time*opacitySpeed), -1, 1, -1, 1),
        -1,
        1,
        // map(sin(angle/2), -1, 1, 1, 500),
        map(cos(angle*opacityCount+time*opacitySpeed), -1, 1, 1, 15),
        // 10,
        1
      );
    }

    // opacityFactor = 1
  
    let linesCount = options.get("max-lines-count");

    if (options.get("change-lines-count")) {
      linesCount = map(cos(angle*1+time), -1, 1, 1, options.get("max-lines-count"));
    }

    const lineMin = 0;
    const lineMax = TAU;
    const lineStep = lineMax / linesCount;
  
    for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
      const vector = converters.polar.vector(
        angle-lineIndex,
        options.get('lines-length'),
        // map(sin(angle*2+time*2), -1, 1, 1, options.get('lines-length'), true)
      );
      push();
  
      beginShape();
      strokeWeight(options.get("lines-weight"));

      const hueSpeed = -time * options.get("hue-speed");
  
      stroke(
        color(
          map(sin(hueSpeed+angle), -1, 1, 0, 360) /
            opacityFactor,
          map(sin(hueSpeed-angle*2.5), -1, 1, 360, 0) /
            opacityFactor,
          map(sin(hueSpeed+angle), -1, 1, 360, 0) /
            opacityFactor,
            // 50
        )
      );
      
      // vertex(vector.x, -vector.x);
      // vertex(vector.y, -vector.x);

      vertex(vector.x, vector.y);
      vertex(-vector.x, -vector.y);
  
      endShape();
      pop();
    }

    pop()
  }
}

function drawGrid(xCount, yCount, time) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  strokeWeight(3)

  stroke(
    128,
    128,
    255,
    // map(sin(time), -1, 1, 0, 100)
  );

  // stroke(
  //   color(
  //     map(sin(time), -1, 1, 0, 360) /
  //       1,
  //     map(sin(time*10), -1, 1, 360, 0) /
  //       1,
  //     map(sin(time), -1, 1, 360, 0) /
  //       1,
  //       // 50
  //   )
  // );

  const offset = -10;
  const xx = xSize/2//xSize * sin(time + xSize )
  const yy = ySize * cos( time ) * 3

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (y * ySize + yy) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

sketch.draw((time) => {
  background(0);

  // drawGrid(map(sin(time/10), -1, 1, 1, 3), map(cos(time/10), -1, 1, 1, 7), time);
  drawGrid(6, 8, time );

  // translate(width / 2, height / 2);
  // churro(time);

  drawer(
    ( time, index ) => {
      const margin = 0;
      const lerpMin = 0//margin-map(sin(time), -1, 1, 0.5, PI);
      const lerpMax = PI//margin+map(sin(time), -1, 1, 0.5, PI);
      const lerpStep = lerpMax / options.get('quality');
    
      return [lerpMin, lerpMax, lerpStep];
    },
    ( lerpIndex, lerpMin, lerpMax, time, index ) => {
      // translate(
      //   converters.polar.get(sin, width/4, lerpIndex, 2),
      //   converters.polar.get(cos, height/3, lerpIndex, 1)
      // );

      translate(
        p5.Vector.fromAngle(lerpIndex, 200).x,
        p5.Vector.fromAngle(lerpIndex, 200).y
      );

      const l = map(cos(lerpIndex-time), -1, 1, 0, 3, true);

      translate(
        map(sin(-lerpIndex*-2.5+time*2), -1, 1, width/2-200, width/2+200),
        // width/2,
        // map(lerpIndex, lerpMin, lerpMax, map(cos(time), -1, 1, 300, height-300*2), map(sin(time), -1, 1, 150*2, height-150)),
        map(lerpIndex, lerpMin, lerpMax, 150, height-150)
      );


      rotate(degrees(80));

      // rotate(cos(time+lerpIndex*l*2)+options.get('rotation-speed')+lerpIndex*options.get('rotation-count'));
      // rotate(cos(time+lerpIndex*l*2)+options.get('rotation-speed')+lerspIndex*options.get('rotation-count'));
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
          map(cos(lerpIndex*opacityCount+time*opacitySpeed), -1, 1, 1, 10),
          // 10,
          1
        );
      }
    
      let linesCount = options.get("max-lines-count");

      if (options.get("change-lines-count")) {
        linesCount = map(cos(lerpIndex/2-time*3), 0, 1, 1, options.get("max-lines-count"), true);
      }

      const lineMin = 0;
      const lineMax = PI;
      const lineStep = lineMax / linesCount;

    
      for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
        const vector = converters.polar.vector(
          lineIndex*5,
          options.get('lines-length'),
          // map(sin(lerpIndex*2+time*2), -1, 1, 1, options.get('lines-length'), true)
          );
        push();
    
        beginShape();
        strokeWeight(options.get("lines-weight"));

        const hueSpeed = -time * options.get("hue-speed");
    
        stroke(
          color(
            map(sin(hueSpeed-lerpIndex*5), -1, 1, 0, 360) /
              opacityFactor,
            map(sin(hueSpeed+lerpIndex*5), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueSpeed-lerpIndex*5), -1, 1, 360, 0) /
              opacityFactor,
              // 50
          )
        );
      
        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);
    
        endShape();
        pop()
      }
    },
    time,
    0
  )

  // shapes.forEach((shape, index) => shape.draw(time, index));
});
