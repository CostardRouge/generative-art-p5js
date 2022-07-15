import { shapes, sketch, converters, canvas, events, colors, mappers } from './utils/index.js';

sketch.setup( () => {
  frameRate(25);
  pixelDensity(1);

  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / (xCount + yCount) / 3;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
  },
  {
    width: 1080,
    height: 1920,
  }
);

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

  draw(time, index) {
    const { position, size } = this;
    push();
    translate(position.x, position.y);

    const shadowsCount = 10//map(sin(time), -1, 1, 15, 5)
    const shadowIndexStep = 0.03; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const angleStep = TAU / 6//map(sin(time), -1, 1, 6, 3);

      for (let angle = 0; angle < TAU ; angle += angleStep) {
        push()

        const angleVector = converters.polar.vector(
          angle-time,// + (index % 2 ? -time : time) * 1 - radians(7),
          size/map(shadowIndex, 0, shadowsCount, 5, 1)
        );

        translate(angleVector.x, angleVector.y);

        let linesCount = 3//map(cos(time), 0, 1, 1, 3, true);
        let opacityFactor = mappers.circularMap(
          shadowIndex,
          // 1,
          shadowsCount*4,
          map(
            sin(-time * 3 + angle * 2 ), -1, 1,
            1,
            5
          ),
          1
        );
        
        const lineMin = 0;
        const lineMax = PI;
        const lineStep = lineMax / linesCount;


        push();
        const rotationSpeed = -time * 3;
        const rotationMax = map(sin(time/2), -1, 1, 1, 5);

        rotate(
          rotationSpeed+map(shadowIndex, 0, shadowsCount, 0, rotationMax),
        );
      
        for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
          const vector = converters.polar.vector(
            lineIndex,
            // map(shadowIndex, 0, shadowsCount, 1, 150),
            map(sin(time), -1, 1, 50, 150, true)
          );
          beginShape();
          // strokeWeight(map(shadowIndex, 0, shadowsCount, 160, 10));
          // strokeWeight(2);

          const hueSpeed = -time * 1;
          const hueIndex = angle + shadowIndex / 1.5;
          const hue = color(
            map(sin(hueSpeed+hueIndex), -1, 1, 0, 360) /
              opacityFactor,
            map(sin(hueSpeed-hueIndex), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueSpeed+hueIndex), -1, 1, 360, 0) /
              opacityFactor,
              // 50
          )
      
          // fill( hue );
          stroke( hue );

          if ( shadowIndex + shadowIndexStep >= shadowsCount) {
            strokeWeight(4)
            const reduceFactor = 32;
            stroke(red(hue) -reduceFactor , green(hue) -reduceFactor , blue(hue) - reduceFactor );
          }
          else {
            // noStroke()
          }

          vertex(vector.x, vector.y);
          vertex(vector.x, vector.y);


          const wMax = map(sin(time), -1, 1, 50, 100);
          strokeWeight(map(shadowIndex, 0, shadowsCount, 0, wMax, true));

          
          // noStroke()
          // circle(vector.x, vector.y, map(shadowIndex, 0, shadowsCount, 0, wMax));
      
          endShape();
        }
        pop()


        pop()
      }
    }

    pop();
  }
}
sketch.draw((time) => {
  background(0);

  const count = 15;

  noFill()
  strokeWeight(4)
  stroke(128, 128, 255)
  const size = map(-sin(time), -1, 1, width / 6, width-10)
  const xOffset = sin(time*5) * 30;
  const yOffset = cos(time*5) * 30;
  for (let i = 2; i < count; i++) {
    
    circle(width / 2 - xOffset, height / 2 - yOffset, i * size/5 * i);
  }

  shapes.forEach((shape, index) => shape.draw(time, index));
});
