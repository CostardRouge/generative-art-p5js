// https://editor.p5js.org/mncorp971/sketches/jMsuUsLOy

const count = 20;
const margin = 15;
const timeShift = 2;

import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {});

sketch.draw((time) => {
  background(0);

  noFill();
  stroke(255);
  strokeWeight(3);
  beginShape();

  for (let i = 0; i < count; i++) {
    const t = map(i, 0, count - 1, time, time * timeShift);
    const x = constrain(sin(t) * width * 2, margin, width - margin * i);
    const y = constrain(cos(t) * height * 2, margin, height - margin * i);

    circle(x, y, 30);
    vertex(x, y);
  }
  stroke(255);

  endShape();

});
