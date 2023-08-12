import {
  sketch,
  audio,
  options,
  iterators,
  converters,
  debug,
  events,
  string,
  mappers,
  easing,
  animation,
  colors,
  cache,
  grid,
} from "./utils/index.js";

events.register("post-setup", () => {
  audio.capture.setup(0.85, 4096);
  events.register("post-draw", audio.capture.energy.recordHistory);
});

sketch.setup(() => {
  // pixelDensity(1);

  // noLoop()

}, { type: "webgl" });

const circular = (v, min, max, from, to) => map(cos(map(v, min, max, -PI, PI)), -1, 1, from, to)

let clickCount = 0;

events.register("engine-mouse-pressed", () => {
  console.log(clickCount++);
});

sketch.draw((time, center) => {
  background(0);
  // translate(0, 0, -500);

  strokeWeight(2)

  // rotateX(mappers.circularIndex(time/3, [ 0, PI/2, -PI/2, PI/6, -PI ]))
  // rotateX(mappers.circularIndex(clickCount, [ 0, PI/6, -PI, PI/2, -PI/2 ]))
  //rotateZ(mappers.circularIndex(time/6, [ 0, PI/2, -PI]))


  // rotateX(animation.ease({
  //   values: [ 0, 0, PI/2, PI/2, -PI/2, -PI/2, PI/6, PI/6, -PI, -PI ],
  //   currentTime: time/3,
  //   duration: 1,
  //   easingFn: easing.easeInOutExpo
  // }));

  // const cols = animation.ease({
  //   values: [ 20, 40 ],
  //   currentTime: time/6,
  //   duration: 1,
  //   easingFn: easing.easeInOutExpo
  // });

  const cols = 30;
  // const cols = mappers.circularIndex(time, [10, 10, 20, 20, 30, 30, 40, 40]);
  const rows = (cols * height) / width;
  const cellSize = width / cols;

  const gridOptions = {
    startLeft: createVector(-width / 2, -height / 2),
    startRight: createVector(width / 2, -height / 2),
    endLeft: createVector(-width / 2, height / 2),
    endRight: createVector(width / 2, height / 2),
    rows,
    cols,
    centered: true,
  };

  // console.log(mappers.circular(50, 0, 100, 0, 1));


  stroke("red")
  strokeWeight(2)

  sphere(0, 0)
  rotateX(-PI/8)

  const c = 6

  // for (let i = 0; i < c; i++) {
  //   // const angle = map(i, 0, c, -PI, PI);
  //   const angle = lerp(-PI, PI, i/c);

  //   const from = createVector(0, 0, 0)
  //   const to = createVector( sin(angle) * 100, 0, cos(angle) * 100 );

  //   // // LINES
  //   // stroke("red");
  //   // line(0, 0, 0, to.x, to.y, to.z);

  //   // stroke("blue");
  //   // box(10, 10, 10);

  //   const direction = p5.Vector.sub(from, to);
  //   const distance = direction.mag();

  //   const center = p5.Vector.add(from, direction.mult(0.5));

  //   push(); 

  //   translate(center);
  //   rotateY(angle); 

  //   box(20, 20, distance);

  //   pop(); 
  // }

  grid.draw(gridOptions, (position, { x, y }) => {
    const xOff = position.x / rows;
    const yOff = position.y / cols;


    // const energy = audio.capture.energy.map(x / (cols + 2), y / (rows - 1));

    // const normalizedX = mappers.circular(x, 0, cols-1, 0, 1, easing.easeInOutCubic)
    // const normalizedY = mappers.circular(y, 0, rows-1, 0, 1)

    const normalizedX = circular(x, 0, cols-1, 1, 0, easing.easeInOutCubic)
    const normalizedY = circular(y, 0, rows-1, 1, 0)

    // const capture = audio.capture.energy.map(normalizedX, normalizedY);
    const capture = audio.capture.energy.map(x / (cols +2), y / (rows - 1));
    const energy = capture.next().value;
    const binIndex = capture.next().value;
    const historyBufferIndex = capture.next().value;

    // console.log(binIndex, historyBufferIndex);

    let d = mappers.fn(energy, 0, 1, 20, 400)
    
    // d *= noise(historyBufferIndex, binIndex, energy+time/2);


    const tint = colors.rainbow({
      // hueOffset: time,
      hueIndex: map(energy, 0, 1, -PI, PI)*3,
      // hueIndex: map(energy, 0, 1, -PI/2, PI/2),
      // hueIndex: mappers.circular(energy, 0, 1, -PI, PI) * 3,
      // hueIndex: map(noise(binIndex, historyBufferIndex, energy+time/4), 0, 1, -PI, PI) * 3,
      // hueIndex: map(noise(xOff/50, yOff/50, d/400), 0, 1, -PI, PI) * 3,
      // hueIndex: map(noise(xOff, yOff, energy+time/4), 0, 1, -PI/2, PI/2),
      // opacityFactor: 15,
      opacityFactor: mappers.fn(d, 20, 400, 2.5, 1, easing.easeOutCubic),
    });

    const gap = 1;
    const w = cellSize// - gap;
    const h = cellSize  * (height / width )// - gap;

    push();
    translate(position.x, position.y, -500);


    if (!energy) {
      // stroke(255, 0, 255)

      // audio.capture.energy.byName( "bass" )
      //audio.capture.audioIn.getLevel()
      const c = audio.capture.energy.byIndex( 4, "count" )


      if (noise(xOff/2, yOff/2, c) > 0.5) {
        fill(0)
        stroke(255, 255, 0)
      // stroke(0, 255, 255)
        rect(-w/2, -h/2, w, h)
      }
      
    }
    else {
      // translate(0, 0, d / 2);
      // // stroke(0,0, 255, 0);

      // stroke(tint)
      // fill(tint)

      // box(w, h, d);
    }

    pop(); 

    // translate(position.x, position.y, 0)

    const angle = map(x, 0, cols-1, -PI, PI);
    const from = createVector(0, position.y+250, -500)
    const to = createVector( sin(angle) * 250, 0, (cos(angle) * 250 ) -500 );

    const direction = p5.Vector.sub(from, to);
    const distance = direction.mag();

    const center = p5.Vector.add(from, direction.mult(0.5));

    push();
    translate(center);

    rotateY(angle); 

      if (energy) {
        stroke(0)
        noStroke()
        
        fill(tint)
        box(w, h, d);
      }
      else {
        noFill()
        stroke(255, 128, 128)
        // rect(-w/2, -h/2, w, h)
      }

    pop();
  });

  // push();
  // translate(-width / 2, -height / 2);
  // audio.capture.energy.draw(true, true);
  // pop();

  orbitControl();
});
