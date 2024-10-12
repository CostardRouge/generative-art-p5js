let pixilatedCanvas = null;
let maskImage = null;
let masked = null;

import { shapes, sketch, events, animation } from './utils/index.js';

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

  //  for (let x = 1; x <= xCount; x++) {
  //    for (let y = 1; y <= yCount; y++) {
  //      shapes.push(
  //        new Spiral({
  //          size,
  //          start: createVector(-width / 3, 0),
  //          end: createVector(width / 3, 0),
  //          relativePosition: {
  //            x: x / (xCount + 1),
  //            y: y / (yCount + 1),
  //          },
  //        })
  //      );
  //    }
  //  }
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

    const hueCadence = index + animation.time;
    const waveAmplitude = size / 1.5//map(sin(animation.sinAngle), -1, 1, 1, 2);

    target.push();
    target.translate(position.x, position.y);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
        const f = 18
        const opacityFactor = map(
          lerpIndex,
          0,
          1,
          map(
            sin(lerpIndex*f + animation.sinAngle * 3),
            -1,
            1,
            1,
            2
          ),
          1
        );

      let angle = map(
        lerpIndex,
        0,
        1.5,
        map(sin(animation.sinAngle / 2), -1, 1, -TAU, TAU),
        -map(cos(animation.cosAngle / 2), -1, 1, -TAU, TAU)
      );
      angle *= (index % 2 === 0 ? 1 : -1);
      
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-animation.sinAngle + lerpIndex + index);

      waveIndex = angle// + time * 2;

      const xOffset = map(sin(angle), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(angle), 1, -1, -waveAmplitude, waveAmplitude);

      target.fill(
        map(sin(angle + hueCadence*4), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle - hueCadence*4), -1, 1, 0, 255) / opacityFactor,
        map(sin(angle + hueCadence*4), -1, 1, 255, 0) / opacityFactor
      );

      const s = map(sin(animation.sinAngle + waveIndex + lerpIndex), -1, 1, 50, 140);
      const c = map(sin(animation.sinAngle + lerpIndex * waveIndex), -1, 1, 1, 4);

      target.translate(map(sin(lerpIndex*4+animation.time), -1, 1, -1, 1), 0);

      for (let i = 0; i < c; i++) {
        const x = lerp(
          lerpPosition.x + xOffset*2,
          lerpPosition.x - xOffset*2,
          i / c
        );
        const y = lerp(
          lerpPosition.y + yOffset,
          lerpPosition.y - yOffset,
          i / c
        );

        target.circle(x, y, s);
      }

      // target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, 50);
      // target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, 50);
    }

    target.pop();
  }
}

sketch.draw(() => {
  noStroke();
  noSmooth();
  background(0);


  shapes[0].draw(1, window, 1 / 400);

  pixilatedCanvas.background(0);
  shapes[0].draw(1, pixilatedCanvas, 1 / 400);

  // pixilatedCanvas.background(0, 0, 0, 32);

  const position = createVector(
    mouseX,
    mouseY
  );

  const strokeSize = 3;
  const w = 500;
  const h = w;


  // position.x = width/2
  // position.y = map(cos(animation.cosAngle), -1, 1, 0, height)

  // position.x = map(sin(animation.sinAngle), -1, 1, w/2+strokeSize/2, width-w/2-strokeSize/2)
  // position.y = map(cos(animation.cosAngle/3), -1, 1, h/2+strokeSize/2, height-h/2-strokeSize/2)

  // position.x = map(sin(animation.sinAngle), -1, 1, 20, width-20)
  // position.y = map(cos(animation.cosAngle/3), -1, 1, 20, height-20)

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
  strokeWeight(strokeSize);

  beginShape();
  vertex(constrain(position.x-w/2, 0, width), constrain(position.y-h/2, 0, height));
  vertex(constrain(position.x+w/2, 0, width), constrain(position.y-h/2, 0, height));
  vertex(constrain(position.x+w/2, 0, width), constrain(position.y+h/2, 0, height));
  vertex(constrain(position.x-w/2, 0, width), constrain(position.y+h/2, 0, height));
  endShape(CLOSE);
});
