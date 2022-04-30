const iterators = {
  vector: function (start, end, lerpStep = 0.1, handler) {
    for (let lerpIndex = 0; lerpIndex <= 1; lerpIndex += lerpStep) {
      const position = p5.Vector.lerp(start, end, lerpIndex);
  
      handler(position, lerpIndex);
    }
  },
  angle: function (angleMin, angleMax = TAU, angleStep = TAU / 12, handler) {
    for (let angleIndex = angleMin; angleIndex <= angleMax; angleIndex += angleStep) {
      handler(angleIndex);
    }
  }
};

export default iterators;
