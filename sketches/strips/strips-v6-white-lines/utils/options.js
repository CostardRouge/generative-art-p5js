import SketchUI from '../libraries/sketch-ui.es.js';

import { canvas, recorder, debug, sketch } from './index.js';

const getDefaultOptions = () => [
  {
    id: 'pause-canvas-on-single-click',
    type: 'switch',
    label: 'Pause canvas on single click',
    defaultValue: false,
    category: 'Events'
  },
  {
    id: 'press-r-to-record',
    type: 'switch',
    label: 'Press R to record',
    defaultValue: true,
    category: 'Events'
  },
  {
    id: 'pause-on-space-key-pressed',
    type: 'switch',
    label: 'Pause canvas on space key',
    defaultValue: true,
    category: 'Events'
  },
  {
    id: 'press-f-to-toggle-fps-counter',
    type: 'switch',
    label: 'Press F to toggle FPS counter',
    defaultValue: true,
    category: 'Events'
  },
  {
    id: 'extend-canvas-on-full-screen',
    type: 'switch',
    label: 'Extend canvas on full screen',
    defaultValue: false,
    category: 'Events'
  },
  {
    id: 'extend-canvas-on-resize',
    type: 'switch',
    label: 'Extend canvas on resize',
    defaultValue: false,
    category: 'Events'
  },
  {
    id: 'toggle-full-screen-on-double-click',
    type: 'switch',
    label: 'Toggle full screen on double click',
    defaultValue: true,
    category: 'Events'
  },
  {
    id: 'show-fps',
    type: 'switch',
    label: 'Show framerate',
    defaultValue: debug.options.fps.display,
    category: 'Debug'
  },
  {
    id: 'pixel-density',
    type: 'number',
    label: 'Pixel density',
    min: 0.1,
    max: 4,
    precision: 1,
    step: 0.1,
    defaultValue: pixelDensity(),
    category: 'Debug'
  },
  {
    id: 'smooth-pixel',
    type: 'switch',
    label: 'Smooth pixel',
    defaultValue: true,
    category: 'Debug'
  },
  {
    id: 'framerate',
    type: 'slider',
    label: 'Framerate',
    defaultValue: 60,
    min: 1,
    max: 120,
    marks: [
      { value: 20, label: '20 fps' },
      { value: 60, label: '60 fps' },
      { value: 100, label: '100 fps' },
    ],
    category: 'Debug'
  },
  {
    id: 'time-speed',
    type: 'slider',
    label: 'General time speed',
    defaultValue: 1,
    step: 0.1,
    min: -3,
    max: 3,
    marks: [
      { value: -3, label: '-3' },
      { value: 0, label: 'stop' },
      { value: 3, label: '3' },
    ],
    category: 'Debug'
  },
  {
    type: 'button',
    text: 'Toggle fullscreen',
    icon: 'ScreenShare',
    onClick: () => canvas.fullscreen(),
    category: 'Canvas'
  },
  {
    id: "canvas-size",
    type: 'select',
    label: 'Canvas size',
    defaultValue: '768x1366',
    onChange: value => {
      let [width, height] = value.split('x').map(Number);
      
      if (value === 'fill') {
        width = windowWidth;
        height = windowHeight;
      }

      canvas.resize(width, height);
    },
    options: [
      {
        label: 'Fill the window',
        value: 'fill',
        group: 'Default'
      },
      {
        label: '768 x 768',
        value: '768x768',
        group: 'Square'
      },
      {
        label: '1080 x 1080 (instagram post)',
        value: '1080x1080',
        group: 'Square'
      },
      {
        label: '1280 x 1280',
        value: '1280x1280',
        group: 'Square'
      },
      {
        label: '768 x 1366',
        value: '768x1366',
        group: 'Portrait'
      },
      {
        label: '1080 x 1920 (instagram story & real)',
        value: '1080x1920',
        group: 'Portrait'
      },
      {
        label: '1080 x 1350 (instagram post)',
        value: '1080x1350',
        group: 'Portrait'
      },
      {
        label: '1170 x 2532 (iPhone 12)',
        value: '1170x2532',
        group: 'Portrait'
      },
      {
        label: '1366 x 768',
        value: '1366x768',
        group: 'Landscape'
      },
      {
        label: '1080 x 608 (instagram post)',
        value: '1080x608',
        group: 'Landscape'
      },
      {
        label: '2532 x 1170 (iPhone 12)',
        value: '2532x1170',
        group: 'Landscape'
      }
    ],
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Clear',
    icon: 'Eraser',
    onClick: () => clear(),
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Pause',
    icon: 'PlayerPause',
    onClick: () => noLoop(),
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Draw next frame',
    icon: 'PlayerTrackNext',
    onClick: () => redraw(),
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Resume',
    icon: 'PlayerPlay',
    onClick: () => loop(),
    category: 'Canvas'
  },
  {
    id: 'recording-format',
    type: 'select',
    label: 'Recording format',
    defaultValue: 'png',
    options: [
      {
        value: 'png',
        label: '.png',
      },
      {
        value: 'jpg',
        label: '.jpg',
      },
      {
        value: 'gif',
        label: '.gif',
      },
      {
        value: 'webm',
        label: '.webm',
      }
    ],
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Start recording',
    icon: 'Circle',
    onClick: () => recorder.start(),
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Stop recording',
    icon: 'PlayerStop',
    onClick: () => recorder.stop(),
    category: 'Canvas'
  },
  {
    type: 'button',
    text: 'Save .png',
    icon: 'DeviceFloppy',
    onClick: () => canvas.save(),
    category: 'Canvas'
  }
];

const options = {
  sketchUI: undefined,
  registeredOptions: [],
  add: _options => options.registeredOptions = _options,
  init: () => {
    options.sketchUI = new SketchUI( {
      open: false,
      name: sketch.name,
      options: [
        ...options.registeredOptions,
        ...getDefaultOptions()
      ],
      elements: {
        drawer: 'div#sketch-ui-drawer',
        icon: 'div#sketch-ui-icon'
      },
      logger: console.log
    });

    return options.sketchUI
  },
  get: id => options.sketchUI.getValue(id),
  set: (id, value) => options.sketchUI.setValue(id, value)
};

export default options;
