import mappers from './mappers.js';

const animation = {
  ease: function (value, min, max, start, end, fn = x => x) {
    return map( fn(map(value, min, max, 0, 1)), 0, 1, start, end)
  },
  sequence: function(key, speed, values, amount = 0.07, lerpFn = lerp) {
    this.values = this.values ?? {};

    const newValue = mappers.circularIndex(speed, values);
    const currentSavedValue = this.values[ key ] ? this.values[ key ] : newValue;

    return this.values[ key ] = lerpFn(currentSavedValue, newValue, amount);
  }
};

export default animation;
