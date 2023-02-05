import { sketch } from './index.js';

const time = {
  seconds: function () {
    return sketch?.engine?.getFrameCount() / 60;
  },
  every: function (second, callback) {
    return sketch?.engine?.getFrameCount() % second === 0 && callback();
  },
};

export default time;
