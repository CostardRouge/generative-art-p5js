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
  audio.capture.setup(0.95, 1024);
  events.register("post-draw", audio.capture.energy.recordHistory);
});

sketch.setup(undefined, { type: "webgl" });

sketch.draw((time, center) => {
  background(0);
  translate(0, 0, -500);

  const columns = 20;
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

  grid.draw(gridOptions, (position, { x, y }) => {
    const xOff = position.x / rows;
    const yOff = position.y / columns;

    // const energy = audio.capture.energy.map(x / (columns + 2), y / (rows - 1));
    const capture = audio.capture.energy.map(x / (columns + 2), y / (rows - 1));
    const energy = capture.next().value;
    const binIndex = capture.next().value;
    const historyBufferIndex = capture.next().value;

    // console.log(binIndex, historyBufferIndex);

    let d = mappers.fn(energy, 0, 1, 20, 500)
    
    d *= noise(historyBufferIndex, binIndex, energy+time/2);

    const tint = colors.rainbow({
      // hueOffset: time,
      // hueIndex: map(hue, 0, 1, -PI, PI),
      //hueIndex: map(energy, 0, 1, -PI, PI) * 2,
      hueIndex: map(noise(binIndex, historyBufferIndex, energy+time/10), 0, 1, -PI, PI) * 5,
      // opacityFactor: 15,
      // opacityFactor: mappers.fn(d, 20, 500, 2.5, 1, easing.easeInOutExpo),
    });

    // const {
    //   levels: [red, green, blue],
    // } = tint;

    // const alpha = mappers.fn(sin(time-yOff), -1, 1, 0, 255, easing.easeInOutExpo)
    // const alpha = mappers.fn(d, 20, 500, 200, 360, easing.easeInOutExpo);

    stroke(tint);
    fill(0)

    //fill(red, green, blue, 210);
    //stroke(red, green, blue);


    // strokeWeight(1);
    // stroke(255);
    // fill(0)

    // // stroke(tint)
    // const hue = color(
    //   map(x, 0, columns-1, 0, 255),
    //   map(y, 0, rows-1, 0, 255),
    //   map(energy, 0, 1, 0, 255),

    //   // map(d, 20, 500, 0, 255),
    //   // mappers.fn(y, 0, rows-1, 64, 255, easing.easeInOutSine),
    //   // mappers.fn(d, 20, 500, 64, 255, easing.easeInOutExpo),
    // )

    // stroke(hue)


    const gap = 1;
    const w = cellSize - gap;
    const h = cellSize - gap;

    push();
    translate(position.x, position.y, d / 2);

    box(w, h, d);
    pop();
  });

  push();
  translate(-width / 2, -height / 2);
  //audio.capture.energy.draw(true, true);

  pop();

  orbitControl();
});
