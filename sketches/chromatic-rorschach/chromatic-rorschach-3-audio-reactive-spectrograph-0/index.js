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

}, { type: "webgl" });

const circular = (v, min, max, from, to) => map(cos(map(v, min, max, -PI, PI)), -1, 1, from, to)

let clickCount = 0;

events.register("engine-mouse-pressed", () => {
  console.log(clickCount++);
});

sketch.draw((time, center) => {
  background(0);
  translate(0, 0, -500);

  strokeWeight(2)

  // rotateX(mappers.circularIndex(time/3, [ 0, PI/2, -PI/2, PI/6, -PI ]))
  rotateX(mappers.circularIndex(clickCount, [ 0, PI/6, -PI, PI/2, -PI/2 ]))
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

  // const cols = 30;
  // const cols = mappers.circularIndex(time, [10, 10, 20, 20, 30, 30, 40, 40]);

  const c = audio.capture.energy.byIndex( 0, "count" )

  const cols = mappers.circularIndex(c, [ 20, 30, 40]);
  // const cols = ~~mappers.fn(audio.capture.audioIn.getLevel(), 0, 1, 20, 50);
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

  grid.draw(gridOptions, (position, { x, y }) => {
    const xOff = position.x / rows;
    const yOff = position.y / cols;


    // const energy = audio.capture.energy.map(x / (cols + 2), y / (rows - 1));

    // const normalizedX = mappers.circular(x, 0, cols-1, 0, 1, easing.easeInOutCubic)
    // const normalizedY = mappers.circular(y, 0, rows-1, 0, 1)

    const normalizedX = circular(x, 0, cols-1, 1, 0, easing.easeInOutCubic)
    const normalizedY = circular(y, 0, rows-1, 1, 0)

    const capture = audio.capture.energy.map(normalizedX, normalizedY);
    const energy = capture.next().value;
    const binIndex = capture.next().value;
    const historyBufferIndex = capture.next().value;

    // console.log(binIndex, historyBufferIndex);

    let d = mappers.fn(energy, 0, 1, 20, 400)
    
    // d *= noise(historyBufferIndex, binIndex, energy+time/2);


    const tint = colors.rainbow({
      hueOffset: time,
      hueIndex: map(energy, 0, 1, -PI, PI)*3,
      // hueIndex: map(energy, 0, 1, -PI/2, PI/2),
      // hueIndex: mappers.circular(energy, 0, 1, -PI, PI) * 3,
      hueIndex: map(noise(binIndex, historyBufferIndex, energy+time/4), 0, 1, -PI, PI) * 3,
      // hueIndex: map(noise(xOff/50, yOff/50, d/400), 0, 1, -PI, PI) * 3,
      // hueIndex: map(noise(xOff, yOff, energy+time/4), 0, 1, -PI/2, PI/2),
      // opacityFactor: 15,
      opacityFactor: mappers.fn(d, 20, 400, 2.5, 1, easing.easeOutCubic),
    });

    // const {
    //   levels: [red, green, blue],
    // } = tint;

    // const alpha = mappers.fn(sin(time-yOff), -1, 1, 0, 255, easing.easeInOutExpo)
    // const alpha = mappers.fn(d, 20, 500, 200, 360, easing.easeInOutExpo);

    //fill(red, green, blue, 210);
    //stroke(red, green, blue);


    // strokeWeight(1);
    // stroke(255);
    // fill(0)

    // // stroke(tint)
    // const hue = color(
    //   map(x, 0, cols-1, 0, 255),
    //   map(y, 0, rows-1, 0, 255),
    //   map(energy, 0, 1, 0, 255),

    //   // map(d, 20, 500, 0, 255),
    //   // mappers.fn(y, 0, rows-1, 64, 255, easing.easeInOutSine),
    //   // mappers.fn(d, 20, 500, 64, 255, easing.easeInOutExpo),
    // )

    // stroke(hue)

    const gap = 0;
    const w = cellSize - gap;
    const h = cellSize - gap;

    push();
    translate(position.x, position.y, 0);

    if (!energy) {

      audio.capture.energy.byName( "bass" )
      //audio.capture.audioIn.getLevel()

      const high = mappers.fn(sin(c*y/5+x/10*x/10+time), -1, 1, 0, 75, easing.easeInOutExpo)

      translate(0, 0, high)

      noFill();
      stroke(0, 255, 255)
      rect(-w/2, -h/2, w, h)
    }
    else {
      translate(0, 0, d / 2);
      stroke(0,0, 255, 0);
      fill(tint)
        noStroke()


      // if (noise(xOff/2, yOff/2, c) > 0.5) {
      //   // fill(0)
      //   stroke(255, 255, 0)
      //   noStroke()

      // }
      box(w, h, d);
    }

    pop();
  });

  push();
  translate(-width / 2, -height / 2);
  //audio.capture.energy.draw(true, true);

  pop();

  orbitControl();
});
