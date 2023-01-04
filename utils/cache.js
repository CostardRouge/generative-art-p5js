const cache = {
  values: {},
  store: function(key, compute, enabled = true) {
    //cache.values = cache.values ?? {};
  
    if ( enabled !== true ) {
      return compute();
    }

    if ( undefined === cache.values[ key ] ) {
      return cache.values[ key ] = compute();
    }
  
    return cache.values[ key ];
  },
  get: function(key) {
    return cache.values?.[ key ];
  }
}

export default cache;
