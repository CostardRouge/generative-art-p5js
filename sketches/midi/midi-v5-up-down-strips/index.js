const midiInputDevices = [];
const midiOutputDevices = [];

function setup() {
  utils.canvas.create(SQUARE.HD);
  // utils.canvas.create(FILL);
  // utils.canvas.create({ height: windowWidth, width: windowWidth });
  utils.canvas.create({ width: 768, height: 1368 });
  // utils.canvas.create({ width: 700, height: 700 });

  //utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleCanvasRecordingOnKey();
  utils.events.toggleFPSCounter();

  noStroke();

  shapes.push(
    new Strip({
      size: 100,
      notes: {},
      shadowsCount: 5,
      weightRange: [150, 15],
      opacityFactorRange: [7, 1],
      start: createVector(0, -height / 3),
      end: createVector(0, height / 3),
      relativePosition: {
        x: 1/2,
        y: 1/2,
      },
    })
  );
}

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

  play(note) {
    this.notes[note] = this.notes[note] || [];
    this.notes[note] = [
      ...this.notes[note],
      100
    ];
  }

  updateNoteLevels() {
    for(const note in this.notes) {
      // this.notes[note] = lerp(this.notes[note], 70, 0.1);
      this.notes[note].slice(-20)
    }
  }

  draw(time, index, target) {
    // return// console.log(this.notes)
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size//map(sin(time*2), -1, 1, 1, 2);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 500;

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = lerpIndex * 2;

      const f = map(lerpIndex, 0, 1, 1, map(sin(time), -1, 1, 1, 5));
      const opacityFactor = map(
        lerpIndex,
        0,
        1,
        map(sin(lerpIndex * 10 + time*10 + f), -1, 1, 1, 10),
        1
      );

      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-time + lerpIndex + index);
      waveIndex = angle - time * 2;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), 1, -1, -waveAmplitude*2, waveAmplitude*2);

      target.fill(
        map(sin(angle + lerpIndex), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle - hueCadence), -1, 1, 64, 255) / opacityFactor,
        map(sin(angle + hueCadence), -1, 1, 255, 64) / opacityFactor
      );
      
      const noteIndexes = Object.keys(this.notes)
      const noteIndexesCount = 7//noteIndexes.length

      for (let noteIndex = 0; noteIndex < noteIndexesCount; noteIndex++) {
        const x = lerp(
          lerpPosition.x - xOffset * map(sin(waveIndex), -1, 1, -1, 1),
          lerpPosition.x + xOffset * 6,
          noteIndex / noteIndexesCount
        );
        const y = lerp(
          lerpPosition.y - yOffset * 10,
          lerpPosition.y + yOffset,
          noteIndex / noteIndexesCount
        );

        target.circle(x, y, 100 );
      }
    }

    target.pop();
  }
}

utils.sketch.draw( time => {
  background(0);
  shapes.forEach((shape, index) => shape.draw(time, index, window));
});