import { sketch, easing, mappers, string } from './utils/index.js';

sketch.setup();

sketch.draw(time => {
  background(0, 0, 0, 32);

  let x = map(mouseX, 0, width, 20, width -20);
  let y = height / 2;

const rollingTime = time/2 % 1

const easingFunctions = Object.entries( easing );
const [ easingFunctionName, easingFunction ] = mappers.circularIndex( time/2 , easingFunctions);

string.write(easingFunctionName, 100, 30)

print({
  easingFunctionName
})

const angle = easingFunction( rollingTime ) * TAU

  x = map(sin(time), -1, 1, 20, width - 20)



  x = width/2 + width/4 * cos(angle)
  y = width/2 + width/4 * sin(angle)
  //x = map(rollingTime, 0, 1, 20, width - 20)
  //print(x, e, width)
  //y = map(cos(time), -1, 1, 20, width - 20)
  
  circle( x, y, 40)

  stroke(255)
  strokeWeight(2)

  line(x, 0, x, height)
  line(0, y, width, y)


});

