const time = {
  seconds: function () {
    return frameCount / 60;
  },
  every: function (second, callback) {
    return frameCount % second === 0 && callback();
  },
};

export default time;
