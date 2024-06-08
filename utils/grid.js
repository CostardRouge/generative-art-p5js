import { cache } from './index.js'

const grid = {
  create: ( {
    rows = 2,
    cols = 2,
    centered = true,
    startLeft = createVector( 0, 0 ),
    startRight = createVector( width, 0 ),
    endLeft = createVector( 0, height ),
    endRight = createVector( width, height )
  } ) => {
    const cacheKey = cache.key(startLeft, endLeft.x, rows, cols, centered);

    return cache.store(cacheKey, () => {
      const gridVectors = [];
      
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
          // handler(cellVector, { x, y })

          gridVectors.push([ cellVector, x, y ])
        }
      }

      return gridVectors;
    });
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
