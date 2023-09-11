import { sketch, string, mappers, easing, animation, colors, cache, grid, midi, events } from './utils/index.js';

events.register( "post-setup", midi.setup );

// let lastPressedIdentifiers = ["#", "x"]
let lastPressedNote = {}
let pressedNoteCount = 0;

sketch.setup(() => {
    midi.on( { }, note => {
      lastPressedNote = note
      pressedNoteCount++


      scaleFinal = map(note.attack, 0, 1, 1, 0)
      attackFinal = note.attack
      // lastPressedIdentifiers.push(note.identifier)
  
    } );

    // midi.on( 0, console.log )
    // midi.off( 0, console.log )
}, { type: "webgl" } );

function getTextPoints({ text, size, font, position, sampleFactor, simplifyThreshold }) {
  const fontFamily = font.font?.names?.fontFamily?.en;
  const textPointsCacheKey = cache.key(text, fontFamily, "text-points")

  return cache.store( textPointsCacheKey, () => {
    const textPoints = font.textToPoints(text, position.x, position.y, size, {
      sampleFactor, simplifyThreshold
    });

    const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
    const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
    const xCenter = (xMax/2)+(xMin/2)

    const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
    const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
    const yCenter = (yMax/2)+(yMin/2)

    return textPoints.map( ({x, y}) => {
      const testPointVector = createVector(x, y);

      testPointVector.add((position.x-xCenter),(position.y-yCenter))

      return testPointVector;
    })
  });
}

function lerpPoints(from, to, amount, fn) {
  return to.map( (point, index) => {
    const targetIndex = ~~map(index, 0, to.length-1, 0, from.length-1, true);

    return p5.Vector.lerp( to[index], from[targetIndex], amount )
  })

  return from.map( (point, index) => {
    const fromIndex = map(index, 0, 1, 0, from.length-1);
    const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

    return p5.Vector.lerp( from[index], to[targetIndex], amount )
  })
}

function drawGridCell(_x, _y, w, h, cols, rows, drawer) {
  const xSize = w / cols;
  const ySize = h / rows;

  for (let x = 0; x <= cols; x++) {
    for (let y = 0; y <= rows; y++) {
      drawer?.(_x + x*xSize, _y + y*ySize, xSize, ySize)
    }
  }
}

// function drawGrid(xCount, yCount, offset = 1) {
function drawGrid(cols, time) {
  //   const xSize = width / xCount;
  // const ySize = height / yCount;

  // for (let x = offset; x <= xCount - offset; x++) {
  //   for (let y = offset; y <= yCount - offset; y++) {
  //     hl(y * ySize)
  //     vl(x * xSize)
  //   }
  // }

  const rows = cols*height/width;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols: ~~cols,
    centered: true
  }

  const W = width / cols;
  const H = height / rows;

  noFill()
  strokeWeight(2)

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const n = noise(x/cols, y/rows + time)*4;

    drawGridCell(
      cellVector.x-W/2,
      cellVector.y-H/2,
      W,
      H,
      ~~n,
      ~~n,
      ( x, y, w, h ) => {

        rect(x, y, w, h )
      }
    )
  })
}

let rxFinal = 0
let ryFinal = 0
let scaleFinal = 0
let attackFinal = 0


const notes = "abcdefg";

function drawNoteAttack() {
  const gap = 20;
  const attack = lastPressedNote?.attack



  // push()
  // translate(0, 0, -200)

  stroke(128, 128, 255)
  strokeWeight(4)

  // const x = map(notes.indexOf(note[0]), 0, notes.length-1, -width/2, width/2)
  // line( x, -height/2, x, height/2)

  console.log(lastPressedNote);

  // const y = map(Number(note[1]), 1, 7, -height/2, height/2)  
  line( -width/2, y, width/2, y)

  // pop()

}

