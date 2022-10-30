import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
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
} );

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

    const shadowsCount = map(sin(time), -1, 1, 15, 7.5)
    const shadowIndexStep = 0.04; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const angleStep = TAU / map(sin(time), -1, 1, 5, 3);

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push()

        const angleVector = converters.polar.vector(
          angle,// + (index % 2 ? -time : time) * 1 - radians(7),
          size/map(shadowIndex, 0, shadowsCount, 4, 1)
        );

        translate(angleVector.x, angleVector.y);

        let linesCount = map(cos(angle*2-time*3), 0, 1, 1, 3, true);
        let opacityFactor = mappers.circularMap(
          shadowIndex,
          // 1,
          shadowsCount*4,
          map(
            sin(-time * 1 + angle * 2 ), -1, 1,
            5,
            1
          ),
          1
        );
        
        const lineMin = 0;
        const lineMax = PI;
        const lineStep = lineMax / linesCount;
      
        for (let lineIndex = lineMin; lineIndex < lineMax; lineIndex += lineStep) {
          const vector = converters.polar.vector(
            lineIndex,
            map(shadowIndex, 0, shadowsCount, 10, 50),
            // map(sin(shadowIndex*2+time*2), -1, 1, 1, 50, true)
            // map(lerpIndex, lerpMin, lerpMax, 1, options.get('lines-length'), true)
            );
          push();
          beginShape();
          strokeWeight(map(shadowIndex, 0, shadowsCount, 20, 80));
  
          const hueSpeed = -time * 1;

          rotate(
            -time*2+shadowIndex/2,
          );
      
          stroke(
            color(
              map(sin(hueSpeed+shadowIndex), -1, 1, 0, 360) /
                opacityFactor,
              map(sin(hueSpeed-shadowIndex), -1, 1, 360, 0) /
                opacityFactor,
              map(sin(hueSpeed+shadowIndex), -1, 1, 360, 0) /
                opacityFactor,
                // 50
            )
          );

          vertex(vector.x, vector.y);
          vertex(vector.x, -vector.y);
      
          endShape();
          pop()
        }

        pop()
      }
    }

    pop();
  }
}
sketch.draw((time) => {
  background(0);

  const count = 10;

  noFill()
  strokeWeight(4)
  stroke(128, 128, 255)
  const size = map(sin(time), -1, 1, width / 4, width-10)

  for (let i = 1; i < count; i++) {
    circle(width / 2, height / 2, i * size);
  }

  shapes.forEach((shape, index) => shape.draw(time, index));
});
