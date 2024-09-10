import { sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

// sketch.setup(() => frameRate(25), { type: "webgl", width: 1080, height: 1920} );

sketch.setup(() => {
  p5.disableFriendlyErrors = true;
  frameRate(25)
  pixelDensity(1)
}, { type: "webgl", width: 1080, height: 1920} );

sketch.draw( (time, center, favoriteColor) => {
  background(0, 0, 0, 150);

  // time = (frameCount / (25 * 5)) * PI;


  const animationProgression = map(time, 0, 10, 0, 1)

  const points = animation.ease({
    values: "demofestival".split("").map( text => (
      string.getTextPoints({
        text,
        position: createVector(0, 0),
        size: width/2,
        font: string.fonts.sans,
        sampleFactor: .1,
        simplifyThreshold: 0
      })
    )),
    lerpFn: mappers.lerpPoints,
    currentTime: animationProgression*"demofestival".length,
    easingFn: easing.easeInOutExpo
  })

  const { x: rX, y: rY, z: rZ } = animation.ease({
    values: [
      createVector(0, 0, 0),
      createVector(PI/5, 0, 0),
      createVector(-PI/5, PI/5, 0),
      createVector(0, 0, PI/5),
      createVector(PI/4, PI/5),
      createVector(-PI/5, -PI/5, 0),
    ],
    duration: 1,
    currentTime: animationProgression*"demofestival".length,
    lerpFn: p5.Vector.lerp,
    easingFn: easing.easeInOutBack
  })

  push()

  rotateX(rX)
  rotateY(rY)
  rotateZ(rZ)
  
  const depth = 60

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    push();
    translate( 0, 0, mappers.fn(z, 0, depth, 0, -500, easing.easeInExpo_ ) )
    // translate( 0, 0, mappers.fn(depthProgression, 0, 1, -500, -1500, easing.easeInOutExpo) )

    // strokeWeight( mappers.fn(z, 0, depth, 10, 5, easing.easeInOutExpo) )
    // strokeWeight( map(z, 0, depth, 10, 50) )
    strokeWeight( 15 )

    for (let i = 0; i < points.length; i++) {
      const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;

      const opacityFactor = mappers.fn(sin(depthProgression*2*PI, easing.easeInOutExpo), -1, 1, 1.75, 1) * Math.pow(1.1, z);

      stroke(colorFunction({
        hueOffset: (
          // +depthProgression*10
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          +time
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex: mappers.fn(noise(x/width, y/height, depthProgression/2), 0, 1, -PI, PI)*12,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      }))

      const xx = (
        x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +x*Math.pow(1.15, z)
      )

      const yy = (
        y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
        +y*Math.pow(1.05, z)
      )

      point(xx, yy)
    }
    pop()
  }
  pop()

  orbitControl();
});
