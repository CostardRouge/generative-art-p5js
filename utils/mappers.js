import { cache} from './index.js';

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
  },
  lerpPoints: (from, to, amount, fn = p5.Vector?.lerp) => {
    const result = {};
    const maxLength = Math.max(from.length, to.length);
  
    for (let i = 0; i < maxLength; i++) {
      if ( from[i % from.length] && to[i % to.length] ) {
        const lerpedVector = fn(
          from[i % from.length],
          to[i % to.length],
          amount
        );
    
        result[`${lerpedVector.x}${lerpedVector.y}`] = lerpedVector;
      }
    }
  
    return Object.values(result);
  },
  valuer: (key, value, amount = 0.07, fn = lerp) => {
    const cacheKey = `valuer-${key}`;
    const storedValue = cache.store(cacheKey, () => undefined );
  
    return cache.set( cacheKey, {
      value: storedValue?.value,
      min: Math.min(storedValue?.min ?? Infinity, value),
      max: Math.max(storedValue?.max ?? -Infinity, value),
      smooth: fn(storedValue?.smooth ?? 0, value, amount)
    } );
  },
  smoother: (key, value, amount = 0.07, fn = lerp) => {
    const cacheKey = `smoother-${key}`;
    const storedValue = cache.store(cacheKey, () => value );
  
    return cache.set(cacheKey, fn(storedValue, value, amount) );
  }
};

export default mappers;
