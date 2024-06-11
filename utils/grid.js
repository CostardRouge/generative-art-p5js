import { cache } from './index.js'

const grid = {
  create: ( {
    rows = 2,
    columns = 2,
    losange = false,
    centered = true,
    topLeft = createVector( 0, 0 ),
    topRight = createVector( width, 0 ),
    bottomLeft = createVector( 0, height ),
    bottomRight = createVector( width, height )
  }, cached = true ) => {
    const compute = () => {
      const cells = [];
      const cellWidth = p5.Vector.dist(topLeft, topRight) / columns;
      const cellHeight = p5.Vector.dist(topLeft, bottomLeft) / rows;

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          if (losange) {
            // Adjust cell size and position for losange (diamond-shaped) cells
            const halfDiagonal = cellWidth / sqrt(2);
            const x = topLeft.x + column * halfDiagonal * 2 + (row % 2) * halfDiagonal;
            const y = topLeft.y + row * halfDiagonal;
    
            cells.push({
              x,
              y,
              xIndex: column,
              yIndex: row,
              column,
              row,
              position: createVector(column, row),
              width: halfDiagonal * sqrt(2),
              height: halfDiagonal * sqrt(2)
            });
          }
          else {
            const x = lerp(topLeft.x, topRight.x, (column + 0) / columns);
            const y = lerp(topLeft.y, bottomLeft.y, (row + 0) / rows);
  
            cells.push({
              xIndex: column,
              yIndex: row,
              column,
              row,
              x,
              y,
              position: createVector(x, y),
              width: cellWidth + (centered ? cellWidth / 2 : 0),
              height: cellHeight + (centered ? cellHeight / 2 : 0),
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
      rows, columns, centered
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
    const vectors = grid.create( gridOptions );

    return ({
      vectors,
      draw: onGridCell => {
        vectors.forEach( ([ cellVector, x, y ], index ) => {
          onGridCell?.( cellVector, { x, y }, index )
        })
      }
    })
  },
  draw: ( gridOptions , handler ) => {
    const cachedGridVectors = grid.create( gridOptions );

    cachedGridVectors.forEach( ( [ cellVector, x, y ] ) => {
      handler(cellVector, { x, y })
    })

    return cachedGridVectors;
  }
};

export default grid;
