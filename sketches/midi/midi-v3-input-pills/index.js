import { shapes, sketch, midi, events, colors, mappers } from './utils/index.js';

events.register( "post-setup", midi.setup );

sketch.setup(() => {
  rectMode(CENTER);

  const xCount = 1;
  const yCount = 10;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Dot({
          shadowsCount: 10,
          weightRange: [250, 15],
          opacityFactorRange: [7, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

    events.register("engine-mouse-pressed", function () {
      shapes.forEach(shape => shape.bounce());
    });

    midi.on( {
      //identifier: "A6"
    }, note => {
      const assignedShapes = shapes.filter( shape => shape.note === note.identifier);

      if ( assignedShapes.length !== 0 ) {
        return assignedShapes[0].bounce( note.attack );
      }

      const unAssignedShapes = shapes.filter( shape => shape.note === undefined );

      if ( unAssignedShapes.length !== 0 ) {
        unAssignedShapes[0].note = note.identifier;
        unAssignedShapes[0].bounce( note.attack  );
      }
    } )

    midi.on( 0, console.log )
    midi.off( 0, console.log )
} );

class Dot {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();

    this.initial = this.weightRange[1];
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
    const { note, position, shadowsCount, weightRange, opacityFactorRange } = this;

    if (undefined === note) {
      return
    }

    const hueIndex = map(
      index,
      0,
      shapes.length - 1,
      -PI/2,
      PI
    )
    const hueSpeed = hueIndex// + time;

    for (let shadowIndex = 0; shadowIndex < shadowsCount; shadowIndex++) {
      const opacity = map(
        shadowIndex,
        0,
        shadowsCount - 1,
        128,
        255
      )

      const weight = map(
        shadowIndex,
        0,
        shadowsCount -1,
        weightRange[0],
        weightRange[1]
      );
      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount - 1,
        opacityFactorRange[0],
        opacityFactorRange[1]
      );

      const tint = colors.rainbow({
        // hueOffset: time,
        hueIndex,
        opacityFactor
      })

      fill(tint)

      // circle(position.x, position.y, weight);
      // ellipse(position.x, position.y, width, weight);
      rect(position.x, position.y, weight*3, 100, 0);
    }

    this.weightRange[1] = lerp(this.weightRange[1], this.initial, 0.07);
  }

  bounce( attack ) {
    this.weightRange[1] = this.weightRange[0] * attack
  }
}

function getRandNote() {
  const note =
  random(["A", "B", "C", "D", "E", "F", "G"]) +
    random([ "1", "2", "3", "4", "5", "6"]);

    console.log(">>>" + note)
  return random(["A", "B", "C", "D", "E", "F", "G"]) + "4"//random([ "1", "2", "3", "4", "5", "6"])
}

sketch.draw( time => {
  background(0, 0, 0, 65);

  shapes.forEach((shape, index) => shape.draw(time, index));
});
