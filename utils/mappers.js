const mappers = {
  circularMap: function (value, length, min, max, fn) {
    return mappers.fn(abs((value % length) - length / 2), 0, length / 2, max, min, fn);
  },
  circular: function (value, min, max, start, end, fn, base = 1) {
    return constrain(base - Math.abs(mappers.fn(value, min, max, -1, 1, fn)), start, end)
  },
  circularPolar: function (v, min, max, start, end, fn = cos) {
    return map(fn(map(v, min, max, -PI, PI)), -1, 1, start, end)
  },
  fn: function (value, min, max, start, end, fn = x => x) {
    return map( fn(map(value, min, max, 0, 1)), 0, 1, start, end)
  },
  circularIndex: function (index, values) {
    return values[~~(abs(index)) % values.length];
  },
  circularValueOn: function (index, values, scale = values.length - 1) {
    return values[ceil(circularMap(index, scale, 0, values.length - 1))];
  }
};

export default mappers;
