// topLeft, topRight
// bottomLeft, bottomRight
// gap, cellHeight, cellWidth
// getRowsCount, rows
// getColumnCount, columns

import iterators from './iterators.js';

const grid = {
  draw: ({startLeft, startRight, endLeft, endRight, rows, cols}, handler) => {

    for (let y = 0; y < rows; y++) {
      
      for (let x = 0; x < cols; x++) {
        
      
      }
    }

    const startCenter = p5.Vector.lerp(startLeft, startRight, 0.5)
    const endCenter = p5.Vector.lerp(endLeft, endRight, 0.5)

    iterators.vector(startLeft, endLeft, 1 / rows, (left, rowsIndex) => {
      const right = p5.Vector.lerp(endLeft, endRight, 0.5);

      // console.log(rowsIndex);

      iterators.vector(left, right, 1 / cols, cellVector => {
       
  
        handler(cellVector)
  
  
      });

    });
  }
};

export default grid;
