import { events, sketch, converters, audio, animation, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

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
  {
    id: "audio-reactive-midi",
    type: 'switch',
    label: 'Use MIDI',
    defaultValue: false,
    category: 'Audio reactive'
  },
] );

let margin = 200
let pixilatedCanvas;

events.register("post-setup", () => {
  audio.capture.setup()
  midi.setup()
});
sketch.setup();

const drawRadialPattern = (time, givenCanvas) => {
  givenCanvas.translate(width / 2, height / 2);

  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const hueSpeed = -time*5

  let count = 16//Object.keys( audio.capture.ranges ).length || 16;

  if (options.get("audio-reactive-midi")) {
    count = Object.keys( midi.monitoring).length;
  }

  iterators.angle(0, TAU, TAU / count, (angle, index) => {
    const edge = converters.polar.vector(
      angle+time/3,//*cos(time/2)+sin(time/2),
      size,
      size
    );

    let b = map(audio.capture.energy.byCircularIndex( index ), 0, 0.5, 0.5, audio.capture.energy.average()*2 )

    if (options.get("audio-reactive-midi")) {
      b = map(midi.byCircularIndex( index, "smooth" ), 0, 1, 0.5, 1)
    }

    const extendedEdge = p5.Vector.lerp(center, edge, b);

    iterators.vector(center, extendedEdge, 1 / 200, (vector, lerpIndex) => {
      givenCanvas.stroke( colors.rainbow({
        hueIndex: angle+lerpIndex*10,
        hueOffset: hueSpeed,
        opacityFactor: 1.5
      }) );

      givenCanvas.stroke( colors.darkBlueYellow({
        hueIndex: angle+lerpIndex*10,
        hueOffset: hueSpeed,
        opacityFactor: 1.5
      }) );

      givenCanvas.strokeWeight( mappers.fn(lerpIndex, 0, 1, 60, 10 ) );

      givenCanvas.point(
        constrain( vector.x, -width/2 + margin, width/2 - margin ),
        constrain( vector.y, -height/2 + margin, height/2 - margin )
      );
    })
  } )
}

const pattern = (count = 7, time, color) => {
  push()
  translate(width /2, height /2 )

  noFill();
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));

  const margin2 = margin / 2;
  const center = createVector( 0, 0 );
  const size = (width + height);

  const p = options.get("background-lines-precision");

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector( angle-time/5, size );

    beginShape();
    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      vertex(
        constrain( vector.x, -width/2 + margin2, width/2 - margin2 ),
        constrain( vector.y, -height/2 + margin2, height/2 - margin2 )
      );
    })
    endShape();
  } )
  pop()
}

sketch.draw((time) => {
  background(0);

  let bgc = map(sin(time/2), -1, 1, 40, 50, true)
  bgc = options.get("background-lines-count")

  push()
  pattern(
    bgc,
    time,
    lerpColor(
      color( 0 ),
      color( 128, 128, 255, 96),
      // audio.capture.energy.average(),
      // map(
      //   audio.capture.energy.average( ),
      //   0, 0.9, 0.5, 1, true
      // )
      map(
        audio.capture.energy.byIndex(4, "raw"),
        0.5, 1, 0.1, 1, true
      )
      
    )
  );

  // console.log(audio.capture.energy.byIndex(1, "raw"));

  drawRadialPattern( time, window);
  pop()

  const start = createVector( margin, height-120)
  const end = createVector( width-margin, height-120)
  const squareSize = 50;
  const pointColorOffset = -50;

  const rangeNames = Object.keys( audio.capture.ranges );
  
  rangeNames.forEach( (rangeName, index) => {
    const vector = p5.Vector.lerp(start, end, index / rangeNames.length );
    const energy = audio.capture.energy.byIndex( index, "raw");

    const cc = colors.darkBlueYellow({
      hueIndex: map(index, 0, rangeNames.length-1, -PI/2, PI/2),
      opacityFactor: map(energy, 0, 1, 2, 1, true)
    })

    // fill( cc );

    noStroke()
    noFill()
    // strokeCap(SQUARE);
    // stroke(color( 128, 128, 255, 96))
    strokeWeight(0)
    fill(cc)
    rect( vector.x, vector.y, squareSize, squareSize)

    // fill(color( cc.levels[0] + pointColorOffset, cc.levels[1] + pointColorOffset, cc.levels[2] + pointColorOffset))

    const y = map(energy, 0, 1, squareSize, 0)

    // circle(
    //   vector.x + squareSize / 2,
    //   vector.y + y,
    //   squareSize-5
    // )

    strokeWeight(20)

    stroke(color( cc.levels[0] + pointColorOffset, cc.levels[1] + pointColorOffset, cc.levels[2] + pointColorOffset))
    point(
      vector.x + squareSize / 2,
      vector.y + y
    )

    // line(
    //   vector.x,
    //   vector.y + y,
    //   vector.x + 50,
    //   vector.y + y
    // )
  })

});
