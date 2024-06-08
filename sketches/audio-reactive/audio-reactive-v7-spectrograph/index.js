import {
  events,
  sketch,
  audio,
  grid,
  colors,
  options
} from "./utils/index.js";

options.add([
  {
    id: "grid-rows",
    type: "slider",
    label: "Rows",
    min: 1,
    max: 200,
    defaultValue: 40,
    category: "Grid",
  },
  {
    id: "grid-cols",
    type: "slider",
    label: "Cols",
    min: 1,
    max: 200,
    defaultValue: 40,
    category: "Grid",
  },
  {
    id: "grid-cell-centered",
    type: "switch",
    label: "Centered cell",
    defaultValue: true,
    category: "Grid",
  },
]);

events.register("post-setup", () => {
  audio.capture.setup(0, 512)
  events.register("post-draw", audio.capture.energy.recordHistory);
});
sketch.setup();

sketch.draw((time) => {
  background(0);

  const rows = options.get("grid-rows");
  const cols = options.get("grid-cols");

  const gridOptions = {
    startLeft: createVector(0, 0),
    startRight: createVector(width, 0),
    endLeft: createVector(0, height),
    endRight: createVector(width, height),
    rows,
    cols,
    centered: options.get("grid-cell-centered"),
  };

  const cellSize = (width + height) / (cols + rows);

  noFill();

  grid.draw(gridOptions, (cellVector, { x, y }) => {
    const energy = audio.capture.energy.map(x / (cols - 1), y / (rows - 1));

    push();
    translate(cellVector.x, cellVector.y);

    stroke(
      colors.rainbow({
        hueOffset: 0,
        hueIndex: map(energy, 0, 1, -PI / 2, PI / 2),
        opacityFactor: map(energy, 0, 1, 3, 1),
      })
    );

    strokeWeight(energy * cellSize);
    point(0, 0);

    pop();
  });

  //audio.capture.energy.draw()
});
