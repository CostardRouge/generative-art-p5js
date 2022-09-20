// topLeft, topRight
// bottomLeft, bottomRight
// gap, cellHeight, cellWidth
// getRowsCount, rows
// getColumnCount, columns

import iterators from './iterators.js';

const grid = {
  draw: ({startLeft, startRight, endLeft, endRight, rows, cols, centered = true }, handler) => {
    const yUnit = 1 / rows;
    const xUnit = 1 / cols;

    const yOffset = centered ? yUnit/2 : 0;
    const xOffset = centered ? xUnit/2 : 0;
    const yEnd = centered ? rows - 0.5 : rows;

    for (let y = 0; y < yEnd; y++) {
      // const left = p5.Vector.lerp(startLeft, endLeft, (y * yUnit));
      const leftWithOffset = p5.Vector.lerp(startLeft, endLeft, (y * yUnit) + yOffset);

      // const right = p5.Vector.lerp(startRight, endRight, (y * yUnit));
      const rightWithOffset = p5.Vector.lerp(startRight, endRight, (y * yUnit) + yOffset);

      // stroke("red")
      // strokeWeight(50)
      // point(left.x, left.y)
      // point(leftWithOffset.x, leftWithOffset.y)
      // point(right.x, right.y)
      // point(rightWithOffset.x, rightWithOffset.y)

      for (let x = 0; x < cols; x++) {
        const cellVector = p5.Vector.lerp(leftWithOffset, rightWithOffset, (x * xUnit) + xOffset);

        // stroke("blue")
        // strokeWeight(50)
        // point(cellVector.x, cellVector.y)
        handler(cellVector, { x, y })
      }
    }
  }
};

export default grid;
