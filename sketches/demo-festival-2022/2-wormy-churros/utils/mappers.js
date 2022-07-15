const mappers = {
  circularMap: function (index, length, min, max) {
    return map(abs((index % length) - length / 2), 0, length / 2, max, min);
  },
  circularIndex: function (index, values) {
    const valuesIndex = floor(index % values.length);
    return values[valuesIndex];
  },
  circularValueOn: function (index, values, scale = values.length - 1) {
    return values[ceil(circularMap(index, scale, 0, values.length - 1))];
  },
  morph: function(key, values, speed, amount = 0.07) {
    this.values = this.values ?? {};

    const newValue = mappers.circularIndex(speed, values);
    const currentSavedValue = this.values[ key ] ?? newValue

    return this.values[ key ] = lerp(currentSavedValue, newValue, amount);
  }
};

export default mappers;
