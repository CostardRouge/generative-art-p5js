import { shapes, sketch, converters, events, colors, mappers, iterators, options, easing } from './utils/index.js';

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
    step: 0.1,
    label: 'Lines precision',
    defaultValue: 0.1,
    category: 'Background'
  },
] );

sketch.setup();

const drawRadialPattern = (count = 7, time, _color) => {
  noFill();
  strokeWeight(options.get("background-lines-weight"));

  const size = (width + height)/5;
  const position = createVector( 0, 0 );
  const p = options.get("background-lines-precision")
  const hueSpeed = time * options.get("hue-speed");

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle,
      size,
      size
    );

    const opacityFactor = mappers.circularMap(
      angle,
      TAU,
      map(
        sin(-time * options.get("opacity-speed") + angle * options.get("opacity-group-count") ), -1, 1,
        options.get("start-opacity-factor"),
        options.get("end-opacity-factor")
      ),
      options.get("end-opacity-factor")
    );

    beginShape();

    iterators.vector(edge, position, p, (vector, lerpIndex) => {
      stroke( color(
        map(sin(hueSpeed+angle+lerpIndex*5), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed-angle+lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
        map(sin(hueSpeed+angle+lerpIndex*5), -1, 1, 360, 0) / opacityFactor,
      ) );

      const pos = createVector(
        vector.x,// * (sin(time*2 + angle + lerpIndex) + 1.5),
        vector.y// * (cos(time - angle+ lerpIndex) + 1.5),
      );

      vertex( pos.x, pos.y );
    })

    endShape();
  } )
}

function fusilli(start, end, radius, weight, color) {
  strokeWeight(weight)
  stroke(color)
  beginShape( );
  iterators.vector(start, end, 0.1, ( position, lerpIndex ) => {
    vertex( position.x - radius, position.y );
    vertex( position.x + radius, position.y );

    // point( position.x - radius, position.y );
    // point( position.x + radius, position.y );
    // point( position.x, position.y );
    // rotate(rotation)
  });
  
  endShape();
}

function exp(time) {
  const vectors = [
    createVector(width / 2, 200 ),
    createVector(200, height / 2 ),
    createVector(width / 2, height - 200 ),
    createVector(width -200, height / 2 ),
    createVector(width / 2, 200 ),
  ]

  beginShape( );
  iterators.vectors(vectors, ( position, end, lerpIndex, totalStep, lerpStep ) => {
    // vertex( position.x, position.y );
    stroke('blue')
    // strokeWeight(50);
    // point( position.x, position.y );

    // stroke('red')
    // strokeWeight(100);
    // point( end.x, end.y );

    spring(
      position,
      end,
      1,
      400,
      time+lerpIndex,
      ( position, lerpIndex ) => {
        strokeWeight(20);
        point( position.x, position.y );
      },
      sin
    )
  });
  endShape();
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
    // map(cos(time), -1, 1, 0, 1),
    // map(mouseY, 0, height, 0, 1)
    fn(map(cos(time), -1, 1, 0, 1))
  );

  const springTop = createVector(springCenter.x, constrain( springCenter.y - halfLength, start.y, end.y ) );
  const springBottom = createVector(springCenter.x, constrain( springCenter.y + halfLength, start.y, end.y ) );

  // strokeWeight(50);


  // stroke('red');
  // point(start.x, start.y);

  // stroke('red');
  // point(end.x, end.y);


  // stroke('white');
  // point(springCenter.x, springCenter.y);

  // stroke('blue');
  // point(springTop.x, springTop.y);
  // point(springBottom.x, springBottom.y);

  iterators.vector(springTop, springBottom, 1 / amount, ( position, lerpIndex ) => {
    _drawer(position, lerpIndex)
  });
}

sketch.draw(time => {
  const hueSpeed = time * options.get("hue-speed");

  background(0);

  const columns = 7;
  const columnSize = width / columns;
  const halfColumnSize = (columnSize /2 );

  // strokeWeight(20);
  // exp(time);
  // return;

  for (let i = 0; i < columns; i++) {
    const x = ( i * columnSize ) + halfColumnSize;
    const top = createVector( x, 200);
    const bottom = createVector(x, height-200);

    spring(
      top,
      bottom,
      50,
      400,
      time+i,
      ( position, lerpIndex ) => {
        const opacityFactor = mappers.circularMap(
          i,
          columns,
          map(
            sin(-time * options.get("opacity-speed") + i * options.get("opacity-group-count") ), -1, 1,
            options.get("start-opacity-factor"),
            options.get("end-opacity-factor")
          ),
          options.get("end-opacity-factor")
        );
        const hueIndex = lerpIndex+i
        stroke(
          map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
          map(cos(hueSpeed-hueIndex), -1, 1, 360, 0) / opacityFactor,
          map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
        )

        strokeWeight(20);
        point( position.x, position.y );
      },
      easing.easeInOutElastic
    )
  }
});