function drawProgression(progression, start, end, steps = 0) {
  push()
  stroke(128, 128, 255)
  strokeWeight(15)
  // cross(start, 20)
  // cross(end, 20)

  // push()
  // translate(start)
  // point(0, 0)
  // pop()

  // push()
  // translate(end)
  // point(0, 0)
  // pop()

  // point(end.x, end.y, end.z)

  const currentProgression = p5.Vector.lerp( start, end, progression )

  strokeWeight(3.5)
  line(start.x, start.y, start.z, currentProgression.x, currentProgression.y, currentProgression.z)

  for (let i = 0; i <= steps; i++) {
    const currentStepPosition = p5.Vector.lerp( start, end, i/steps );

    if (i === 0 || i === ~~(steps/2) || i === steps) {
      strokeWeight(15)
    }
    else {
      strokeWeight(8.5)
    }

    push()
    translate(currentStepPosition)
    point(0, 0)
    pop()
  }
  pop()
}

sketch.draw( (time, center) => {
  background(0);
  // background();

  // push()
  // stroke(64, 64, 128)
  // drawGrid(8, 0)
  // pop()

  const W = width/2;
  const H = height/2
  const margin = 100;

  scaleFinal = lerp(scaleFinal, 1, 0.07)
  attackFinal = lerp(attackFinal, 0, 0.07)



  // const attack = scaleFinal//mappers.fn(lastPressedNote?.attack, 0, 1, 1, 3);
  const attack = mappers.fn(lastPressedNote?.attack, 0, 1, 0, 1); // attackFinal


  drawProgression(scaleFinal, createVector(-W+margin, H-margin), createVector(W-margin, H-margin), 10 )
  drawProgression(attack, createVector(-W+margin, -H+margin), createVector(W-margin, -H+margin), 10 )





  const {
    x: rX,
    y: rY,
  } = animation.ease({
    values: [
      createVector(), // face
      createVector(PI/10), // face
      createVector(PI/10, PI/10), // face
      createVector(-PI/10, PI/10), // face
      createVector(-PI/10, -PI/10), // face
      createVector(PI/10, -PI/10), // face
      // createVector(0, -HALF_PI), // right
      // createVector(-HALF_PI), // up
      // createVector(0, HALF_PI), // left
      // createVector(0, PI), // back
      // createVector(HALF_PI), // bot
    ],
    // currentTime: time,
    currentTime: pressedNoteCount,
    duration: 1,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutExpo,
    easingFn: easing.easeInOutElastic,
    easingFn: easing.easeInOutCirc,
  })

  const note = lastPressedNote?.identifier//toLowerCase();

  // push()
  // translate(0, 0, -200)

  // stroke(128, 128, 255)
  // strokeWeight(4)

  // const x = map(notes.indexOf(note[0]), 0, notes.length-1, -width/2, width/2)
  // line( x, -height/2, x, height/2)

  // console.log(lastPressedNote);

  // const y = map(Number(note[1]), 1, 7, -height/2, height/2)  
  // line( -width/2, y, width/2, y)

  // pop()

  // rxFinal = lerp(rX, rxFinal, 0.67)
  // ryFinal = lerp(rY, ryFinal, 0.67)

  // rotateX(rX)
  // rotateY(rY)

  // rotateX(rxFinal/2)
  // rotateY(ryFinal/2)

  // rotateY(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/9)
  // rotateX(mappers.fn(cos(time), -1, 1, -PI, PI, easing.easeInOutQuart)/9)

  const size = width/3;
  const font = string.fonts.sans;

  const sampleFactor = 0.25;
  const simplifyThreshold = 0;
  const letterPosition = createVector(0, 0)

  const textFn = lastPressedNote?.attack < 0.5 ? "toLowerCase" : "toUpperCase"

  const currentLetterPoints = getTextPoints({
    // text: "f#",
    // text: lastPressedIdentifiers[0],
    text: lastPressedNote?.identifier ?? "*",
    text: (lastPressedNote?.identifier ?? "*")?.[textFn](),
    // text: lastPressedIdentifiers[ lastPressedIdentifiers.length - 2 ],
    position: letterPosition,
    size,
    font,
    sampleFactor,
    simplifyThreshold
  })

  console.log(lastPressedNote);

  // const nextLetterPoints = getTextPoints({
  //   text: "b3",
  //   text: lastPressedIdentifiers[ lastPressedIdentifiers.length - 1 ],

  //   position: letterPosition,
  //   size,
  //   font,
  //   sampleFactor,
  //   simplifyThreshold
  // })


  const primary = currentLetterPoints//.length > nextLetterPoints.length ? currentLetterPoints : nextLetterPoints;
  // const secondary = currentLetterPoints.length > nextLetterPoints.length ? nextLetterPoints : currentLetterPoints;
  
  const depth = 10;

  // scaleFinal = lerp(mappers.fn(lastPressedNote?.attack ?? 1, 0, 1, 1, 3), scaleFinal, 0.7)

  const scale = scaleFinal//mappers.fn(lastPressedNote?.attack, 0, 1, 1, 3);


  // const scale = 2;


  for (let z = 0; z < depth; z++) {
    translate( 0, 0, map(z, 0, depth, 0, -50) )

    strokeWeight( map(z, 0, depth, 10, 1) )


    for (let i = 0; i < primary.length; i++) {
      const progression = i / primary.length
      //const targetIndex = ~~constrain(i, 0, secondary.length-1);
      // const targetIndex = ~~map(i, 0, primary.length-1, 0, secondary.length-1);

      // const { x, y } = animation.ease({
      //   values: [ primary[i], secondary[targetIndex] ],
      //   currentTime: time+z/50+progression/10,
      //   // currentTime: (z/depth)/10,
      //   duration: 1,
      //   easingFn: easing.easeInOutExpo,
      //   //easingFn: easing.easeOutElastic,
      //   lerpFn: p5.Vector.lerp,
      // })

      const { x, y } = primary[i];
    
      const colorFunction = colors.rainbow
      
      // mappers.circularIndex(time/4+progression+z/100, [
      //   colors.rainbow,
      //   //colors.test,
      // // colors.black
      // ]);

      const op1 = map(sin(progression*100+time*4-z*0.3), -1, 1, 5, 1);
    
      stroke(colorFunction({
        //hueOffset: time+progression*4+z/depth,
        // hueIndex: mappers.fn(progression, 0, 1, -PI, PI),
        // hueIndex: mappers.fn(z, 0, depth-1, -PI, PI),
        // hueIndex: mappers.circular(progression, 0, 1, -PI, PI)*8,
        hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*8,
        // opacityFactor: 1.5,//mappers.fn(alpha, 0, 255, 3, 1)
        opacityFactor: mappers.fn(z, 0, depth, 1, 10, easing.easeInExpo),
        opacityFactor: map(sin(progression*100+time*4-z*0.3), -1, 1, 5, 1) * Math.pow(1.15, z),
        // opacityFactor: map(sin(progression*100+time*4), -1, 1, 3, 1),
        // opacityFactor: map(sin(z*50+progression*5+time*4), -1, 1, 10, 1)
      }))
      // push()
      // translate(
      //   x*scale*map(z, 0, depth, 0, 1),
      //   y*scale*map(z, 0, depth, 0, 1),
      //   // map(z, 0, depth, 0, -100)
      // )
      // translate(
      //   x*scale,
      //   y*scale,
      // )

      const xx = (
        x*scale
        +x*Math.pow(1.1, z)
        // +x*map(z, 0, 1, 1, 0.1)
      );
      const yy = (
        y*scale
        // +y*map(z, 0, 1, 1, 0.1)

        +y*Math.pow(1.1, z)
      );

      // point(
      //   constrain(xx, -W, W),
      //   constrain(yy, -H, H),
      // )

      point(xx, yy)
      // pop()
    }
  }

  orbitControl();


  return 
  
  const cols = width / (size * letterScale);
  const rows = ~~cols*height/width;

  const gridOptions = {
    startLeft: createVector( -width/2, -height/2 ),
    startRight: createVector( width/2, -height/2 ),
    endLeft: createVector( -width/2, height/2 ),
    endRight: createVector( width/2, height/2 ),
    rows,
    cols: ~~cols,
    centered: true
  }

  stroke(255)
  grid.draw(gridOptions, (cellVector, { x, y }) => {
    push()
    translate(cellVector)

    const n = noise(x/cols, y/rows-time/100);

    const p = animation.ease({
      values: [ 0, 1 ],
      currentTime: time+n,
      duration: 1,
      easingFn: easing.easeInOutExpo
    })

    const points = lerpPoints(currentLetterPoints, nextLetterPoints, p )

    beginShape(POINTS)
    points.forEach( ({x, y}) => {
      vertex(x * letterScale, y * letterScale)
    })
    endShape()

    pop()
  })

  orbitControl();
});
