const midiInputDevices = [];
const midiOutputDevices = [];

utils.sketch.setup(() => {
  const xCount = 3;
  const yCount = 5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Dot({
          shadowsCount: 5,
          weightRange: [150, 50],
          opacityFactorRange: [7, 1],
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }

  WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert(err));

  function onEnabled() {
    if (WebMidi.inputs.length < 1) {
      return console.log("No device detected.");
    }

    WebMidi.inputs.forEach((device, index) => {
      midiInputDevices.push(device);
      console.log(`INPUT: ${index}: ${device.name}`);
    });

    WebMidi.outputs.forEach((device, index) => {
      midiOutputDevices.push(device);
      console.log(`OUTPUT: ${index}: ${device.name}`);
    });

    // const myInput = WebMidi.getInputByName("IAC Driver Bus 1");
    // const myOutput = WebMidi.getOutputByName("IAC Driver Bus 1");

    midiInputDevices.forEach( input => {
      input.addListener("noteon", (e) => {
        const assignedShapes = shapes.filter( shape => shape.note === e.note.identifier);

        if ( assignedShapes.length !== 0 ) {
          return assignedShapes[0].bounce();
        }

        const unAssignedShapes = shapes.filter( shape => shape.note === undefined );

        if ( unAssignedShapes.length !== 0 ) {
          unAssignedShapes[0].note = e.note.identifier;
          unAssignedShapes[0].bounce();
        }
      });
    });

    utils.events.register("mousePressed", function () {
      shapes.forEach(shape => shape.bounce());

      playNote(
        new Note("A4", {
          duration: 100,
          release: 0.1,
        })
      );
    });
  }
} )

function playNote(note) {
  midiOutputDevices.forEach((device) => {
    device.playNote(note);
  });
}

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

      fill(
        map(sin(hueSpeed), -1, 1, 0, 360) / opacityFactor,
        map(cos(hueSpeed), -1, 1, 0, 360) / opacityFactor,
        map(sin(hueSpeed), -1, 1, 360, 0) / opacityFactor,
        opacity
      );
      circle(position.x, position.y, weight);
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

utils.sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index));
});
