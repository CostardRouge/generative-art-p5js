import SketchUI from '../libraries/sketch-ui.es.js';

import { canvas, recorder, debug, sketch } from './index.js';

const getDefaultOptions = () => {
  // const { type } = screen.orientation;
  // const isMobile = type !== "landscape-primary" && type !== "landscape-secondary";

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    document.querySelector('body').style.overflow = 'hidden';
  }

  const defaultOptions = [];
  const defaultPixelDensity = isMobile ? 1 : pixelDensity();
  const defaultFramerate = 60;
  const defaultTimeSpeed = 1;
  const defaultCanvasSize = isMobile ? 'fill' :`${canvas.configuration.width}x${canvas.configuration.height}`;

  defaultOptions.push( ...[
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
      defaultValue: defaultPixelDensity,
      category: 'Debug',
      onChange: (value) => {
        pixelDensity(value);
      }
    },
    {
      id: 'smooth-pixel',
      type: 'switch',
      label: 'Smooth pixel',
      defaultValue: true,
      category: 'Debug',
      onChange: checked => checked ? smooth() : noSmooth()
    },
    {
      id: 'framerate',
      type: 'slider',
      label: 'Framerate',
      defaultValue: defaultFramerate,
      min: 1,
      max: 120,
      marks: [
        { value: 20, label: '20 fps' },
        { value: 60, label: '60 fps' },
        { value: 100, label: '100 fps' },
      ],
      category: 'Debug',
      onChange: frameRate
    },
    {
      id: 'time-speed',
      type: 'slider',
      label: 'General time speed',
      defaultValue: defaultTimeSpeed,
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
    }
  ] );

  defaultOptions.push( {
    id: "canvas-size",
    type: 'select',
    hidden: isMobile,
    label: 'Canvas size',
    defaultValue: defaultCanvasSize,
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
        label: `Default ${canvas.configuration.width} x ${canvas.configuration.height}`,
        value: defaultCanvasSize,
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
  } );

    
  defaultOptions.push( ...[
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
      text: 'Resume',
      icon: 'PlayerPlay',
      onClick: () => loop(),
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
      id: 'recording-format',
      type: 'select',
      label: 'Video recording format',
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
      id: 'recording-framerate',
      type: 'select',
      label: 'Recording framerate',
      defaultValue: '60',
      options: [
        {
          value: '25',
          label: '25 fps',
        },
        {
          value: '60',
          label: '60 fps',
        },
        {
          value: '120',
          label: '120 fps',
        },
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
  ] );

  return defaultOptions;
};

const options = {
  sketchUI: undefined,
  registeredOptions: [],
  add: _options => (
    options.registeredOptions = [
      ...options.registeredOptions,
      ..._options
    ]
  ),
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
