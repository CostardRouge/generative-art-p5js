import { sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

sketch.setup(undefined, { type: "webgl" } );

function lerpPoints(from, to, amount, fn) {
  // const result = [];
  // const maxLength = Math.max(from.length, to.length);

  // for (let i = 0; i < maxLength; i++) {
  //   const lerpedVector = p5.Vector.lerp(
  //     from[i % from.length],
  //     to[i % to.length],
  //     amount
  //   );

  //   result.push(lerpedVector);
  // }

  // return result;

  const result = {};
  const maxLength = Math.max(from.length, to.length);

  for (let i = 0; i < maxLength; i++) {
    const lerpedVector = p5.Vector.lerp(
      from[i % from.length],
      to[i % to.length],
      amount
    );

    result[`${lerpedVector.x}${lerpedVector.y}`] = lerpedVector;
  }

  return Object.values(result);

  // return from.map( (point, index) => {
  //   const targetIndex = ~~map(index, 0, from.length-1, 0, to.length-1, true);

  //   return p5.Vector.lerp( from[index], to[targetIndex], amount )
  // })
}

function cross( { x, y, z }, size) {
  line(x - size/2, y -size/2, z, x + size/2, y +size/2, z)
  line(x + size/2, y -size/2, z, x - size/2, y +size/2, z)
}

const slots = [
  1, 1, 0, 1, 1, 0, 1, 1
]

const steps = {
  // L: [],
  L: [3, 3, 0, 0, 0, 3, 3, 6],
  R: [7, 4, 4, 1, 4, 4, 7, 7],
}

function drawStep(step = "x", position, fillColor, size = 48) {
  string.write(step, position.x - size/6, position.y, {
    // showBox: true,
    // showLines: true,
    center: true,
    size,
    // stroke: 255,
    // strokeWeight: 1,
    fill: fillColor,
    font: string.fonts.martian
  })
}

function drawSlots(slots, from, to, gap, drawer) {
  const slotsLength = slots.length;
  const slotsWidth = Math.abs(from.x) + Math.abs(to.x)
  const size = ( slotsWidth - ( ( slotsLength - 1 ) * gap ) ) / slotsLength;

  slotsPositions.forEach( position => {

    drawer?.(position, size, slots[i])
  })
}

function getSlotsPositions(slots, from, to, gap) {
  return cache.store("slots-positions", () => {
    const positions = [];

    const slotsLength = slots.length;
    const slotsWidth = Math.abs(from.x) + Math.abs(to.x)
    const size = ( slotsWidth - ( ( slotsLength - 1 ) * gap ) ) / slotsLength;
  
    for (let i = 0; i < slots.length; i++ ) {
      const position = p5.Vector.lerp(from, to, i/(slots.length-1) );

      positions.push({
        slot: slots[i],
        position,
        size
      })
    }

    return positions;
  })
}

sketch.draw( (time, center, favoriteColor) => {
  background(0);
  stroke(favoriteColor)

  const margin = 70;
  const gap = margin/4;

  const W = width/2;
  const H = height/2;

  const slotsFrom = createVector(-W+margin, H-margin );
  const slotsTo = createVector(W-margin, H-margin );

  // const danceTick = animation.ease({
  //   values: [ 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1 ],
  //   duration: 1,
  //   currentTime: time*2,
  //   // easingFn: easing.easeInOutBack
  // }).toPrecision(2);

  const danceTick = ~~(time*2 % slots.length);

  drawStep(String(danceTick+1), center, favoriteColor)


  const slotsPositions = getSlotsPositions(slots, slotsFrom, slotsTo, gap)

  slotsPositions.forEach( ( { position, size, slot }, index ) => {
    stroke(slot ? favoriteColor : "red")

    noFill();
    strokeWeight(2)
    rect(position.x-size/2, position.y-size/2, size, size)

    //drawStep(String(index), position, favoriteColor)

  } )

  for ( const step in steps ) {
    const stepMoves = steps[ step ];
    const stepMoveIndex = stepMoves[ danceTick ];
    const stepPosition = slotsPositions?.[ stepMoveIndex ]?.position;


    if (!stepPosition) {
      console.log({stepPosition, stepMoveIndex, danceTick});

    }


    drawStep(step, stepPosition, favoriteColor)

  }

  // drawSlots(slotsPositions, )
  // drawSteps()

  stroke("red")
  strokeWeight(10)
  // point(slotsFrom.x, slotsFrom.y)
  // point(slotsTo.x, slotsTo.y)

  orbitControl();
});
