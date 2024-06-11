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
  translate(0, 0, -350);

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

  // const columns = animation.ease({
  //   values: [ 20, 40 ],
  //   currentTime: time/6,
  //   duration: 1,
  //   easingFn: easing.easeInOutExpo
  // });

  const columns = 44;
  // const columns = mappers.circularIndex(time, [10, 10, 20, 20, 30, 30, 40, 40]);
  const rows = (columns * height) / width;
  const cellSize = width / columns;

  const gridOptions = {
    topLeft: createVector(-width / 2, -height / 2),
    topRight: createVector(width / 2, -height / 2),
    bottomLeft: createVector(-width / 2, height / 2),
    bottomRight: createVector(width / 2, height / 2),
    rows,
    columns,
    centered: true,
  };

  // console.log(mappers.circular(50, 0, 100, 0, 1));

  grid.draw(gridOptions, (position, { x, y }) => {
    const xOff = position.x / rows;
    const yOff = position.y / columns;

    // const energy = audio.capture.energy.map(x / (columns + 2), y / (rows - 1));

    // const normalizedX = mappers.circular(x, 0, columns-1, 0, 1, easing.easeInOutCubic)
    // const normalizedY = mappers.circular(y, 0, rows-1, 0, 1)

    const normalizedX = circular(x, 0, columns-1, 1, 0, easing.easeInOutExpo)
    const normalizedY = circular(y, 0, rows-1, 1, 0)

    // const xx = map(sin(time/2), -1, 1, normalizedX, normalizedY).toFixed(2)
    // const yy = map(cos(time/2), -1, 1, normalizedX, normalizedY).toFixed(2)


    // const yyy = [ normalizedY,  normalizedY,normalizedY, normalizedY ]
    // const xxx = [ normalizedX, normalizedX, normalizedX,normalizedX ]

    // const xx = animation.ease({
    //   values: [ ...xxx, ...yyy ],
    //   currentTime: time,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo
    // });

    // const yy = animation.ease({
    //   values: [ ...yyy, ...xxx ],
    //   currentTime: time,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo
    // });

    // const capture = audio.capture.energy.map(normalizedX, map(normalizedY, 0, 1, 1, 0));
    // const capture = audio.capture.energy.map(normalizedX, normalizedY);

    // const capture = audio.capture.energy.map(normalizedY, normalizedX);
    const capture = audio.capture.energy.map(normalizedY, map(normalizedX, 0, 1, 1, 0));
    // const capture = audio.capture.energy.map(xx, yy);
    // const capture = audio.capture.energy.map(xx, map(yy, 0, 1, 1, 0));
    const energy = capture.next().value;
    const binIndex = capture.next().value;
    const historyBufferIndex = capture.next().value;

    // console.log(binIndex, historyBufferIndex);

    const d = mappers.fn(energy, 0, 1, 20, 400, easing.easeOutCubic)
    

    const hueChance = noise(xOff*0.5, yOff*0.5, time);

    const colorFunction = mappers.circularIndex(hueChance, [
      colors.rainbow,
      // colors.purple,
      // colors.test
    ]);

    const tint = colorFunction({
      hueOffset: time,
      // hueOffset: audio.capture.energy.byIndex( 0, "count" ),
      // hueIndex: map(energy, 0, 1, -PI, PI)*2,
      // hueIndex: map(energy, 0, 1, -PI/2, PI/2),
      // hueIndex: mappers.circular(energy, 0, 1, -PI, PI) * 3,
      // hueIndex: map(noise(binIndex, historyBufferIndex, energy+time/4), 0, 1, -PI, PI) * 3,
      hueIndex: map(noise(xOff/5, yOff/10, d/400), 0, 1, -PI, PI) * 2,
      // hueIndex: map(noise(xOff/5, yOff/10, energy+time/4), 0, 1, -PI/2, PI/2)*2,
      // opacityFactor: 15,
      opacityFactor: mappers.fn(d, 20, 400, 5, 1, easing.easeOutCubic),
    });

    const {
      levels: [red, green, blue],
    } = tint;

    const gap = 0;
    const w = cellSize - gap;
    const h = cellSize - gap;

    push();
    translate(position.x, position.y, 0);

    if (!energy) {
      // stroke(255, 0, 255)

      const bassCount = audio.capture.energy.byIndex( 1, "count" )
      const audioLevel = audio.capture.audioIn.getLevel()
      const coefficient = 0.5//mappers.circularIndex(audio.capture.energy.byName( "mid", "count" ), [0.5, 0.1]);
      const chance = noise(xOff*coefficient, yOff*coefficient, bassCount);
      const strokeColor = mappers.circularIndex(chance+time/2, [
        // color(255, 255, 0),
        color(0, 255, 255),
        // color(255, 0, 255)
      ]);

      if (chance > 0.5) {
        fill(0)
        stroke(strokeColor)
        rect(-w/2, -h/2, w, h)
      }
    }
    else {
      translate(0, 0, d / 2-1);
      fill(red-10, green-10, blue-10)
      stroke(tint);

      //noStroke()

      box(w, h, d);
    }

    pop();
  });

  push();
  translate(-width / 2, -height / 2);
  //audio.capture.energy.draw(true, true);

  pop();

  // orbitControl();
});
