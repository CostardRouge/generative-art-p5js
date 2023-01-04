import { sketch, converters, audio, animation, string, mappers, iterators, options, easing } from './utils/index.js';

const vectors = []

sketch.setup( () => {
  vectors.push(
    createVector( width / 2, 200 ),
    createVector( width / 2-200, height / 2 ),
    createVector( width / 2, height - 200 ),
    createVector( width / 2+200, height / 2 ),
  )
});

// const bouncyEaseInOutElastic = animation.makeEaseInOut(easing.easeInOutElastic)
// const easingFunctions = Object.entries( easing );

sketch.draw((time, center) => {
  background(0);

  strokeWeight(2);
  stroke(255);
  noFill();

  vectors.forEach(vector => {
    circle( vector.x, vector.y, 50);
  });

  //const easingFunction = mappers.circularIndex(time, easingFunctions)[1]

  const moving = animation.ease({
    values: vectors,
    currentTime: time,
    duration: 1,
    easingFn: easing.easeInOutExpo,
    // easingFn: easing.easeInOutElastic,
    lerpFn: p5.Vector.lerp,
  })

  fill('red');
  noStroke();
  circle( moving.x, moving.y, 30);
});
