import {
  sketch,
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
  audio.capture.setup(0, 2048);
  events.register("post-draw", audio.capture.energy.recordHistory);
});

sketch.setup(undefined, { type: "webgl" });

sketch.draw((time, center) => {
  background(0);
  const columns = 40;
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

    const energy = audio.capture.energy.map(x / (columns - 1), y / (rows - 1));

    const hue = noise(xOff / 4, yOff / 4 + time / 2);
    const d = mappers.fn(energy, 0, 1, 20, 500);

    const tint = colors.rainbow({
      // hueOffset: time,
      // hueIndex: map(hue, 0, 1, -PI, PI),
      hueIndex: map(energy, 0, 1, -PI, PI) * 2,
      // opacityFactor: 15,
      // opacityFactor: mappers.fn(d, 20, 500, 2.5, 1, easing.easeInOutExpo),
    });

    const {
      levels: [red, green, blue],
    } = tint;

    // const alpha = mappers.fn(sin(time-yOff), -1, 1, 0, 255, easing.easeInOutExpo)
    // const alpha = mappers.fn(d, 20, 500, 200, 360, easing.easeInOutExpo);

    stroke(0);
    strokeWeight(1);
    fill(red, green, blue, 210);
    stroke(red, green, blue);

    const w = cellSize - 10;
    const h = cellSize - 10;

    push();
    translate(position.x, position.y, d / 2);

    //box(w, h, d);
    pop();
  });

  push();
  translate(-width / 2, -height / 2);
  audio.capture.energy.draw(true, true);

  pop();

  orbitControl();
});
