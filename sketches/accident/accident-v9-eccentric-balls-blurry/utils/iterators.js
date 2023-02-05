const iterators = {
  vector: function (start, end, lerpStep = 0.1, handler) {
    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const position = p5.Vector.lerp(start, end, lerpIndex);
  
      handler(
        position,
        lerpIndex,
        lerpIndex === 0,
        lerpIndex + lerpStep > 1
      );
    };
  },
  vectors: function (vectors, handler, lerpStep = 0.1) {
    let totalStep = 0;
    
    vectors.forEach((startVector, index) => {
      const endVector = vectors[index + 1];

      if ( endVector ) {
        iterators.vector(startVector, endVector, lerpStep, ( position, lerpIndex ) => {
          handler(position, endVector, lerpIndex, totalStep, lerpStep);
          totalStep += lerpStep;
        });
      }
    });
  },
  angle: function (angleMin = 0, angleMax = TAU, angleStep = TAU / 12, handler) {
    let index = 0;
    for (let angleIndex = angleMin; angleIndex < angleMax; angleIndex += angleStep) {
      handler(angleIndex, index);
      index++;
    }
  }
};

export default iterators;
