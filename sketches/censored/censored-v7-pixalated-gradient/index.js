let pixilatedCanvas = null;
let maskImage = null;
let masked = null;

import { shapes, sketch, events, animation, colors, mappers, easing, grid } from './utils/index.js';

const canvases = {}

sketch.setup(() => {
  canvases.buffer = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height/2
  );

  canvases.pixilated = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height/2
  );

  canvases.pixilated.pixelDensity(0.1)


  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 3),
          end: createVector(0, height / 3),
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
}, {
  animation: {
    framerate: 60,
    duration: 20
  },
  type: '2d'
});

class Spiral {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();
  }

  calculateRelativePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRelativePosition();
  }

  draw( target, lerpStep = 1 / 800) {
    let { position, size, start, end } = this;

    target.push();
    target.translate(position.x, position.y);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const opacityFactor = map(
        lerpIndex,
        0,
        1,
        map(
          Math.sin(lerpIndex*30 + animation.sinAngle * 3),
          -1,
          1,
          1,
          1.3//*pow(lerpIndex, 1.1)
        ),
        1
      );

      
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      const xOffset = size
      const yOffset = mappers.fn(
        Math.cos(animation.cosAngle*2+lerpIndex*6), -1, 1, -size, size,
        easing.easeInOutSine
      )*1;

      const s = mappers.fn(Math.sin(animation.sinAngle+lerpIndex*3), -1, 1, 60, 120, easing.easeInOutElastic);
      const c = mappers.fn(Math.cos(animation.sinAngle*6+lerpIndex*9), -1, 1, 3, 9, easing.easeInOutSine);

      for (let i = 0; i <= c; i++) {
        const x1 = animation.ease({
          values: [ lerpPosition.x - xOffset, lerpPosition.x + xOffset],
          currentTime: animation.time,
          easingFn: easing.easeInOutCubic
        })

        const y1 = animation.ease({
          values: [ lerpPosition.y - yOffset, lerpPosition.y + yOffset],
          currentTime: animation.time,
          easingFn: easing.easeInOutCubic
        })

        const x = lerp(
          -x1-y1,
          x1-y1,
          i / c
        );
        const y = lerp(
          y1+x1,
          -y1+x1,
          i / c
        );

        const a = lerpIndex*lerpIndex*4+i*2;

        target.fill(
          map(Math.sin(lerpIndex*a+animation.sinAngle), -1, 1, 0, 360) / opacityFactor,
          map(Math.cos(lerpIndex*a-animation.cosAngle), -1, 1, 0, 255) / opacityFactor,
          map(Math.sin(lerpIndex*a+animation.sinAngle), -1, 1, 255, 0) / opacityFactor
        );

        target.circle(x, y, s);
      }
    }

    target.pop();
  }
}

function drawShape( {
  canvas, start, end, precision = 1 / 10, size
}) {
  canvases.buffer.background(0)

  const branchCount = 12;

  for (let stepIndex = 0; stepIndex < 1; stepIndex += precision) {
    const position = p5.Vector.lerp(start, end, stepIndex);


    for (let branchIndex = 0; branchIndex <= branchCount; branchIndex++) {
      const branchProgression = branchIndex / branchCount;
      const thickness = mappers.fn(Math.sin(animation.sinAngle*8+stepIndex*2+branchProgression*6), -1, 1, 60, 120, easing.easeInOutExpo);
      // const s = mappers.fn(Math.sin(animation.sinAngle+stepIndex+branchIndex), -1, 1, -size/2, size/2, easing.easeInOutElastic);

      const x = position.x+mappers.fn(
        noise(
          stepIndex+animation.time/2,
          branchIndex-animation.time
        ),
        0, 1,
        -size, size,
        easing.easeInOutQuad
      )


      
      
      // animation.ease({
      //   values: [ -size/2+400, size*2-120 ],
      //   currentTime: (
      //     animation.time*3
      //     // // +position.x*branchProgression
      //     // +Math.cos(animation.sinAngle+branchProgression/2)
      //     // +Math.sin(animation.sinAngle*2+branchProgression)
      //     +branchProgression/2
      //     +stepIndex//x*(Math.cos(animation.sinAngle+branchProgression/2))
      //   ),
      //   easingFn: easing.easeInOutCubic
      // })
      const y = position.y//+mappers.fn(noise(x/2000, animation.time), 0, 1, -10, 10, easing.easeInOutElastic);
      
      // position.y+mappers.fn(
      //   Math.sin(animation.sinAngle+stepIndex+branchIndex), -1, 1, -size/2, size/2, easing.easeInOutElastic);
      
      // animation.ease({
      //   values: [ -s+thickness, s-thickness ],
      //   currentTime: (
      //     animation.time*3
      //     +branchIndex*2
      //     +stepIndex
      //   ),
      //   easingFn: easing.easeInOutExpo
      // })

      const a = stepIndex*stepIndex*8+branchProgression*20;

      const opacityFactor = map(
        stepIndex,
        0,
        1,
        map(
          Math.sin(stepIndex*30 + animation.sinAngle*3 + branchProgression*2),
          -1,
          1,
          1,
          1.3
        ),
        1
      );

      canvas.stroke(
        map(Math.sin(stepIndex*a+animation.sinAngle), -1, 1, 0, 360) / opacityFactor,
        map(Math.cos(stepIndex*a-animation.cosAngle), -1, 1, 0, 255) / opacityFactor,
        map(Math.sin(stepIndex*a+animation.sinAngle), -1, 1, 255, 0) / opacityFactor
      );

      canvas.strokeWeight(thickness);
      canvas.point(x, y);
    }
  }
}

sketch.draw((time, _, favoriteColor) => {
  noSmooth();
  background(100)

  drawShape( {
    canvas: canvases.buffer,
    start: createVector(width /2, -120 ),
    end: createVector(width /2, height/2+120),
    precision: 1/800,
    size: width/2
  })

  canvases.pixilated.image(canvases.buffer.get(), 0, 0, width, height/2);

  push()
    scale(1, -1);
    image(canvases.pixilated, 0, -height, width, height/2);
  pop()

  image(canvases.buffer, 0, 0, width, height/2);

  strokeWeight(2)
  stroke(favoriteColor)
  line(0, height/2, width, height/2)



  // canvases.pixilated.pixelDensity(0.085)
  canvases.pixilated.pixelDensity(mappers.circularIndex(time, [1, 1, 0.1, 0.05, 0.025, 0.085]))
  // canvases.pixilated.pixelDensity(animation.ease({
  //   values: [ 0.1, 0.01, 0.05, 0.025, 0.085],
  //   currentTime: time/2,
  //   easingFn: easing.easeInOutExpo_
  // }))

});
