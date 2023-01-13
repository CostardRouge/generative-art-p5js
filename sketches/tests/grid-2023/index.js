import { shapes, sketch, iterators, converters, events, colors, mappers, easing, animation, grid } from './utils/index.js';

const videos = [];

sketch.setup( () => {
  //noCanvas();

  for (let i = 0; i < 9; i++) {
    videos[i].loop();
  }
});

events.register("engine-window-preload", () => {
  for (let i = 0; i < 9; i++) {
    videos.push( createVideo(`video-${i+1}.mp4`) );
  }
});

sketch.draw( (time, center) => {
  background(0);

  const w = width / 3;
  const h = height / 3;

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * w;
    const y = floor(i / 3) * h;

    video(videos[i], x, y, w, h);
  }
});
