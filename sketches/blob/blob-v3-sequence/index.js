import { shapes, sketch, converters, animation, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "start-size",
    type: 'slider',
    label: 'Start size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 50,
    category: 'Integers'
  },
  {
    id: "end-size",
    type: 'slider',
    label: 'End size',
    min: 1,
    max: 300,
    step: 10,
    defaultValue: 15,
    category: 'Integers'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
    category: 'Integers'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Integers'
  },
  {
    id: "size-ratio",
    type: 'number',
    label: 'Size ratio',
    min: 1,
    max: 10,
    defaultValue: 6,
    category: 'Integers'
  }
] );

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount - 0.25 ),
          },
        })
      );
    }
  }
});

class Spiral {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();

    this.falling = true;
  }

  calculateRelativePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    //this.calculateRelativePosition();
  }

  draw(time, index) {
    const { position } = this;
    push();
    const m = 200;
    translate(
      constrain(position.x, m, width - m),
      constrain(position.y, m, height - m),
    );

    const shadowsCount = 2//map(cos(index+time*3)+sin(-time+index), -1, 1, 1, 2, true)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);
    const positions = [
      createVector( width /2, m ),
      createVector( width - m, height / 2 ),
      createVector( width /2, height -m ),
      createVector( m, height /2  ),
    ];

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const size = map(
        shadowIndex,
        0,
        shadowsCount,
        options.get("start-size"),
        options.get("end-size")
      );

      let opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(-time  + shadowIndex ), -1,  1,
          // shadowIndex, 0, shadowsCount,
          options.get("start-opacity-factor"),
          options.get("start-opacity-factor") * 4
        ),
        options.get("end-opacity-factor")
      );

      opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(-time * 1 + shadowIndex * 3 ), -1, 1,
          options.get("start-opacity-factor"),
          options.get("start-opacity-factor")
        ),
        options.get("end-opacity-factor")
      );

      const x = 0
      // const y = sinmap(shadowIndex, 0, shadowsCount, -2.5, 2.5);
      const y = sin(time) * cos(time) * 2

      this.position = animation.sequence(
        "position",
        shadowIndex+time/2,
        positions,
        0.05,
        p5.Vector.lerp
      );

      translate(
        x,
        y,
      );

      const angleCount = map(sin(shadowIndex*1.5+time*2), -1, 1, 6, 7.5);
      const angleStep = TAU / angleCount;

      for (let angle = 0; angle < TAU; angle += angleStep) {
        const vector = converters.polar.vector(
          angle,
          size * options.get("size-ratio")
        );
        push();

        beginShape();
        strokeWeight(size);

        rotate(angle*2+radians(angle*20)+time);
        // rotate(sin(time+0+shadowIndex));

        const hueSpeed = -time

        stroke(
          color(
            map(sin(hueSpeed+shadowIndex*5), -1, 1, 0, 360) /
              opacityFactor,
            map(sin(hueSpeed-shadowIndex*5), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(hueSpeed+shadowIndex*5), -1, 1, 360, 0) /
              opacityFactor,
              mappers.circularMap(shadowIndex, shadowsCount, 0, 255)
          )
        );
        
        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);

        endShape();
        pop();
      }
    }

    pop();


    //this.update()
  }

  update() {
    if ( this.falling ) {
      this.position.y += 3;

      // end move
      if ( this.position.y > height * 3/4 ) {
        this.falling = false;
        this.target = createVector(width/2, height/4);
      }
    } else {
      this.position = p5.Vector.lerp(this.position, this.target, 0.05)

      // start move
      if ( this.position.dist( this.target ) < 10 ) {
        this.falling = true;
      }
    }
  }
}

function drawGrid(xCount, yCount, time) {
  let drawn = false;

  const xSize = width / xCount;
  const ySize = height / yCount;

  rectMode(CENTER);
  stroke(128, 128, 255
    // map(sin(time), -1, 1, 0, 100)
    );
  // fill(255)

  const offset = -1;
  const xx = xSize / 2// * sin(time)
  const yy = 100 * time

  strokeWeight(2)


  for (let x = offset; x <= xCount - offset; x++) {
    for (let y = offset; y <= yCount - offset; y++) {
      line(0, (yy + y * ySize) % height, width, (y * ySize + yy) % height);
      line((xx + x * xSize) % width, 0, (xx + x * xSize) % width, height);

      if (drawn) {
        continue;
      }
      // if ( mouseX > x * xSize && mouseX < (x + 1) * xSize &&
      //      mouseY > y * ySize && mouseY < (y + 1) * ySize ) {
      //       strokeWeight(0)
      //   rect(( x + 1/2 ) * (xSize), ( y + 1/2) * ySize, xSize-8, ySize-8);
      //   drawn = true;
      // }
    }
  }
}

sketch.draw((time) => {
  background(0);

  const w = animation.sequence(
    "w",
    time/2,
    [
      3, 1, 2
    ],
    0.05
  );

  const h = animation.sequence(
    "h",
    time/2,
    [
      1, 4, 2
    ],
    0.05
  );

  drawGrid(w, h, time*1.75);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
