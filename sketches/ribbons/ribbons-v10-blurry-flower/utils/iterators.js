const iterators = {
  vector: function (start, end, lerpStep = 0.1, handler) {
    for (let lerpIndex = 0; lerpIndex <= 1; lerpIndex += lerpStep) {
      const position = p5.Vector.lerp(start, end, lerpIndex);
  
      handler(position, lerpIndex);
    };
  },
  vectors: function (vectors, handler, lerpStep = 0.1) {
    let totalStep = 0;
    
    vectors.forEach((startVector, index) => {
      const endVector = vectors[index + 1];

      if ( endVector ) {
        iterators.vector(startVector, endVector, lerpStep, ( position, lerpIndex ) => {
          handler(position, endVector, totalStep, lerpStep);
          totalStep += lerpStep;
        });
      }
    });
  },
  angle: function (angleMin = 0, angleMax = TAU, angleStep = TAU / 12, handler) {
    for (let angleIndex = angleMin; angleIndex < angleMax-angleStep; angleIndex += angleStep) {
      handler(angleIndex);
    }
  }
};

export default iterators;
