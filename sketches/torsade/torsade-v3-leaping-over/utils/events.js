import { shapes, canvas, debug, recorder } from './index.js';

const events = {
  lastEventId: 0,
  registeredEvents: {},
  handle: function (eventName) {
    if (!events.registeredEvents[eventName]) {
      return;
    }

    for (const eventId in events.registeredEvents[eventName]) {
      events.registeredEvents[eventName][eventId]();
    }
  },
  register: function (eventName, eventFunction) {
    const eventId = "event_id_" + events.lastEventId;

    if (!events.registeredEvents[eventName]) {
      events.registeredEvents[eventName] = {};
    }

    events.registeredEvents[eventName][eventId] = eventFunction;
    events.lastEventId++;

    return () => {
      delete events.registeredEvents[eventName][eventId];
    };
  },

  toggleNoLoopOnSingleClick: function (mouseButtonKey = LEFT) {
    let stop = false;

    events.register("mousePressed", function () {
      stop = !stop;

      if (mouseButton !== mouseButtonKey) {
        return;
      }

      if (stop) {
        noLoop();
      } else {
        loop();
      }
    });
  },
  pauseOnSpaceKeyPressed: function () {
    let stop = false;

    events.register("keyTyped", function () {
      if (key !== " ") {
        return;
      }

      stop = !stop;

      if (stop) {
        noLoop();
      } else {
        loop();
      }
    });
  },
  fullScreenOnDoubleClick: function () {
    events.register("doubleClicked", canvas.fullscreen);
  },
  extendCanvasOnFullScreen: function () {
    events.register("windowResized", () => {
      if (fullscreen()) {
        canvas.resize(windowWidth, windowHeight);
      } else {
        canvas.resize();
      }

      shapes.forEach((shape) => shape.onWindowResized?.());
    });
  },
  extendCanvasOnResize: function () {
    events.register("windowResized", () => {
      canvas.resize(windowWidth, windowHeight);
    });
  },
  toggleCanvasRecordingOnKey: function (pressedKey = "r") {
    events.register("keyTyped", function () {
      if (key !== pressedKey) {
        return;
      }

      if (recorder.recording) {
        recorder.stop();
      } else {
        recorder.start();
      }
    });
  },
  toggleFPSCounter: function (pressedKey = "f") {
    events.register("keyTyped", function () {
      if (key !== pressedKey) {
        return;
      }

      debug.toggleFPSCounter();

      return false;
    });
  },
};

export default events;
