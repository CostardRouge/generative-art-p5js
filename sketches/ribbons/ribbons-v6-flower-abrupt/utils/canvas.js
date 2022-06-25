import { events, sketch, shapes } from './index.js';

const canvas = {
  main: undefined,
  configuration: {
    type: "p2d",
    width: 768,
    height: 1366,
  },
  create: function (options = {}) {
    canvas.configuration = {
      ...canvas.configuration,
      ...options,
    };

    const { width, height, ratio, type } = canvas.configuration;

    canvas.main = createCanvas(width, ratio ? width / ratio : height, type);

    canvas.main.doubleClicked( () => {
      events.handle("doubleClicked");
    } );

    return canvas.main;
  },
  resize: function (
    width = canvas.configuration.width,
    height = canvas.configuration.width
  ) {
    resizeCanvas(width, height);
    shapes.forEach((shape) => shape.onWindowResized?.());
  },
  fullscreen: function () {
    fullscreen(!fullscreen());
  },
  save: (format = 'png') => {
    saveCanvas(canvas.main, sketch.name, format);
  },
  toggleNoLoop: function () {
    this.stop = this.stop ?? false;
    this.stop = !this.stop;

    if (this.stop) {
      noLoop();
    } else {
      loop();
    }
  },
};

export default canvas;
