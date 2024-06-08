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

sketch.setup(undefined, { type: "webgl" });

let z = 0;

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

  noiseDetail(40, 0.3);

  // if (frameRate()) {
  //   z -= 250/frameRate();
  // }

  grid.draw(gridOptions, (position) => {
    const vector = createVector(position.x, position.y);
    const xOff = position.x / rows;
    const yOff = position.y / columns;
    const rotateAngle = PI / 6;
    const n = 9;
    const hue = noise(xOff / 4, yOff / 4 + time / 2);

    let d = mappers.fn(
      // noise(position.x/columns/10+position.y/rows/10+time/2),
      noise(xOff / n, yOff / n, hue / 2 + time / 2),
      //hue/2,
      0,
      1,
      20,
      mappers.fn(sin(time + hue), -1, 1, 150, 500, easing.easeInOutExpo),
      easing.easeInOutBack,
      easing.easeInOutExpo
      // easing.easeInOutCirc,
      // easing.easeInOutQuad,
    );

    const maxDistance = (width + height) / 2;

    d = mappers.fn(
      vector.dist(center),
      0,
      mappers.fn(
        cos(
          time * 2 +
            + (xOff / n) * (yOff / n)
            + hue
        ),
        -1,
        1,
        0,
        maxDistance,
        // easing.easeInOutExpo,
        // easing.easeInOutElastic,
        easing.easeInOutCubic
      ),
      20,
      500,
      easing.easeInOutExpo
    );

    // const d = animation.ease({
    //   values: [0, 500, 1000, 1500, 2000, 2500],
    //   // values: [0, 500],
    //   currentTime: time,
    //   duration: 1,
    //   easingFn: easing.easeInOutExpo,
    // });

    // const d = mappers.fn(hue, 0, 1, 20, 500, easing.easeInOutExpo);

    const tint = colors.rainbow({
      // hueOffset: time,
      hueIndex: map(hue, 0, 1, -PI, PI) * 2,
      opacityFactor: 1.5,
      opacityFactor: mappers.fn(d, 20, 500, 1.5, 1, easing.easeInOutExpo),
    });

    const {
      levels: [red, green, blue],
    } = tint;

    // const alpha = mappers.fn(sin(time-yOff), -1, 1, 0, 255, easing.easeInOutExpo)
    // const alpha = mappers.fn(d, 20, 500, 200, 360, easing.easeInOutExpo);

    // noStroke()
    stroke(0);
    strokeWeight(1);
    fill(
      red,
      green,
      blue,
      210
      //mappers.fn(d, 20, 500, 20, 210, easing.easeInOutExpo)
      // mappers.fn(sin(time - yOff / n), -1, 1, 0, 210, easing.easeInOutExpo)

      // 210
      // mappers.fn(sin(time - yOff / n), -1, 1, 0, 255, easing.easeInOutExpo)
      // alpha-10
    );
    stroke(
      red,
      green,
      blue,
      210
      // mappers.fn(sin(time-yOff/n), -1, 1, 0, 255, easing.easeInOutExpo),
      // mappers.fn(sin(time + xOff / n), -1, 1, 0, 255, easing.easeInOutExpo)
      // mappers.fn(alpha, 200, 360, 20, 10, easing.easeInOutExpo),
      //mappers.fn(d, 20, 500, 20, 10, easing.easeInOutExpo)
    );

    const w = cellSize - 10;
    const h = cellSize - 10;

    push();
    translate(position.x, position.y, d / 2 + z);

    // rotateX(
    //   mappers.fn(
    //     cos(time + xOff / n),
    //     -1,
    //     1,
    //     -rotateAngle,
    //     rotateAngle,
    //     easing.easeInOutExpo
    //   )
    // );
    // rotateY(
    //   mappers.fn(
    //     sin(time - yOff / n),
    //     -1,
    //     1,
    //     -rotateAngle,
    //     rotateAngle,
    //     easing.easeInOutExpo
    //   )
    // );

    box(w, h, d / 2);
    pop();
  });

  orbitControl();
});
