import { cache } from './index.js'

const grid = {
  create: ( {
    rows = 2,
    columns = 2,
    diamond = false,
    centered = true,
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
    
      const cells = [];
      
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = topLeft.x + column * baseCellWidth;
          const y = topLeft.y + row * baseCellHeight;
          const halfDiagonal = baseCellWidth / (2);
          const corners = [];
        
          if (diamond) {
            corners.push(createVector(x + halfDiagonal, y)); // top
            corners.push(createVector(x + halfDiagonal * 2, y + halfDiagonal)); // right
            corners.push(createVector(x + halfDiagonal, y + halfDiagonal * 2)); // bottom
            corners.push(createVector(x, y + halfDiagonal)); // left
          } else {
            corners.push(createVector(x, y));
            corners.push(createVector(x + cellWidth, y));
            corners.push(createVector(x + cellWidth, y + cellHeight));
            corners.push(createVector(x, y + cellHeight));
          }

          const center = diamond ?
            createVector(x + halfDiagonal, y + halfDiagonal) :
            createVector(x + cellWidth / 2, y + cellHeight / 2);
    
          cells.push({
            center,
            position: createVector(x, y),
            height: cellHeight,
            width: cellWidth,
            xIndex: column,
            yIndex: row,
            corners,
            absoluteCorners: corners.map( corner => corner.copy().add(x, y) ),
            column,
            row,
            x,
            y
          });

          if (diamond && row < rows - 1 && column < columns - 1) {
            const corners = [
              createVector(x + halfDiagonal * 2, y + halfDiagonal), // top
              createVector(x + halfDiagonal * 3, y + halfDiagonal * 2), // right
              createVector(x + halfDiagonal * 2, y + halfDiagonal * 3), // bottom
              createVector(x + halfDiagonal, y + halfDiagonal * 2) // left
            ];

            const center = createVector(
              x + halfDiagonal + baseCellWidth / 2,
              y + halfDiagonal * 2
            );
  
            cells.push({
              position: createVector(x + halfDiagonal, y + halfDiagonal),
              absoluteCorners: corners.map( corner => corner.copy().add(x, y) ),
              center,
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

      // return cells;
      
      // Array.from({ length: rows }, (_, row) =>
      //   Array.from({ length: columns }, (_, column) => {

      //   })
      // ).flat();

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
