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
  // size: {
  //   // width: 1080,
  //   // height: 1920,
  //   // ratio: 9/16
  // },
  animation: {
    framerate: 60,
    duration: 10
  }
});


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

const initialText = "demofestival2025"
const text = randomizeString(initialText)

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2;
  const letterSize = W/1.5

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
    topLeft: createVector( -W, -H ),
    topRight: createVector( W, -H ),
    bottomLeft: createVector( -W, H),
    bottomRight: createVector( W, H ),
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height),
    bottomRight: createVector( width, height )
  }

  const { cells, corners, cellWidth, cellHeight } = grid.create( gridOptions );

  // display cells / letters
  push()
  cells.forEach(({center, x: _x, y: _y}, index) => {
    const { x, y } = center;

    // string.write(index, _x+22, _y+44, {
    //   center: true,
    //   size: 22,
    //   stroke: 255,
    //   fill: favoriteColor,
    //   font: string.fonts.martian
    // })

    string.write(text[index], x, y, {
      center: true,
      size: 48,
      // size: letterSize,
      stroke: 0,
      fill: favoriteColor,
      font: string.fonts.martian
    })
  })
  pop()

  const cases = cache.store("cases", () => cells.map(cell => cell.center));
  // const trajectoryIndices = cache.store("trajectory-indices", () => getRandomIndices(cells.length, cells.length));
  const trajectoryIndices = cache.store("trajectory-indices", () => getIndicesOfString(text, "demofestival2025", true));
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

  const settings = {
    steps: 333,
    timeSpeed: 1.25,
    sampleFactor: .3,
    smooth: true,
    smoothSteps: 1
  }

  settings.steps = 400
  settings.sampleFactor = .2
  settings.smooth = 0
  settings.smoothSteps = 0
  settings.smoothLength = 1

  const letterRange = 3;
  const letterSliderSpeed = time*settings.timeSpeed;

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

  mappers.traceVectors(
    Math.floor(settings.steps),
    ( progression ) => {
      return animation.ease({
        values: trajectoryText.split("").map( (character, index) => (
          string.getTextPoints({
            text: character,
            size: letterSize,
            position: createVector(0, 0),
            sampleFactor: settings.sampleFactor,
            font: string.fonts.martian,
          })
        )),
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutSine,
        // currentTime: progression+time,
        currentTime: map(progression, 0, 1, letterStartIndex, letterEndIndex)+letterSliderSpeed
      }) 
    },
    () => {
      // push()
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const positionTime = (
        +letterSliderSpeed
        +vectorsListProgression/3
        +map(vectorsListProgression, 0, 1, letterStartIndex, letterEndIndex)
        // +vectorIndexProgression
      )
      const position = animation.ease({
        values: trajectoryPositions,
        lerpFn: p5.Vector.lerp,
        easingFn: easing.easeInOutExpo,
        currentTime: positionTime
      })

      // const a = mappers.fn(sin(time+vectorsListProgression/2), -1, 1, 0, 2, easing.easeInOutElastic)
      // const b = mappers.fn(cos(time+vectorsListProgression/2), -1, 1, 0, 1.5, easing.easeInOutElastic)

      // const a = animation.ease({
      //   values: [0, 2, 3, 1],
      //   duration: 1,
      //   // easingFn: easing.easeInOutExpo,
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
      //   sin(positionTime*a)*(W-letterSize/2),
      //   cos(positionTime*b)*(H-letterSize/2),
      // )

      position.add( vector )

      for (let index = 0; index < pointsArray.length; index++) {
        const points = pointsArray[index];
        const progression = index/(pointsArray.length-1)

        if (progression.toPrecision(3)===vectorsListProgression.toPrecision(3)) {
          points.push(position)
        }
      }

      vertex( position.x, position.y, position.z )
    },
    ( vectorIndexProgression, chunkIndex = 1 ) => {
      stroke(colors.rainbow({
        hueOffset: (
          // +chunkIndex*sin(time)
          +time//*sin(map(chunkIndex, 0, 1, -PI/2, -PI/2))
          +vectorIndexProgression*cos(map(chunkIndex, 0, 1, -PI/2, -PI/2))*2
          +0
        ),
        hueIndex: mappers.fn(noise(
          vectorIndexProgression/2*easing.easeInOutQuart(chunkIndex)+time/4,
          // chunkIndex*cos(map(vectorIndexProgression, 0, 1, -PI/2, -PI/2))*8,
          chunkIndex*easing.easeInOutSine(vectorIndexProgression*4)
        ), 0, 1, -PI/2, PI/2)*6,
        opacityFactor: mappers.fn(sin(chunkIndex*2+vectorIndexProgression*4+time*3), -1, 1, 5, 1.5),
      }))

      // const c = mappers.fn(sin(time/4+chunkIndex), -1, 1, 1, 1, easing.easeInOutExpo_)

      strokeWeight(4)
      // rotateZ(PI/c)
      endShape(LINES)

      // pop()
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



