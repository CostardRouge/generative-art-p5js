import { options, grid, iterators, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';
// import './libraries/simplex.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 50,
    defaultValue: 4,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'columns',
    min: 1,
    max: 50,
    defaultValue: 2,
    category: 'Grid'
  },
] );

function drawGrid(xCount, yCount, color, weight = 2, offset = 0) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  for (let x = 0; x < xCount-1; x++) {
    line((xx + x * xSize), 0, (xx + x * xSize), height);   
  }

  for (let y = 0; y < yCount-1; y++) {
    line(0, (yy + y * ySize), width, (y * ySize + yy));
  }
}

sketch.setup(() => {
  p5.disableFriendlyErrors = true;
  frameRate(60)
}, { type: "webgl", width: 1080, height: 1920} );

const text = "demofestival2025".split("")

function getRandomIndices(maxIndex, amount, unique = true) {
  if (!unique) {
    return Array.from({ length: amount }, () => Math.floor(Math.random() * maxIndex));
  }

  const indices = Array.from({ length: maxIndex }, (_, i) => i);
  const result = [];

  for (let i = 0; i < amount; i++) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      result.push(indices[randomIndex]);
      indices.splice(randomIndex, 1);
  }

  return result;
}

function reorderByIndices(data, indices) {
  return Array.isArray(data)
      ? indices.map(index => data[index])
      : indices.map(index => data[index]).join('');
}

function drawLine( points, type ) {
  beginShape(type);
  for (let index = 0; index < points.length; index++) {
    const { x, y, z } = points[index];

    vertex(x, y, z);
  }

  endShape(CLOSE)
}

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2;

  const letterSize = W/1.5

  push()
  translate(-W, -H)
  const columns = 4//options.get("grid-columns")//4;
  const rows = 4//options.get("grid-rows")//3///columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 0.5, 0)
  pop()

  const gridOptions = {
    rows,
    columns,
    // diamond: 1,
    centered: 1,
    topLeft: createVector( -W, -H ),
    topRight: createVector( W, -H ),
    bottomLeft: createVector( -W, H),
    bottomRight: createVector( W, H )
  }

  const { cells, corners, cellWidth, cellHeight } = grid.create( gridOptions );

  // display cells / letters
  push()
  cells.forEach(({center}, index) => {
    const { x, y } = center;

    // string.write(index, x, y, {
    //   center: true,
    //   size: 22,
    //   stroke: 255,
    //   fill: favoriteColor,
    //   font: string.fonts.martian
    // })

    string.write(text[index], x, y, {
      center: true,
      size: 22,
      // size: letterSize,
      stroke: 255,
      fill: favoriteColor,
      font: string.fonts.martian
    })
  })
  pop()

  const cases = cache.store("cases", () => cells.map(cell => cell.center));
  const trajectoryIndices = cache.store("trajectory-indices", () => getRandomIndices(cells.length, cells.length));
  // const trajectoryIndices = cells.map((_, index) => index);
  const trajectoryPositions = cache.store("trajectory-positions", () => reorderByIndices(cases, trajectoryIndices));
  const trajectoryText = cache.store("trajectory-text", () => reorderByIndices(text, trajectoryIndices));

  // trace trajectory
  // stroke(96)
  // strokeWeight(2)
  // drawLine(trajectoryPositions, 2)

  // beginShape()
  // iterators.vectors(trajectoryPositions, ({x, y }) => {
  //   point(x, y)
  // }, 0.05)

  // iterators.vectors([trajectoryPositions[0], trajectoryPositions[trajectoryPositions.length -1]], ({x, y }) => {
  //   point(x, y)
  // }, 0.05)
  // endShape()

  // translate(0, 0, -100)

  const start = [];
  const end = [];

  mappers.traceVectors(
    200,
    ( progression ) => {
      return animation.ease({
        values: trajectoryText.map( (character, index) => (
          string.getTextPoints({
            text: character,
            size: letterSize,
            position: cases[index].center,
            position: createVector(0, 0),
            sampleFactor: .1,
            font: string.fonts.martian,
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutSine,
        // currentTime: map(progression, 0, 1, 0, 1)+time,
        currentTime: progression*2+time
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const positionTime = (
        +time
        +vectorsListProgression
        // +vectorIndexProgression
      )
      const position = animation.ease({
        values: trajectoryPositions,
        lerpFn: p5.Vector.lerp,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCirc,
        easingFn: easing.easeInOutCubic,
        currentTime: positionTime
      })

      // const a = mappers.fn(sin(time+vectorsListProgression/2), -1, 1, 0, 2, easing.easeInOutElastic)
      // const b = mappers.fn(cos(time+vectorsListProgression/2), -1, 1, 0, 1.5, easing.easeInOutElastic)

      // const a = animation.ease({
      //   values: [0, 2, 3, 1],
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   // easingFn: easing.easeInOutCubic,
      //   currentTime: time/2+vectorsListProgression/2
      // })

      // const b = animation.ease({
      //   values: [1.5, 0, 2, 4],
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   // easingFn: easing.easeInOutCubic,
      //   currentTime: time/2+vectorsListProgression/2
      // })

      // const position = createVector(
      //   sin(a)*W/1.5,
      //   cos(b)*H/1.5,
      // )

      // const position = createVector(
      //   sin(positionTime*3)*W/2,
      //   cos(positionTime)*H/2,
      // )

      position.add( vector )

      // if (vectorsListProgression==1) {
      //   end.push( position)
      // }

      // if (vectorsListProgression==0) {
      //   start.push( position )
      // }

      vertex( position.x, position.y, position.z )
    },
    ( vectorIndexProgression, chunkIndex = 1 ) => {
      stroke(colors.rainbow({
        hueOffset: (
          // +time
          //+chunkIndex*sin(time)
          +0
        ),
        // opacityFactor: 1.5,
        hueIndex: mappers.fn(noise(chunkIndex, time), 0, 1 -PI/2, PI/2)*8,
        // opacityFactor: mappers.fn(noise(chunkIndex/4, vectorIndexProgression), 0, 1, 2.5, 1.5),
        // opacityFactor: mappers.fn(sin(chunkIndex*0+time+vectorIndexProgression*10), -1, 1, 5, 1.5),
      }))

      // const c = mappers.fn(sin(time/4+chunkIndex), -1, 1, 1, 1, easing.easeInOutExpo_)

      strokeWeight(4)
      // rotateZ(PI/c)
      endShape(LINES)

      // pop()
    },
    1,
    1,
    5
  )

  // stroke(favoriteColor)
  // fill(128, 128, 255, 32)
  // strokeWeight(4)
  // drawLine( end, POINTS )
  // drawLine( start, POINTS )

  orbitControl()
});



