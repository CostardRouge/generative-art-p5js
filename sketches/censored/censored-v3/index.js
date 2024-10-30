let pixilatedCanvas = null;
let maskImage = null;
let masked = null;

import { shapes, sketch, events, animation, colors, mappers, easing } from './utils/index.js';

sketch.setup(() => {
  pixilatedCanvas = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );

  pixilatedCanvas.pixelDensity(0.05);
  pixilatedCanvas.noStroke();

  maskImage = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );

  events.register("windowResized", () => {
    pixilatedCanvas.width = sketch?.engine?.canvas?.width;
    pixilatedCanvas.height = sketch?.engine?.canvas?.height;
  });

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
  }
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

  draw( index, target, lerpStep = 1 / 800) {
    let { position, size, start, end } = this;

    target.push();
    target.translate(position.x, position.y);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
        const waveAmplitude = size//*mappers.fn(Math.sin(lerpIndex*2+animation.sinAngle*5), -1, 1, 0.8, 1.25, easing.easeInOutBack)

        const f = 50
        const opacityFactor = map(
          lerpIndex,
          0,
          1,
          map(
            Math.sin(lerpIndex*f + animation.sinAngle * 3),
            -1,
            1,
            1,
            2
          ),
          1
        );

      
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);

      const xOffset = waveAmplitude*2.5
      const yOffset = mappers.fn(
        Math.cos(animation.cosAngle*3+lerpIndex*3), -1, 1, -waveAmplitude, waveAmplitude,
        easing.easeInOutSine
      );

      const s = mappers.fn(Math.sin(animation.sinAngle+8 * lerpIndex*2), -1, 1, 20, 90, easing.easeInOutQuad);
      const c = 8//mappers.fn(Math.sin(animation.sinAngle **lerpIndex), -1, 1, 2, 6, easing.easeInOutExpo);

      for (let i = 0; i <= c; i++) {
        const x = lerp(
          lerpPosition.x - xOffset,
          lerpPosition.x + xOffset,
          i / c
        );
        const y = lerp(
          lerpPosition.y - yOffset,
          lerpPosition.y + yOffset,
          i / c
        );

        const a = lerpIndex*lerpIndex*8+i;

        target.fill(
          // colors.rainbow({
          //   hueOffset: i*2,
          //   hueIndex: map(noise(lerpIndex, x/width, y/height), 0, 1, -PI, PI)*2,
          //   opacityFactor
          // })
          map(Math.sin(lerpIndex*a+animation.sinAngle), -1, 1, 0, 360) / opacityFactor,
          map(Math.cos(lerpIndex*a-animation.cosAngle*2), -1, 1, 0, 255) / opacityFactor,
          map(Math.sin(lerpIndex*a+animation.sinAngle), -1, 1, 255, 0) / opacityFactor
        );

        target.circle(x, y, s);
      }
    }

    target.pop();
  }
}

sketch.draw(() => {
  noStroke();
  noSmooth();
  background(0);

  shapes[0].draw(1, window, 1 / 800);

  // return;

  pixilatedCanvas.background(0);
  shapes[0].draw(1, pixilatedCanvas, 1 / 300);

  // pixilatedCanvas.background(0, 0, 0, 32);

  const position = createVector(
    mouseX,
    mouseY
  );

  const strokeSize = 3;
  const w = width/2;
  const h = height*2;

  // position.x = width/2
  // position.y = map(cos(animation.cosAngle), -1, 1, 0, height)

  // position.x = map(sin(animation.sinAngle), -1, 1, w/2+strokeSize/2, width-w/2-strokeSize/2)
  // position.y = map(cos(animation.cosAngle/3), -1, 1, h/2+strokeSize/2, height-h/2-strokeSize/2)

  position.x = 0//map(sin(animation.sinAngle), -1, 1, 20, width-20)
  position.x = map(sin(animation.sinAngle*2), -1, 1, 20, width-20)
  position.y = map(cos(animation.cosAngle*2), -1, 1, 20, height-20)

  maskImage.erase();
  maskImage.rect(0, 0, width, height);
  maskImage.noErase();

  maskImage.beginShape();
  maskImage.vertex(position.x-w/2, position.y-h/2);
  maskImage.vertex(position.x+w/2, position.y-h/2);
  maskImage.vertex(position.x+w/2, position.y+h/2);
  maskImage.vertex(position.x-w/2, position.y+h/2);
  maskImage.endShape(CLOSE);

  ( masked = pixilatedCanvas.get()).mask(maskImage);
  image(masked, 0, 0);

  noFill();
  stroke(128, 128, 255);
  stroke(128, 128, 255);
  strokeWeight(strokeSize);

  beginShape();
  vertex(constrain(position.x-w/2, 0, width), constrain(position.y-h/2, 0, height));
  vertex(constrain(position.x+w/2, 0, width), constrain(position.y-h/2, 0, height));
  vertex(constrain(position.x+w/2, 0, width), constrain(position.y+h/2, 0, height));
  vertex(constrain(position.x-w/2, 0, width), constrain(position.y+h/2, 0, height));
  endShape(CLOSE);
});
