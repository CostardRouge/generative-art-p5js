const midiInputDevices = [];
const midiOutputDevices = [];

function throttle(func, wait, leading, trailing, context) {
  var ctx, args, result;
  var timeout = null;
  var previous = 0;
  var later = function () {
    previous = new Date();
    timeout = null;
    result = func.apply(ctx, args);
  };
  return function () {
    var now = new Date();
    if (!previous && !leading) previous = now;
    var remaining = wait - (now - previous);
    ctx = context || this;
    args = arguments;
    // Si la période d'attente est écoulée
    if (remaining <= 0) {
      // Réinitialiser les compteurs
      clearTimeout(timeout);
      timeout = null;
      // Enregistrer le moment du dernier appel
      previous = now;
      // Appeler la fonction
      result = func.apply(ctx, args);
    } else if (!timeout && trailing) {
      // Sinon on s’endort pendant le temps restant
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

function setup() {
  utils.canvas.create(SQUARE.HD);
  // utils.canvas.create(FILL);
  // utils.canvas.create({ height: windowWidth, width: windowWidth });
  utils.canvas.create({ width: 768, height: 1368 });
  // utils.canvas.create({ width: 700, height: 700 });


  // utils.events.fullScreenOnDoubleClick();
  utils.events.extendCanvasOnResize();
  utils.events.pauseOnSpaceKeyPressed();
  utils.events.toggleCanvasRecordingOnKey();
  utils.events.toggleFPSCounter();

  strokeWeight(0);

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

    utils.events.register("mousePressed", function () {
      shapes.forEach((shape, index) => shape.play());

      playNote(
        new Note("A4", {
          duration: 100,
          release: 0.1,
        })
      );
    });
  }
}

const playNote = throttle(playNoteLogic, 50);
// const playNote = playNoteLogic;

function playNoteLogic(note) {
  midiOutputDevices.forEach((device) => {
    device.playNote(note);
  });
}

class Dot {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();

    this.initial = this.weightRange[1];

    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
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
    const { position, shadowsCount, weightRange, opacityFactorRange } = this;

    const hueIndex = map(
      index,
      0,
      shapes.length - 1,
      -PI/2,
      PI
    )
    const hueSpeed = hueIndex + time;

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

    this.move();
  }

  move() {
    const { position, weightRange } = this;

    const h = weightRange[0]/2;    
    const w = h

    position.x = constrain(this.vx + position.x, w, width);
    position.y = constrain(this.vy + position.y, h, height);

    const widthReached = position.x + this.vx + w >= width || position.x - w + this.vx <= 0;
    const heightReached = position.y + this.vy + h >= height || position.y - h + this.vy <= 0;

    if (widthReached) {
      this.vx = -this.vx;
    }
    if (heightReached) {
      this.vy = -this.vy;
    }

    if (widthReached || heightReached) {
      this.play();
    }
  }

  play() {
    playNote(
      new Note(getRandNote(), {
        duration: 1000,
        release: 0.5,
      })
    );
  }
}

function getRandNote() {
  const note =
  random(["A", "B", "C", "D", "E", "F", "G"]) +
  random([ "1", "2", "3", "4", "5", "6"]);

  console.log(">>> " + note)
  return note
}

function draw() {
  const seconds = frameCount / 60;
  const time = seconds;

  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index));
  utils.debug.fps();
}
