import { shapes, sketch, converters, canvas, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "x-coefficient",
    type: 'slider',
    label: 'X coefficient',
    min: 1,
    max: 10,
    defaultValue: 1,
    category: 'Shape'
  },
  {
    id: "y-coefficient",
    type: 'slider',
    label: 'y coefficient',
    min: 1,
    max: 10,
    defaultValue: 1,
    category: 'Shape'
  },
  {
    id: "quality",
    type: 'number',
    label: 'Quality',
    min: 1,
    max: 800,
    defaultValue: 500,
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
    defaultValue: 3,
    category: 'Lines'
  },
  {
    id: "lines-length",
    type: 'slider',
    label: 'Lines length',
    min: 1,
    max: 100,
    defaultValue: 50,
    category: 'Lines'
  },
  {
    id: "lines-weight",
    type: 'slider',
    label: 'Lines weight',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 20,
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

function churro(time) {
  const angleMin = 0;
  const angleMax = TAU-0.3;
  const angleStep = angleMax / options.get('quality');
  
  for (let angle = angleMin; angle <= angleMax; angle += angleStep) {
    
    // rotate(radians(time/10));
    
    push();
    // translate(converters.polar.vector(angle+time, width/3));
    // translate(
    //   converters.polar.get(sin, width/3, angle, map(cos(time/3), -1, 1, 1, 2)),
    //   converters.polar.get(cos, height/3, angle, map(sin(time/3), -1, 1, 3, 1))
    // );

    translate(
      converters.polar.get(sin, width/3, angle, options.get('x-coefficient')),
      converters.polar.get(cos, height/3, angle, options.get('y-coefficient'))
    );

    rotate(time*options.get('rotation-speed')+angle*options.get('rotation-count'));

    const opacitySpeed = options.get('opacity-speed');
    const opacityCount = options.get('opacity-group-count');

    let opacityFactor = map(
      angle,
      angleMin,
      angleMax,
      map(
        sin(-time * opacitySpeed + angle * opacityCount ), -1, 1,
        options.get("start-opacity-factor"),
        options.get("start-opacity-factor") * 10
      ),
      options.get("end-opacity-factor")
    );

    opacityFactor = mappers.circularMap(
      angle,
      // angleMin,
      angleMax*4,
      map(
        sin(-time * opacitySpeed + angle * opacityCount ), -1, 1,
        options.get("start-opacity-factor"),
        options.get("start-opacity-factor") * 5
      ),
      options.get("end-opacity-factor")
    );

    if (options.get('ping-pong-opacity')) {
      opacityFactor = map(
        map(sin(angle*opacityCount-time*opacitySpeed), -1, 1, -1, 1),
        -1,
        1,
        // map(sin(angle/2), -1, 1, 1, 500),
        map(cos(angle*opacityCount+time*opacitySpeed), -1, 1, 1, 50),
        // 10,
        1
      );
    }

    // opacityFactor = 1
  
    let linesCount = options.get("max-lines-count");

    if (options.get("change-lines-count")) {
      linesCount = map(cos(time*2), -1, 1, 1, options.get("max-lines-count"));
    }

    const lineMin = 0;
    const lineMax = TAU;
    const lineStep = lineMax / linesCount;
  
    for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
      const vector = converters.polar.vector(
        angle+lineIndex,
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
          map(sin(hueSpeed-angle), -1, 1, 360, 0) /
            opacityFactor,
          map(sin(hueSpeed+angle), -1, 1, 360, 0) /
            opacityFactor,
            // 50
        )
      );

      // line(-vector.x, vector.y, vector.x, -vector.y);
      // line(-vector.x, vector.y, vector.x, -vector.y);
      // line(vector.x, vector.y, 0, 0, );
      
      vertex(vector.x, vector.y);
      vertex(-vector.x, -vector.y);
  
      endShape();
      pop();
    }

    pop()
  }
}

sketch.draw((time) => {
  background(0);

  translate(width / 2, height / 2);
  churro(time);

  // shapes.forEach((shape, index) => shape.draw(time, index));
});
