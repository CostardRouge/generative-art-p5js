import { canvas, sketch, converters, events, audio, animation, string, mappers, iterators, options, easing } from './utils/index.js';

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

events.register("post-setup", audio.capture.setup);
sketch.setup();

const drawRadialPattern = (count = 7, time, givenCanvas) => {
  givenCanvas.translate(width / 2, height / 2);

  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const hueSpeed = time;
  const functionChangeSpeed = time;
  const easingFunctions = Object.entries( easing );

  // string.write("easing", 0, -size-64, {
  //   // showBox: true,
  //   center: true,
  //   size: 255,
  //   stroke: 255,
  //   strokeWeight: 10,
  //   fill: 0,
  //   font: string.fonts.sans
  // })

  iterators.angle(0, TAU, TAU / 16, (angle, index) => {
    const edge = converters.polar.vector(
      angle+time/3,//*cos(time/2)+sin(time/2),
      size,
      size
    );

    name = "ease-----" //easingFunctionName;

    const a = map(cos(-time*2+index), -1, 1, 0.5, 3)
    const b = map(audio.capture.energy.byCircularIndex( index ), 0, 0.5, 0.5, 3)
    const edgeLimit = map(sin(index), -1, 1, 1, a)
    const extendedEdge = p5.Vector.lerp(center, edge, b);

    // const b = map(sin(time/2+index), -1, 1, 0.5, 1)
    // const rr = p5.Vector.lerp(center, edge, b);

    iterators.vector(center, extendedEdge, 1 / 200, (vector, lerpIndex) => {
      const [ easingFunctionName, easingFunction ] = mappers.circularIndex( functionChangeSpeed+angle/20+lerpIndex*2*cos(time), easingFunctions);
      
      const hueIndex = angle+lerpIndex*10;
      const hueMaximum = 360;
      const hueMinimum = 0;

      const opacityFactor = 1.5;
      
      givenCanvas.stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(cos(hueSpeed-hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor
      ) );

      // stroke( color(
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(cos(hueSpeed-hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum, easingFunction) / opacityFactor,
      //   map(lerpIndex, 0, 1, 255, 0),
      // ) );

      givenCanvas.strokeWeight(
        mappers.fn(lerpIndex, 0, 1, 60, 10 )
      );

      givenCanvas.point(
        constrain( vector.x, -width/2 + margin, width/2 - margin ),
        constrain( vector.y, -height/2 + margin, height/2 - margin )
      );
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

const pattern = (count = 7, time, color) => {
  push()
  translate(width /2, height /2 )

  noFill();
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));

  const center = animation.sequence(
    "bg-center-position",
    // time, 
    audio.capture.energy.byName( rangeName, "count" ),
    // 0,
    [
      createVector( -width / 4, -height / 4 ),
      createVector( width / 4, -height / 4 ),
      // createVector( 0, 0 ),
      createVector( width / 4, height / 4 ),
      createVector( -width / 4, height / 4 ),
      // createVector( 0, 0 )
    ],
    0.67,
    p5.Vector.lerp
  )
  const size = (width + height);

  const p = 0.01//options.get("background-lines-precision");

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector( angle, size );

    beginShape();

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      

      // if (
      //   (vector.x > 0 && vector.x <= -width/2 + margin) &&
      //   (vector.y > 0 && vector.y <= -height/2 + margin)
      // ) {
      //   vertex(
      //     vector.x,
      //     vector.y
      //   );
      // }

      // vertex(
      //   constrain( vector.x, -width/2, width/2 - margin ),
      //   constrain( vector.y, -height/2 + margin, height/2 - margin )
      // );


      vertex(vector.x, vector.y);
    })

    endShape();
  } )
  pop()
}

const rangeName = "upperMid";

sketch.draw((time) => {
  background(0);

  background(
    lerpColor(
      color(0),
      color(128),
      audio.capture.energy.byName( rangeName )
      // audio.capture.energy.byIndex( 4, "count" )
    )
  );

  // console.log(audio.capture.energy.byCircularIndex( 3 ));

  pattern(
    options.get("background-lines-count"),
    time,
    color( 128, 128, 255, 96)
  );

  drawRadialPattern( 70, time, window);

  console.log(">>", audio.capture.energy.byName( rangeName , "count" ))
});
