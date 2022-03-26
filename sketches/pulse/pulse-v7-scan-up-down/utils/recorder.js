import { canvas, sketch, options } from './index.js';

const recorder = {
  recording: false,
  capturer: undefined,
  createRecorder: () => {
    recorder.capturer = new CCapture({
      format: options.get('recording-format'),
      quality: "best",
      framerate: 60,
      verbose: true,
      name: sketch.name
      // format: "gif",
      // workersPath: "libraries/",
    })
  },
  start: () => {
    if (true === recorder.recording) {
      return;
    }

    recorder.createRecorder();

    recorder.recording = true;
    document.body.classList.add("recording");

    recorder.capturer.start();
  },
  stop: () => {
    recorder.recording = false;
    document.body.classList.remove("recording");

    recorder.capturer.stop();
    recorder.capturer.save();
  },
  render: () => {
    requestAnimationFrame(recorder.render);

    if (undefined === recorder.capturer) {
      return;
    }

    if (true !== recorder.recording) {
      return;
    }

    if (undefined === canvas.main) {
      return;
    }

    recorder.capturer.capture(canvas.main.elt);
  },
};

recorder.render();

export default recorder;
