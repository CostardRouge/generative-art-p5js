import { debug, recorder, options, animation } from './index.js';

const events = {
  lastEventId: 0,
  registeredEvents: {},
  handle: function (eventName, ...args) {
    if (!events.registeredEvents[eventName]) {
      return;
    }

    const results = [];

    for (const eventId in events.registeredEvents[eventName]) {
      const eventHandler = events.registeredEvents[eventName][eventId];
      const result = eventHandler?.call(eventHandler, ...args);

      results.push( result );
    }

    return results;
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
  toggleNoLoopOnSingleClick: function () {
    events.register("engine-mouse-pressed", function() {
      if (true !== options.get("pause-canvas-on-single-click")) {
        return;
      }

      events.handle("engine-toggle-loop")
    });
  },
  pauseOnSpaceKeyPressed: function () {
    events.register("engine-on-key-typed", function () {
      if (true !== options.get("pause-on-space-key-pressed")) {
        return;
      }

      if (!events.handle("engine-get-key-typed").includes(" ")) {
        return;
      }

      events.handle("engine-toggle-loop")
    });
  },
  toggleFullScreenOnDoubleClick: function () {
    events.register("engine-canvas-double-clicked", () => {
      if (true !== options.get("toggle-full-screen-on-double-click")) {
        return;
      }

      events.handle("engine-toggle-fullscreen")
    });
  },
  extendCanvasOnResize: function () {
    events.register("engine-window-resized", () => {
      if (true !== options.get("extend-canvas-on-resize")) {
        return;
      }

      events.handle("engine-fill-screen");
    });
  },
  toggleCanvasRecordingOnKey: function (onKey = "r") {
    events.register("engine-on-key-typed", function () {
      if (true !== options.get("press-r-to-record")) {
        return;
      }

      if (!events.handle("engine-get-key-typed").includes(onKey)) {
        return;
      }

      if (recorder.recording) {
        recorder.stop();
      } else {
        recorder.start(animation.maximumFramesCount);
      }
    });
  },
  toggleFPSCounterOnKeyPressed: function (onKey = "f") {
    events.register("engine-on-key-typed", function () {
      if (!events.handle("engine-get-key-typed").includes(onKey)) {
        return;
      }

      debug.toggleFPSCounter();

      return false;
    });
  },
};

export default events;
