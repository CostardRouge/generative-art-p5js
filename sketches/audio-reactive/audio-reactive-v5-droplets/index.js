import { sketch, converters, audio, midi, events, animation, string, mappers, iterators, options, easing } from './utils/index.js';

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
    max: 20,
    defaultValue: 10,
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
    id: "background-lines-count",
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 70,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 4,
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

let name = ""
let margin = 200
let pixilatedCanvas;

events.register("pre-setup", () => {
  audio.capture.setup();
  // midi.setup();
})

sketch.setup( () => {
  pixilatedCanvas = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );
  pixilatedCanvas.pixelDensity(options.get("background-pixel-density"));
});

const easingFunctions = Object.entries( easing );

const drawRadialPattern = (count = 7, time, givenCanvas) => {
  givenCanvas.translate(width / 2, height / 2);

  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const hueSpeed = -time*5;
  const functionChangeSpeed = time;

  // string.write("easing", 0, -size-64, {
  //   // showBox: true,
  //   center: true,
  //   size: 255,
  //   stroke: 255,
  //   strokeWeight: 10,
  //   fill: 0,
  //   font: string.fonts.sans
  // })

  let c = Object.keys( midi.monitoring ).length || 5;

  iterators.angle(0, TAU, TAU / c, (angle, index) => {
    const edge = converters.polar.vector(
      angle,//*cos(time/2)+sin(time/2),
      size,
      size
    );

    name = "ease-----" //easingFunctionName;

    const one = map(cos(-time*2+index), -1, 1, 0.5, 3)
    let a = map(audio.capture.energy.byCircularIndex( index ), 0, 0.5, 0.5, 3)
    // a = 2*midi.byCircularIndex( index, "smooth" )+.5
    // a = map(sin(time+angle), -1, 1, 0.5, one)
    const extendedEdge = p5.Vector.lerp(center, edge, a);
    const center2 = p5.Vector.lerp(center, edge, 0.25);

    iterators.vector( extendedEdge, center2, 1 / 150, (vector, lerpIndex) => {
      const [ easingFunctionName, easingFunction ] = mappers.circularIndex( 2*functionChangeSpeed+angle*2+lerpIndex, easingFunctions);

      const hueIndex = angle+lerpIndex*15;
      const hueMaximum = 360;
      const hueMinimum = 0;

      const opacityFactor = 1.5;
      
      givenCanvas.stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor,
      ) );

      // givenCanvas.stroke( color(
      //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
      //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
      //   map(cos(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor,
      // ) );

      // givenCanvas.strokeWeight( mappers.fn(lerpIndex, 0, 1, 90, 10, easingFunction ) );
      // givenCanvas.strokeWeight( mappers.fn(lerpIndex, 0, 1, 100, 10 ) );
      // const p = map( sin(time+lerpIndex*10), -1, 1, 100, 10)
      givenCanvas.strokeWeight( map(sin(time+lerpIndex*10), 0, 1, 70, 10 ) );

      if (
        (vector.x < -width/2 + margin || vector.x > width/2 - margin) ||
        (vector.y < -height/2 + margin || vector.y > height/2 - margin)        
        ) {
        // givenCanvas.stroke( color(
        //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / 2,
        //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / 2,
        //   map(cos(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / 2
        // ) );

        // givenCanvas.circle(
        //   constrain( vector.x, -width/2 + margin, width/2 - margin ),
        //   constrain( vector.y, -height/2 + margin, height/2 - margin ),
        //   50
        // );
      }

      givenCanvas.point(
        constrain( vector.x, -width/2 + margin, width/2 - margin ),
        constrain( vector.y, -height/2 + margin, height/2 - margin )
      );

      // let p = map(lerpIndex, 0, 1, -PI, PI)/2;
      // p = map(sin(time+lerpIndex*midi.byCircularIndex( index, "smooth" )), -1, 1, -PI, PI);

      // givenCanvas.point(
      //   vector.x, vector.y
      // );

      // givenCanvas.point(
      //   vector.x * (sin(time+angle+lerpIndex)),
      //   vector.y * (cos(-time+angle+lerpIndex)),
      // );

      // givenCanvas.point(
      //   vector.x * abs(sin(time+p)),
      //   vector.y * abs(cos(time+p))
      // );
    })
  } )

  // string.write(name, 0, size+64/2 , {
  //   // showBox: true,
  //   center: true,
  //   size: 64,
  //   stroke: 0,
  //   strokeWeight: 10,
  //   fill: 255,
  //   // font: string.fonts.sans
  // })
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

  const offset = 0;
  const xx = xSize * sin(time + xSize )
  const yy = ySize * cos(time + ySize)

  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (yy + y * ySize) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);
    }
  }
}

sketch.draw((time) => {
  // background(0);
  background(
    lerpColor(
      color(0),
      color(128),
      midi.byCircularIndex( 1, "smooth" ) || audio.capture.energy.byCircularIndex( 1 )
    )
  );
  drawGrid(10, 6, -time );
  drawRadialPattern( 70, time, window);
});
