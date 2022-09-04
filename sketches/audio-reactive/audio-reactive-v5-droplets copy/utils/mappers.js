const mappers = {
  circularMap: function (index, length, min, max) {
    return map(abs((index % length) - length / 2), 0, length / 2, max, min);
  },
  fn: function (value, min, max, start, end, fn = x => x) {
    return map( fn(map(value, min, max, 0, 1)), 0, 1, start, end, true)
  },
  circularIndex: function (index, values) {
    const valuesIndex = round(abs(index) % values.length);
    return values[valuesIndex];
  },
  circularValueOn: function (index, values, scale = values.length - 1) {
    return values[ceil(circularMap(index, scale, 0, values.length - 1))];
  }
};

export default mappers;
