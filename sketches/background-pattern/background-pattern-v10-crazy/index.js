import { shapes, sketch, converters, canvas, events, colors, mappers, iterators, options, string } from './utils/index.js';

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
] );

sketch.setup();

const pattern = (count = 7, time, color) => {
  push()
  stroke(color);
  strokeWeight(options.get("background-lines-weight"));
  translate(width /2, height /2 )

  const center = createVector( 0, 0 );
  const size = (width + height);

  const p = 0.1//map(sin(time*2), -1, 1, 0.1, 0.9);

  iterators.angle(0, TAU, TAU / count, angle => {
    const edge = converters.polar.vector(
      angle - time/4,
      size,
      // size * (sin(time + angle*2)),
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
const boundary = 80;

function drawBoundaries() {

  // line(boundary, boundary, width -boundary, boundary);boundary
  // line(boundary, height-boundary, width -boundary, height-boundary);
  // line(boundary, boundary, boundary, height-boundary);
  // line(width -boundary, boundary, width -boundary, height-boundary);

  fill(0, 0, 0, 128)
  stroke(128, 128, 255, 128)

  beginShape()
  vertex(boundary, boundary);
  vertex(width -boundary, boundary);
  vertex(width -boundary, height-boundary);
  vertex(boundary, height-boundary);
  endShape(CLOSE)
}

const drawRadialPattern = (count = 7, time) => {
  noFill();

  const opacitySpeed = options.get('opacity-speed');
  const opacityCount = options.get('opacity-group-count');

  const center = createVector( 0, 0 );
  const size = (width + height)/6.5;
  const p = 0.0025
  const hueSpeed = 2*time;

  iterators.angle(0, TAU, TAU / 20, angle => {
    const edge = converters.polar.vector(
      angle,//+time,
      size// * (sin(time + angle*2)),
    );

    const opacityFactor = mappers.circularMap(
      angle,
      TAU,
      map(
        sin(-time * opacitySpeed + angle * opacityCount ), -1, 1,
        options.get("start-opacity-factor"),
        options.get("end-opacity-factor")
      ),
      options.get("end-opacity-factor")
    )

    beginShape();

    iterators.vector(edge, center, p, (vector, lerpIndex) => {
      let hueIndex = angle+lerpIndex * map(sin(time), -1, 1, -5, 5);
      hueIndex = angle+lerpIndex * 15;

      // const colors = [
      //     color(
      //       map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
      //       map(sin(hueSpeed-hueIndex), -1, 1, 360, 0) / opacityFactor,
      //       map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
      //       mappers.circularMap(lerpIndex, 1, 1, 255)
      //     ),
      //     color(
      //       90 / opacityFactor,
      //       map(sin(hueSpeed-hueIndex), -1, 1, 128, 0) / opacityFactor,
      //       360 / opacityFactor,
      //       mappers.circularMap(lerpIndex, 1, 1, 255)
      //     ),
      //     color(
      //       360 / opacityFactor,
      //       90 / opacityFactor,
      //       192 / opacityFactor,
      //       mappers.circularMap(lerpIndex, 1, 1, 255)
      //     ),
      //     color(
      //       map(cos(hueSpeed-hueIndex), -1, 1, 360, 0)  / opacityFactor,
      //       map(sin(hueSpeed-hueIndex), -1, 1, 128, 0)  / opacityFactor,
      //       90 / opacityFactor,
      //       mappers.circularMap(lerpIndex, 1, 1, 255)
      //     ),
      //     color(
      //       255  / opacityFactor,
      //       225  / opacityFactor,
      //       0 / opacityFactor,
      //       mappers.circularMap(lerpIndex, 1, 1, 255)
      //     ),
      //     color(
      //       360 / opacityFactor,
      //       32 / opacityFactor,
      //       64 / opacityFactor,
      //       mappers.circularMap(lerpIndex, 1, 1, 255)
      //     )
      //   ];

      //   const switchSpeed = time/2 + angle+lerpIndex*5;

      //   let cc = mappers.circularIndex(switchSpeed, colors)

      // stroke( cc );


      stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(cos(-hueSpeed+hueIndex), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) / opacityFactor,
      ) );

      const cX = map(sin(time+0), -1, 1, 1, 3);
      const cY = map(cos(time+lerpIndex), -1, 1, 1, 3);

      let pos = createVector(
        vector.x * abs(sin(time+cX + 0 + lerpIndex)),
        vector.y * abs(cos(time+cY + 0 + lerpIndex)),
      );

      // pos = createVector(
      //   vector.x * abs(sin(time+cX + angle - lerpIndex)),
      //   vector.y * abs(cos(time-cY - angle + lerpIndex)),
      // );


      // pos = createVector(
      //   vector.x * (sin(time+cX + angle + 0)),
      //   vector.y * (cos(time+cY + angle + 0)),
      // );

      // pos = createVector(
      //   vector.x * abs(sin(time+cX + angle + lerpIndex)),
      //   vector.y * abs(cos(time-cY + angle + lerpIndex)),
      // );

      // pos = createVector(
      //   vector.x * abs(sin(time + angle + 0)),
      //   vector.y * abs(cos(time + angle + 0)),
      // );

      // pos = createVector(
      //   vector.x * abs((sin(time - angle + lerpIndex))),
      //   vector.y * abs(tan(cos(time - angle + lerpIndex))),
      // );

      // pos = createVector(
      //   vector.y * tan(sin(time + angle + lerpIndex)),
      //   vector.y * tan(cos(time + angle + lerpIndex)),
      // );

      pos = createVector(
        vector.x * (sin(time + angle - lerpIndex) + 1.5),
        vector.y * tan(cos(time - angle + lerpIndex) + 0.2),
      );

      // pos = createVector(
      //   vector.x * (sin(time + angle + lerpIndex*2)),
      //   vector.y * (cos(time - angle + lerpIndex/2)),
      // );

      // pos = createVector(
      //   vector.x,
      //   vector.y
      // );


      // strokeWeight(map(lerpIndex, 0, 1, 70, 0));
      // strokeWeight(map(lerpIndex, 0, map(sin(-time+angle+lerpIndex ), -1, 1, 0.1, 0.5), 70, 0));
      // strokeWeight(abs(map(sin(2*time+angle), -1, 1, 30, -30)));
      // strokeWeight(abs(map(sin(lerpIndex*5), -1, 1, -50*f,50*f)));
      // strokeWeight(abs(map(lerpIndex, 0, 1, 10, 40*f)));
      // strokeWeight(abs(map(sin(5*time+angle/5*lerpIndex*20), -1, 1, 10, 40)));
      // point( pos.x, pos.y );

      const f = map(lerpIndex, 1, 0, 0, 2);

      strokeWeight(map(sin(lerpIndex*10), -1, 1, 10, 50*f));
      point(
        constrain(pos.x, - width/2 + boundary, width/2 - boundary),
        constrain(pos.y, -height/2 + boundary, height/2 - boundary),
      );

      vertex( 
        constrain(pos.x, - width/2 + boundary, width/2 - boundary),
        constrain(pos.y, -height/2 + boundary, height/2 - boundary),
      );
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      // if (
      //   (pos.x > (-width/2 + boundary) && pos.x < (width/2 - boundary) ) &&
      //   (pos.y > (-height/2 + boundary) && pos.y < (height/2 - boundary) )
      //   ) {
      //     // point(
      //     //   constrain(pos.x, - width/2 + boundary, width/2 - boundary),
      //     //   constrain(pos.y, -height/2 + boundary, height/2 - boundary),
      //     // );
  
      //     // vertex( 
      //     //   constrain(pos.x, - width/2 + boundary, width/2 - boundary),
      //     //   constrain(pos.y, -height/2 + boundary, height/2 - boundary),
      //     // );
      // }
      // else {
      //   stroke(128, 128, 255, 4)
      //   point( pos.x, pos.y );
      //   // vertex( pos.x, pos.y );
      // }

    })
    // stroke(128, 128, 255, 128)
    strokeWeight(3)
    endShape();
  } )
}

sketch.draw((time) => {
  background(0);

  pattern(
    options.get("background-lines-count"),
    -time/4,
    color( 128, 128, 255, 64)
  );

  drawBoundaries()

  translate(width / 2, height / 2);
  drawRadialPattern(
    100,
    time
  );
});
