import { shapes, canvas, debug, recorder, options } from './index.js';

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
  // GENERAL SKETCH EVENTS
  toggleNoLoopOnSingleClick: function (mouseButtonKey = LEFT) {
    events.register("mousePressed", function () {
      if (true !== options.get("pause-canvas-on-single-click")) {
        return;
      }

      if (mouseButton !== mouseButtonKey) {
        return;
      }

      canvas.toggleNoLoop()
    });
  },
  pauseOnSpaceKeyPressed: function () {
    events.register("keyTyped", function () {
      if (true !== options.get("pause-on-space-key-pressed")) {
        return;
      }

      if (key !== " ") {
        return;
      }

      canvas.toggleNoLoop()
    });
  },
  toggleFullScreenOnDoubleClick: function () {
    events.register("doubleClicked", () => {
      if (true !== options.get("toggle-full-screen-on-double-click")) {
        return;
      }

      canvas.fullscreen();
    });
  },
  extendCanvasOnFullScreen: function () {
    events.register("windowResized", () => {
      if (true !== options.get("extend-canvas-on-fullscreen")) {
        return;
      }

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
      if (true !== options.get("extend-canvas-on-resize")) {
        return;
      }

      canvas.resize(windowWidth, windowHeight);
    });
  },
  toggleCanvasRecordingOnKey: function (pressedKey = "r") {
    events.register("keyTyped", function () {
      if (true !== options.get("press-r-to-record")) {
        return;
      }

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
  toggleFPSCounterOnKeyPressed: function (pressedKey = "f") {
    events.register("keyTyped", function () {
      if (key !== pressedKey) {
        return;
      }

      debug.toggleFPSCounter();

      return false;
    });
  },
};

window.keyTyped = () => {
  events.handle("keyTyped");
}
window.keyPressed = () => {
  events.handle("keyPressed");
}
window.mousePressed = () => {
  events.handle("mousePressed");
}
window.mouseDragged = () => {
  events.handle("mouseDragged");
}
window.mouseReleased = () => {
  events.handle("mouseReleased");
}
// window.doubleClicked = () => {
//   events.handle("doubleClicked");
// }
window.windowResized = () => {
  events.handle("windowResized");
}

export default events;
