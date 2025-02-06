const cache = {
  values: {},
  store: function(key, compute, enabled = true) {
    const currentValue = cache.values[ key ];

    if ( enabled !== true ) {
      return compute(currentValue);
    }

    if ( undefined === cache.values[ key ] ) {
      return cache.set( key, compute(currentValue) );
    }
  
    return cache.get(key);
  },
  key: function () {
    return [].slice.apply(arguments).join("-")
  },
  get: function(key) {
    return cache.values?.[ key ];
  },
  set: (key, value) => {
    return cache.values[ key ] = value;
  }
}

export default cache;
