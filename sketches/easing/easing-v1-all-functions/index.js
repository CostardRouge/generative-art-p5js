import { sketch, easing, mappers, text } from './utils/index.js';

sketch.setup();

sketch.draw(time => {
  background(0, 0, 0, 32);

  let x = map(mouseX, 0, width, 20, width -20);
  let y = height / 2;

const rollingTime = constrain(time/2 % 1, 0, 1);

const easingFunctions = Object.entries( easing );
const [ easingFunctionName, easingFunction ] = mappers.circularIndex( time /2, easingFunctions);

text.write(easingFunctionName, 100, 30)

print({
  easingFunctionName
})

const e = easingFunction( rollingTime );

const eToAngle = map(e, 0, 1, 0, TAU)

console.log({rollingTime, e})

  x = map(sin(time), -1, 1, 20, width - 20)
  x = width * e
  y = height * e

  x = width/2 + width/4 * cos(eToAngle)
  y = width/2 + width/4 * sin(eToAngle)
  //x = map(rollingTime, 0, 1, 20, width - 20)
  //print(x, e, width)
  //y = map(cos(time), -1, 1, 20, width - 20)
  
  circle( x, y, 40)

  stroke(255)
  strokeWeight(2)

  line(x, 0, x, height)
  line(0, y, width, y)


});

