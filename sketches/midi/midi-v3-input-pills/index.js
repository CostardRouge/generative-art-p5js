// const midiInputDevices = [];
// const midiOutputDevices = [];

import { shapes, sketch, midi, events, colors, mappers } from './utils/index.js';

events.register( "post-setup", midi.setup );

sketch.setup(() => {
  rectMode(CENTER);
  
  const xCount = 1;
  const yCount = 7;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Dot({
          shadowsCount: 5,
          weightRange: [150, 15],
          opacityFactorRange: [7, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

  // WebMidi.enable()
  //   .then(onEnabled)
  //   .catch((err) => alert(err));

  // function onEnabled() {
  //   if (WebMidi.inputs.length < 1) {
  //     return console.log("No device detected.");
  //   }

  //   WebMidi.inputs.forEach((device, index) => {
  //     midiInputDevices.push(device);
  //     console.log(`INPUT: ${index}: ${device.name}`);
  //   });

  //   WebMidi.outputs.forEach((device, index) => {
  //     midiOutputDevices.push(device);
  //     console.log(`OUTPUT: ${index}: ${device.name}`);
  //   });

  //   // const myInput = WebMidi.getInputByName("IAC Driver Bus 1");
  //   // const myOutput = WebMidi.getOutputByName("IAC Driver Bus 1");

  //   midiInputDevices.forEach( input => {
  //     input.addListener("noteon", (e) => {
  //       const assignedShapes = shapes.filter( shape => shape.note === e.note.identifier);

  //       if ( assignedShapes.length !== 0 ) {
  //         return assignedShapes[0].bounce();
  //       }

  //       const unAssignedShapes = shapes.filter( shape => shape.note === undefined );

  //       if ( unAssignedShapes.length !== 0 ) {
  //         unAssignedShapes[0].note = e.note.identifier;
  //         unAssignedShapes[0].bounce();
  //       }
  //     });
  //   });

    events.register("engine-mouse-pressed", function () {
      shapes.forEach(shape => shape.bounce());
    });

    midi.on( "A", console.log )
    midi.off( "A", console.log )

  // }
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
    const { note, position, shadowsCount, weightRange, opacityFactorRange } =
      this;

    if (undefined === note) {
    // return
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

  bounce() {
    this.weightRange[1] = this.weightRange[0] / 1.5;
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
