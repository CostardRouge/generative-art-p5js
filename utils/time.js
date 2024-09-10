import { sketch } from './index.js';

const time = {
  seconds: function () {
    return time.milliSeconds() / 1000;
  },
  milliSeconds: function () {
    return sketch?.engine?.getElapsedTime();
  },
  every: function (second, callback) {
    return sketch?.engine?.getFrameCount() % second === 0 && callback();
  },
};

export default time;
