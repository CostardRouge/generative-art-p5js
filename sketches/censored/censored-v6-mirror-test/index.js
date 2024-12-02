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
    duration: 10
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


sketch.draw((time) => {
  noSmooth();
  background(100)

  canvases.buffer.noStroke()
  canvases.buffer.background(200)
  shapes[0].draw(canvases.buffer, 1 / 800);

  canvases.pixilated.image(canvases.buffer.get(), 0, 0, width, height/2);

  image(canvases.buffer, 0, 0, width, height/2);

  scale(1, -1);
  image(canvases.pixilated, 0, -height, width, height/2);


  canvases.pixilated.pixelDensity(0.05)
  // canvases.pixilated.pixelDensity(mappers.circularIndex(time*2, [1, 1, 0.1, 0.01, 0.05, 0.025, 0.085]))
  // canvases.pixilated.pixelDensity(animation.ease({
  //   values: [ 0.1, 0.01, 0.05, 0.025, 0.085],
  //   currentTime: time/2,
  //   easingFn: easing.easeInOutExpo
  // }))

});
