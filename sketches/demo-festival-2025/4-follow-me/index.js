import { options, grid, iterators, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';


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

function drawGrid(xCount, yCount, color, weight = 2) {
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
  pixelDensity(1)
}, {
  type: "2d",
  size: {
    width: 1080,
    height: 1920,
    // ratio: 9/16
  },
  animation: {
    framerate: 60,
    duration: 10
  }
});

function reverseString(str) {
  return str.split('').reverse().join('');
}

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

function randomizeString(str) {
  const arr = str.split(''); // Convert the string to an array of characters
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
      [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr.join(''); // Convert the array back to a string
}

function getIndicesOfString(str, target, uniq) {
  if (uniq) {
    const usedIndices = new Set(); // To keep track of used indices
    return target.split('').map(char => {
        let idx = str.indexOf(char);
        while (idx !== -1 && usedIndices.has(idx)) {
            idx = str.indexOf(char, idx + 1); // Look for the next occurrence
        }
        if (idx !== -1) {
            usedIndices.add(idx); // Mark this index as used
        }
        return idx;
    });
  }
  return target.split('').map(char => str.indexOf(char));
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

const initialText = "2025"
// const text = randomizeString(initialText)
const text = reverseString(initialText)
// const text = (initialText)

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2;
  const letterSize = W/1.5

  //time = (frameCount / (25 * 5)) * PI;

  push()
  // translate(-W, -H)
  const columns = 4//options.get("grid-columns")//4;
  const rows = 4//options.get("grid-rows")//3///columns * (height/width);
  drawGrid(columns, rows, favoriteColor, 1)
  pop()

  const gridOptions = {
    rows,
    columns,
    // diamond: 1,
    centered: 1,
    // topLeft: createVector( -W, -H ),
    // topRight: createVector( W, -H ),
    // bottomLeft: createVector( -W, H),
    // bottomRight: createVector( W, H ),
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height),
    bottomRight: createVector( width, height )
  }

  const { cells, corners, cellWidth, cellHeight } = grid.create( gridOptions );

  // display cells / letters
  // push()
  // cells.forEach(({center, x: _x, y: _y}, index) => {
  //   const { x, y } = center;

  //   // string.write(index, _x+22, _y+44, {
  //   //   center: true,
  //   //   size: 22,
  //   //   stroke: 255,
  //   //   fill: favoriteColor,
  //   //   font: string.fonts.martian
  //   // })

  //   string.write(text[index], x, y, {
  //     center: true,
  //     size: 48,
  //     // size: letterSize,
  //     stroke: 0,
  //     fill: favoriteColor,
  //     font: string.fonts.martian
  //   })
  // })
  // pop()

  const cases = cache.store("cases", () => cells.map(cell => cell.center));
  // const trajectoryIndices = cache.store("trajectory-indices", () => getRandomIndices(cells.length, cells.length));
  // const trajectoryIndices = cache.store("trajectory-indices", () => getIndicesOfString(text, "demo", true));
  const trajectoryIndices = cells.map((_, index) => index);
  // const trajectoryPositions = cache.store("trajectory-positions", () => reorderByIndices(cases, trajectoryIndices));
  const trajectoryText = cache.store("trajectory-text", () => reorderByIndices(text, trajectoryIndices));

  // translate(0, 0, -100)

  // const letterRange = 3;
  const letterRange = text.length-1
  const precision = 3

  const settings = {
    steps: 40,
    // steps: text.length*10,
    timeSpeed: 0,
    sampleFactor: .1,
    smooth: 0,
    smoothSteps: 1
  }

  // settings.steps = 400
  // // settings.steps = text.length*100
  // settings.sampleFactor = .35
  // settings.smooth = 1;
  // settings.smoothSteps = 1;
  // settings.smoothLength = 1;

  const letterSliderSpeed = animation.time*settings.timeSpeed;

  const pointsArray = Array(~~(1+letterRange)).fill([])
  // const letterStartIndex = animation.ease({
  //   values: Array(Math.floor(trajectoryText.length-letterRange)).fill(undefined).map((_, index) => index),
  //   duration: 1,
  //   currentTime: letterSliderSpeed,
  //   easingFn: easing.easeInOutSine,
  // });

  // const letterEndIndex = animation.ease({
  //   values: Array(Math.floor(trajectoryText.length-letterRange)).fill(undefined).map((_, index) => index + letterRange),
  //   duration: 2,
  //   currentTime: letterSliderSpeed,
  //   easingFn: easing.easeInOutExpo,
  // });

  const letterStartIndex = letterSliderSpeed;
  const letterEndIndex = letterSliderSpeed+letterRange;

  const vectorsToTrace = trajectoryText.split("").map( (character, index) => (
    string.getTextPoints({
      text: character,
      size: letterSize,
      position: createVector(0, 0),
      sampleFactor: settings.sampleFactor,
      font: string.fonts.serif,
    })
  ))

  mappers.traceVectors(
    Math.floor(settings.steps),
    ( progression ) => {
      return animation.ease({
        values: vectorsToTrace,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutSine,
        // currentTime: progression+animation.time,
        currentTime: mappers.fn(progression, 0, 1, letterStartIndex, letterEndIndex)+letterSliderSpeed
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const vectorIndex = (
        +vectorsListProgression*letterRange//*2
      );

      const speed = 2
      const position = {
        x: Math.sin((animation.angle*3)*speed+vectorIndex)*(W-letterSize/1.5)+W,
        y: Math.cos((animation.angle)*speed+vectorIndex/3)*(H-letterSize/2)+H,
      }

      position.x += vector.x;
      position.y += vector.y;

      for (let index = 0; index < pointsArray.length; index++) {
        const points = pointsArray[index];
        const progression = index/(pointsArray.length-1)

        if (progression.toPrecision(precision)===vectorsListProgression.toPrecision(precision)) {
          points.push(position)
        }
      }

      vertex( position.x, position.y )
    },
    ( vectorIndexProgression, chunkIndex = 1 ) => {
      stroke(colors.rainbow({
        hueOffset: (
          // +mappers.fn(sin(chunkIndex+vectorIndexProgression+animation.time*4), -1, 1, chunkIndex, chunkIndex*15)//*sin(time)
          +animation.circularProgression//*sin(map(chunkIndex, 0, 1, -PI/2, -PI/2))
          // +vectorIndexProgression*cos(map(chunkIndex, 0, 1, -PI/2, -PI/2))*2
          +0
        ),
        hueIndex: mappers.fn(noise(
          vectorIndexProgression*8,//*easing.easeInOutQuart(chunkIndex)+time/4,
          chunkIndex*2,
          // animation.circularProgression,
          // mappers.fn(sin(chunkIndex+animation.sinAngle), -1, 1, chunkIndex, chunkIndex)
        ), 0, 1, -PI/2, PI/2)*14,
        opacityFactor: mappers.fn(sin(chunkIndex*10*vectorIndexProgression*2+animation.sinAngle*6), -1, 1, 5, 1.5),
      }))

      // strokeWeight(4)
      endShape(LINES)
    },
    settings.smoothLength,
    settings.smooth,
    settings.smoothSteps
  )

  stroke(favoriteColor)
  fill(128, 128, 255, 32)
  strokeWeight(4)

  pointsArray.forEach(points => {
    drawLine(points, POINTS)
  })

  // orbitControl()
});
