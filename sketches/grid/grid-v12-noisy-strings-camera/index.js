import { events, sketch, debug, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 260,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 16,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  }
] );

let cameraPosition = undefined;

sketch.setup((center) => {
  //direction = center;

  console.log(sketch.camera);

  cameraPosition = createVector(
    sketch.camera.eyeX,
    sketch.camera.eyeY,
    sketch.camera.eyeZ,
    sketch.camera.centerX,
    sketch.camera.centerY,
    sketch.camera.centerZ,
    sketch.camera.upX,
    sketch.camera.upY,
    sketch.camera.upZ
  );

  console.log(sketch.camera);
  // sketch.camera.tilt(-0.5);
  // sketch.camera.ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 500);
  // sketch.camera.frustum(-0.1, 0.1, -0.1, 0.1, 0.1, 2000);
  // sketch.camera.frustum(-width/2, width/2, -height/2, height/2, 0, max(width, height));

}, { type: 'webgl' });

events.register("post-setup", () => {
  //audio.capture.setup(0.2, 2048)
});

// events.register("pre-draw", () => {
//   // const movement = {
//   //   LEFT_ARROW: -0.01,
//   //   RIGHT_ARROW: 0.01,
//   //   UP_ARROW: 0.01,
//   //   DOWN_ARROW: -0.01
//   // }

//   const movement = {
//     x: [
//       LEFT_ARROW, RIGHT_ARROW
//     ],
//     y: 5,
//     pan: [100, 102, 10],
//     tilt: [104, 98, 10],
//   }


//   if (keyIsDown(104)) {
//     sketch.camera.pan(-0.01);

//     // cameraPosition.x -= cameraSpeed

//     // sketch.camera.centerX -= cameraSpeed

//     // sketch.camera.move( -cameraSpeed, 0, 0 )
//   } else if (keyIsDown(RIGHT_ARROW)) {
//     sketch.camera.pan(0.01);

//     // sketch.camera.centerX += cameraSpeed

//     // sketch.camera.move( cameraSpeed, 0, 0 )

//     // cameraPosition.x += cameraSpeed
//   }

//   if (keyIsDown(UP_ARROW)) {
//     sketch.camera.tilt(0.01);

//     // cameraPosition.y -= cameraSpeed

//     // sketch.camera.move( 0, -cameraSpeed, 0 )

//   } else if (keyIsDown(DOWN_ARROW)) {
//     sketch.camera.tilt(-0.01);

//     // cameraPosition.y += cameraSpeed

//     // sketch.camera.move( 0, cameraSpeed, 0 )
//   }

//   // cameraPosition.add(

//   // )
  


//   // background(150);


//   debug.webgl();


//   if (frameCount % 100 === 0) {
//     //delta *= -1;
//   }

//   orbitControl();

//   //sketch.camera.setPosition( cameraPosition.x, cameraPosition.y, cameraPosition.z )

//   if (frameCount % 60 === 0) {
//     //sketch.camera.lookAt(0, -560, random(-500, 500));
//   }

//   normalMaterial()
//   rotateY(PI/3);
//   box(50);
//   translate(0, 60, 0);
//   box(50);
//   translate(0, 60, 0);
//   box(50);
//   translate(0, 60, 0);
//   box(50);
//   translate(0, 60, 0);
//   box(50);
//   translate(0, 60, 0);
//   box(50);
//   translate(0, 60, 0);
//   box(50);

//   return;
// });



sketch.draw((time) => {
  background(0);

  rotateX(radians(30))
  // rotateZ(time/5)

  const rows = options.get("grid-rows")
  const cols = options.get("grid-cols")

  const W = ( width / 2 ) * 3.5;
  const H = ( height / 2 ) * 8;
  const D = ( height / 2 ) * -5;

  const gridOptions = {
    startLeft: createVector( -W, -H, D ),
    startRight: createVector( W, -H, D ),
    endLeft: createVector( -W, H, D ),
    endRight: createVector( W, H, D ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  const scale = (width / cols);
  const zMax = scale * 5;

  // noiseDetail(8, 0.3)
  normalMaterial()

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/cols;
    const yOff = y/rows;
    const angle = noise(xOff, yOff+time/8, time/10) * (TAU*4);
    const z = zMax * cos(angle);

    const weight = map(z, -zMax, zMax, 10, 100 );
    const colorFunction = mappers.circularIndex(noise(yOff, xOff, time)+time, [colors.rainbow,colors.purple])
    // const colorFunction = mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI),
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      opacityFactor: map(sin(time+angle*2), -1, 1, 3, 1)
    }))

    push();

    translate( cellVector.x, cellVector.y, cellVector.z );
    translate(scale * sin(angle)*2, scale * cos(angle)*2, z*noise(xOff)*36 )
    strokeWeight(weight);
    point( 0, 0);
    // sphere( weight );

    pop();
  });

});
