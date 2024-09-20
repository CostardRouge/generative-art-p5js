import { cache } from './index.js'

const grid = {
  create: ( {
    rows = 2,
    columns = 2,
    diamond = false,
    topLeft = createVector( 0, 0 ),
    topRight = createVector( width, 0 ),
    bottomLeft = createVector( 0, height ),
    bottomRight = createVector( width, height )
  }, cached = true ) => {
    const compute = () => {
      const baseCellWidth = p5.Vector.dist(topLeft, topRight) / columns;
      const baseCellHeight = p5.Vector.dist(topLeft, bottomLeft) / rows;
    
      const cellWidth = diamond ? baseCellWidth / sqrt(2) : baseCellWidth;
      const cellHeight = diamond ? baseCellWidth / sqrt(2) : baseCellHeight;

      const halfDiagonal = baseCellWidth / (2);
    
      const cells = [];
      
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const corners = [];
          const x = topLeft.x + column * baseCellWidth;
          const y = topLeft.y + row * baseCellHeight;
        
          if (diamond) {
            corners.push(createVector(0, -halfDiagonal)); // top
            corners.push(createVector(halfDiagonal, 0)); // right
            corners.push(createVector(0, halfDiagonal)); // bottom
            corners.push(createVector(-halfDiagonal, 0)); // left
          } else {
            corners.push(createVector(0, 0));
            corners.push(createVector(cellWidth, 0));
            corners.push(createVector(cellWidth, cellHeight));
            corners.push(createVector(0, cellHeight));
          }

          cells.push({
            center: (
              diamond ?
              createVector(x + halfDiagonal, y + halfDiagonal) :
              createVector(x + cellWidth / 2, y + cellHeight / 2)
            ),
            absoluteCorners: corners.map( corner => corner.copy().add(x, y) ),
            position: createVector(x, y),
            height: cellHeight,
            width: cellWidth,
            xIndex: column,
            yIndex: row,
            corners,
            column,
            row,
            x,
            y
          });

          if (diamond && row < rows - 1 && column < columns - 1) {
            const corners = [
              createVector(0, -halfDiagonal), // top
              createVector(halfDiagonal, 0), // right
              createVector(0, halfDiagonal), // bottom
              createVector(-halfDiagonal, 0) // left
            ];
  
            cells.push({
              // position: createVector(x + halfDiagonal, y + halfDiagonal),
              center: createVector(x + halfDiagonal * 2, y + halfDiagonal * 2),
              absoluteCorners: corners.map( corner => corner.copy().add(x, y) ),
              corners,
              height: cellHeight,
              width: cellWidth,
              xIndex: column+.5,
              yIndex: row+.5,
              column: column+.5,
              row: row+.5,
              x: x + halfDiagonal,
              y: y + halfDiagonal
            });
          }
        }
      }

      const corners = { topLeft, topRight, bottomLeft, bottomRight };

      return { cells, corners, cellWidth, cellHeight };
    };

    if (false === cached) {
      return compute();
    }

    const cacheKey = cache.key(
      topLeft.x, topRight.x, bottomLeft.x, bottomRight.x,
      topLeft.y, topRight.y, bottomLeft.y, bottomRight.y,
      rows, columns, diamond
    );

    return cache.store(cacheKey, compute);
  },
  debug: ( gridOptions, cells, corners ) => {
    // Draw grid corners
    stroke(255, 0, 0);
    strokeWeight(10);
    point(corners.topLeft.x, corners.topLeft.y);
    point(corners.topRight.x, corners.topRight.y);
    point(corners.bottomLeft.x, corners.bottomLeft.y);
    point(corners.bottomRight.x, corners.bottomRight.y);
    
    // Draw grid lines
    stroke(0);
    strokeWeight(1);
    for (let row = 0; row < gridOptions.rows + 1; row++) {
      let startX = lerp(corners.topLeft.x, corners.bottomLeft.x, row / gridOptions.rows);
      let startY = lerp(corners.topLeft.y, corners.bottomLeft.y, row / gridOptions.rows);
      let endX = lerp(corners.topRight.x, corners.bottomRight.x, row / gridOptions.rows);
      let endY = lerp(corners.topRight.y, corners.bottomRight.y, row / gridOptions.rows);
      line(startX, startY, endX, endY);
    }
    for (let col = 0; col < gridOptions.columns + 1; col++) {
      let startX = lerp(corners.topLeft.x, corners.topRight.x, col / gridOptions.columns);
      let startY = lerp(corners.topLeft.y, corners.topRight.y, col / gridOptions.columns);
      let endX = lerp(corners.bottomLeft.x, corners.bottomRight.x, col / gridOptions.columns);
      let endY = lerp(corners.bottomLeft.y, corners.bottomRight.y, col / gridOptions.columns);
      line(startX, startY, endX, endY);
    }
    
    // Draw grid cells as dots
    stroke(0, 0, 255);
    strokeWeight(5);
    for (let cell of cells) {
      point(cell.x, cell.y);
    }
  },
  prepare: ( gridOptions ) => {
    const { cells } = grid.create( gridOptions );

    return ({
      cells,
      draw: onGridCell => {
        cells.forEach( ({ position, x, y }, index ) => {
          onGridCell?.( position, { x, y }, index )
        })
      }
    })
  },
  draw: ( gridOptions , handler ) => {
    const { cells } = grid.create( gridOptions );

    cells.forEach( ({ position, x, y } ) => {
      handler( position, { x, y })
    })

    return cells;
  }
};

export default grid;
