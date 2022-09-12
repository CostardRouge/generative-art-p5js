const converters = {
  polar: {
    get: function (func, size, angle, coefficient = 1) {
      return size * func(angle * coefficient);
    },
    vector: function (angle, sizeX, sizeY = sizeX) {
      return createVector(
        this.get(sin, sizeX, angle),
        this.get(cos, sizeY, angle)
      );
    },
  },
};

export default converters;
