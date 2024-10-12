import { sketch, options, debug, animation } from './index.js';

const recorder = {
  savedFramesCount: 0,
  recording: false,
  capturer: undefined,
  createRecorder: () => {
    recorder.capturer = new CCapture({
      format: options.get('recording-format'),
      quality: "best",
      framerate: options.get('recording-framerate'),
      verbose: false,
      name: sketch.name,
      workersPath: "libraries/",
    })
  },
  start: (maximumFrames) => {
    if (true === recorder.recording) {
      return;
    }

    if (maximumFrames) {
      animation.time = 0;

      console.log(animation);
      

      if (!document.getElementById('recording-progression')) {
        const progressBar = document.createElement('div')
        
        progressBar.id = 'recording-progression';

        document.getElementsByTagName('main')[0].prepend(progressBar);
      }
    }

    recorder.recording = true;

    recorder.createRecorder();
    recorder.capturer.start();

    recorder.savedFramesCount = 0;
    recorder.maximumFrames = maximumFrames;

    document.body.classList.add("recording");
  },
  stop: () => {
    recorder.recording = false;
    recorder.maximumFrames = undefined;

    document.body.classList.remove("recording");

    recorder.capturer.stop();
    recorder.capturer.save();
  },
  render: () => {
    requestAnimationFrame(recorder.render);

    // console.log(animation );
    

    debug.createElement( "body", "recorder-saved-frames", () => {
      if (recorder.maximumFrames) {
        return `${recorder.savedFramesCount} / ${recorder.maximumFrames}`
      }

      return recorder.savedFramesCount
    }, !recorder.recording)

    if (recorder.maximumFrames && document.getElementById('recording-progression')) {
      document.getElementById('recording-progression').style.width = (recorder.savedFramesCount / recorder.maximumFrames) * 100 + '%';
    }

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

    if (recorder.maximumFrames === recorder.savedFramesCount) {
      recorder.stop();
      requestAnimationFrame(recorder.render);
      return;
    }

    recorder.capturer.capture(canvasElement);
    recorder.savedFramesCount++;
  },
};

recorder.render();

export default recorder;
