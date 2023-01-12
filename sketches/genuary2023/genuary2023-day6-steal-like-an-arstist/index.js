import { debug, sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

const easingFunctions = Object.entries(easing)

sketch.draw( (time, center) => {
  background(0);

  const h = height/4;
  const d = 50//map(sin(time), -1, 1, 20, 50);
  const r = 600;

  strokeWeight(1)
  stroke(255)
  noFill()

  rotateX(-PI/4.5)

  //sketch?.engine?.camera?.lookAt(-7.38, -486, 398)

  // const ccsd = cache.store("ccsd", () => animation.makeEaseInOut(easing.easeInExpo))

  for (let z = 0; z < d; z++) {
    push()
    translate(0, map(z, 0, d-1, -h, h))
    rotateX(PI/2)
    rotateZ(-time/4)

    // const easingFunction = mappers.circularIndex(-time+z/100, easingFunctions)[1]


    const zR = mappers.fn(z, -15, d*1.7, 0.5, 20, easing.easeInExpo);


    const cc = map(z, 0, d-1, -PI, PI)/2
    let rr = map(z, 0, d-1, r, -r)
    rr = map(sin(cc+time), -1, 1, r, -r)
    //rr = map(sin(cc+time+z*50), -1, 1, r, -r)

    for (let a = 0; a < TAU; a += TAU / 90) {
      const easingFunction = mappers.circularIndex(-time+z/100, easingFunctions)[1]
      //rr = mappers.fn(z, 0, d-1, -r, r, easingFunction)
      //rr = mappers.fn(sin(a+time/100), -1, 1, -r, r, easingFunction)


      const colorIndex = noise(a, z) * TAU

      const t = map(zR, 0.5, 20, 1, 3)

      const ccoco = (colors.rainbow({
        //hueOffset: map(sin(time+a/PI/2), -1, 1, 1, -1),
        hueOffset: a+z/50,
        hueIndex: time*5,//mappers.fn(colorIndex, 0, TAU, -PI, PI)*8,
        //opacityFactor: mappers.fn(sin(time*2+a*PI/3), -1, 1, 10, 1, easing.easeOutQuart),
        //opacityFactor: map(sin(z*a*2+time*3), -1, 1, 15, 1),
        opacityFactor: map(sin(z*50+a*3-time*t), -1, 1, 20, 0.5) + mappers.fn(z, 0, d-1, 0, 20, easing.easeInExpo),
        //opacityFactor: map(sin(z*50+a*z+time*3), -1, 1, 15, 1)
      }))

      //fill()
      stroke(ccoco)


      // point(
      //   sin(a) * r/2,
      //   cos(a) * rr/2
      // )


      push()
      translate(
        sin(a) * rr*zR/2,
        cos(a) * rr*zR/2
      )

      translate(
        sin(a)*2 * r*zR/3,
        cos(a)*2 * r*zR/3
      )

      const s = 10//map(sin(time), -1, 1, 50, 10)
      box(s)

      stroke(ccoco)
      strokeWeight(5)
      point(0, 0)
      pop()
    }
    // //circle(0, 0, r)
    pop()
  }

  debug.webgl()

  orbitControl()
});
