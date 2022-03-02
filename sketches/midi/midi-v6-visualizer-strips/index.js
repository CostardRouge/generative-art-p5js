const midiInputDevices = [];
const midiOutputDevices = [];

utils.sketch.setup(() => {
  shapes.push(
    new Strip({
      size: 100,
      notes: {},
      noteOn: 70,
      noteOff: 20,
      start: createVector(0, height / 3),
      end: createVector(0, -height / 3),
      relativePosition: {
        x: 1/2,
        y: 1/2,
      },
    })
  );

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

    // WebMidi.outputs.forEach((device, index) => {
    //   midiOutputDevices.push(device);
    //   console.log(`OUTPUT: ${index}: ${device.name}`);
    // });

    // const myInput = WebMidi.getInputByName("IAC Driver Bus 1");
    // const myOutput = WebMidi.getOutputByName("IAC Driver Bus 1");

    midiInputDevices.forEach( input => {
      input.addListener("noteon", (e) => {
        console.log(e.note.identifier)

        shapes.forEach(shape => shape.play(e.note.identifier));
      });
    });

    utils.events.register("mousePressed", function () {
      const note = "A4"

      shapes.forEach(shape => shape.play(note));

      playNote(
        new Note(note, {
          duration: 100,
          release: 0.1
        })
      );
    });
  }
} );

function playNote(note) {
  midiOutputDevices.forEach((device) => {
    device.playNote(note);
  });
}

class Strip {
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

  notesBufferLength = 200;

  play(note) {
    this.notes[note] = this.notes[note] ?? new Array(this.notesBufferLength).fill(this.noteOff);
    // this.notes[note][ this.notesBufferLength - 3 ] = this.noteOn;
    // this.notes[note][ this.notesBufferLength - 2 ] = this.noteOn;
    this.notes[note][ this.notesBufferLength - 1 ] = this.noteOn;
  }

  updateNoteLevels() {
    if (frameCount % 3 !== 0) {
      // return;
    }

    for(const note in this.notes) {
      this.notes[note].shift()
      this.notes[note].push(this.noteOff)
      console.log(note, this.notes[note].length)
    }
  }

  draw(time, index, target) {
    // return// console.log(this.notes)
    let { position, size: s, start, end } = this;

    const hueCadence = index + time;
    const size = map(sin(time), -1, 1, s*2, s*3);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 500//map(mouseY, height, 0, 1, 800, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      let angle = lerpIndex * map(sin(time), -1, 1, 1, 10);

      // const f = map(lerpIndex, 0, 1, 1, 10);
      // const opacityFactor = map(
      //   lerpIndex,
      //   0,
      //   1,
      //   map(sin(lerpIndex * 1 + -time*5 + f), -1, 1, 1, 5),
      //   1
      // );

      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const waveIndex = angle + time;
      const xOffset = map(sin(waveIndex), -1, 1, -size, size);
      const yOffset = 0//map(cos(waveIndex), 1, -1, -size, size);

      // target.fill(
      //   map(sin(angle + lerpIndex), -1, 1, 0, 360) / opacityFactor,
      //   map(cos(angle - hueCadence), -1, 1, 0, 255) / opacityFactor,
      //   map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
      // );
      const noteIndexes = Object.keys(this.notes)
      const noteIndexesCount = 8//noteIndexes.length

      for (let noteIndex = 0; noteIndex < noteIndexesCount; noteIndex++) {
        const midW = xOffset;
        const w = map(noteIndex, 0, noteIndexesCount-1, -midW, midW);

        const x = lerp(
          lerpPosition.x + w,
          lerpPosition.x + w,
          noteIndex / noteIndexesCount
        );
        const y = lerp(
          lerpPosition.y - yOffset,
          lerpPosition.y + yOffset,
          noteIndex / noteIndexesCount
        );

        const notes = this.notes[noteIndexes[noteIndex]]
        let noteLevelIndex = map(lerpIndex, 0, 1, 0, notes?.length)
        
        noteLevelIndex = Math.ceil(noteLevelIndex)
        const noteLevel = notes[noteLevelIndex];

        // target.fill(
        //   map(sin(0 + noteIndex), -1, 1, 0, 360) / 1,
        //   map(cos(0 - noteIndex), -1, 1, 0, 255) / 1,
        //   map(sin(0 + noteIndex), -1, 1, 64, 0) / 1,
        // );

      const opacityFactor = map(
        lerpIndex,
        0,
        1,
        map(sin(lerpIndex * 15 + -time), -1, 1, 1, 15),
        1
      );

        // if (noteLevel === this.noteOn) {
          target.fill(
            map(sin(0 + hueCadence + noteIndex), -1, 1, 0, 255) / 1,
            map(cos(0 + hueCadence + noteIndex), -1, 1, 64, 255) / opacityFactor,
            map(sin(0 + hueCadence + noteIndex), -1, 1, 255, 64) / opacityFactor
          );
        // }
        // else {
        //   fill(51)
        // }

        target.circle(x, y, noteLevel);

      }
    }

    target.pop();

    this.updateNoteLevels();
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

  shapes.forEach((shape, index) => shape.draw(time, index, window));
});


// NAME
// TYPE (string, number, boolean, array, color)
// STRING TYPE: text input
// NUMBER TYPE: slider
// BOOLEAN TYPE: checkbox
// ARRAY TYPE: select
// COLOR TYPE: color picker
// DEFAULT VALUE
// DESCRIPTION
// ENABLED

// utils.options("show_").value
// utils.options("").value


// _____DEFAULT OPTIONS
// QUALITY
// SHOW FPS
// SHAPES COUNT on X
// SHAPES COUNT on Y
// SHAPES SIZE
// COLORS PALETTE
// BACKGROUND COLOR
// CLEAR COLOR
// BLUR
// TOGGLE EVENTS
// TOGGLE PANEL VISIBILITY
// TIME SPEED
// RESOLUTION
// SAVE CANVAS
// RECORD CANVAS
// PAUSE CANVAS
// RESET OVERRIDES
// SAVE OVERRIDES (LOCAL STORAGE)