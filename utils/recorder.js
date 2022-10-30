import { sketch, options, debug } from './index.js';

const recorder = {
  savedFramesCount: 0,
  recording: false,
  capturer: undefined,
  createRecorder: () => {
    recorder.capturer = new CCapture({
      format: options.get('recording-format'),
      quality: "best",
      framerate: options.get('recording-framerate'),
      verbose: true,
      name: sketch.name,
      workersPath: "libraries/",
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

    recorder.savedFramesCount = 0;
  },
  stop: () => {
    recorder.recording = false;
    document.body.classList.remove("recording");

    recorder.capturer.stop();
    recorder.capturer.save();
  },
  render: () => {
    requestAnimationFrame(recorder.render);

    debug.createElement( "body", "recorder-saved-frames", () => recorder.savedFramesCount, !recorder.recording)

    if (undefined === recorder.capturer) {
      return;
    }

    if (true !== recorder.recording) {
      return;
    }

    const canvasElement = sketch?.engine?.getCanvasElement();

    if (undefined === canvasElement) {
      return;
    }

    recorder.capturer.capture(canvasElement);
    recorder.savedFramesCount++;
  },
};

recorder.render();

export default recorder;
