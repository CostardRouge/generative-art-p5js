let pixilatedCanvas = null;
let maskImage = null;
let masked = null;

import { shapes, sketch, events, animation, colors, mappers, easing, grid } from './utils/index.js';

sketch.setup(() => {
  pixilatedCanvas = createGraphics(
    sketch?.engine?.canvas?.width,
    sketch?.engine?.canvas?.height
  );

  pixilatedCanvas.pixelDensity(0.025);
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

  draw( target, lerpStep = 1 / 800) {
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

      const s = mappers.fn(Math.sin(animation.sinAngle+ lerpIndex*32), -1, 1, 20, 120, easing.easeInOutQuad);
      const a = map(Math.cos(animation.sinAngle+lerpIndex), -1, 1, 1, 8);
      const c = mappers.fn(Math.sin(animation.sinAngle+a), -1, 1, 2, a, easing.easeInOutSine);

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
          x1+y1,
          -x1+y1,
          i / c
        );
        const y = lerp(
          y1+x1,
          -y1+x1,
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

const noiseCheck = ({x, y}) => noise(x/width+Math.sin(animation.sinAngle), y/height+Math.cos(animation.cosAngle));

sketch.draw(() => {
  noStroke();
  noSmooth();
  background(200);

  noiseSeed(4321)
  noiseDetail(4, 0.33)

  shapes[0].draw(window, 1 / 800);
  pixilatedCanvas.background(0);
  shapes[0].draw(pixilatedCanvas, 1 / 200);

  const columns = 20
  const rows = columns*height/width;

  const gridOptions = {
    rows,
    columns,
    centered: 1,
    topLeft: createVector( 0, 0 ),
    topRight: createVector( width, 0 ),
    bottomLeft: createVector( 0, height),
    bottomRight: createVector( width, height )
  }

  const { cells, corners, cellWidth, cellHeight } = grid.create( gridOptions );

  const getCell = (column, row) => {
    return cells.find(cell => cell.column === column && cell.row === row)
    return cells[ ( x ) * rows * y ];
  }

  maskImage.erase();
  maskImage.rect(0, 0, width, height);
  maskImage.noErase();

  push();
  cells.forEach((cell, index) => {
    const {center, xIndex, yIndex, x, y} = cell;

    cell.on = noiseCheck(cell) > .5;

    if (cell.on) {
      maskImage.beginShape();
      maskImage.vertex(center.x-cellWidth/2, center.y-cellHeight/2);
      maskImage.vertex(center.x+cellWidth/2, center.y-cellHeight/2);
      maskImage.vertex(center.x+cellWidth/2, center.y+cellHeight/2);
      maskImage.vertex(center.x-cellWidth/2, center.y+cellHeight/2);
      maskImage.endShape(CLOSE);
    }
  })
  pop();

  ( masked = pixilatedCanvas.get()).mask(maskImage);
  image(masked, 0, 0);

  noFill();
  strokeWeight(1);
  stroke(128, 128, 255);

  // push()
  // cells.forEach(({on, ...cell}, index) => {
  //   if (on) {
  //     const {center, column, row} = cell;

  //     const right = getCell(column+1, row);
  //     if (right?.on === false) {
  //        // right
  //       beginShape();
  //       vertex(constrain(center.x+cellWidth/2, 0, width), constrain(center.y-cellHeight/2, 0, height));
  //       vertex(constrain(center.x+cellWidth/2, 0, width), constrain(center.y+cellHeight/2, 0, height));
  //       endShape(CLOSE);
  //     }

  //     const bottom = getCell(column, row+1);
  //     if (bottom?.on === false) {
  //       // bottom
  //       beginShape();
  //       vertex(constrain(center.x-cellWidth/2, 0, width), constrain(center.y+cellHeight/2, 0, height));
  //       vertex(constrain(center.x+cellWidth/2, 0, width), constrain(center.y+cellHeight/2, 0, height));
  //       endShape(CLOSE);
  //     }
  
  //     const left = getCell(column-1, row)
  //     if (left?.on === false) {
  //       // left
  //       beginShape();
  //       vertex(constrain(center.x-cellWidth/2, 0, width), constrain(center.y-cellHeight/2, 0, height));
  //       vertex(constrain(center.x-cellWidth/2, 0, width), constrain(center.y+cellHeight/2, 0, height));
  //       endShape(CLOSE);
  //     }
  
  //     const top = getCell(column, row-1);
  //     if (top?.on === false) {
  //       // top
  //       beginShape();
  //       vertex(constrain(center.x-cellWidth/2, 0, width), constrain(center.y-cellHeight/2, 0, height));
  //       vertex(constrain(center.x+cellWidth/2, 0, width), constrain(center.y-cellHeight/2, 0, height));
  //       endShape(CLOSE);
  //     }
  //   }
  // })
  // pop();
});
