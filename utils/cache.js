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
  key: function () {
    return [].slice.apply(arguments).join("-")
  },
  get: function(key) {
    return cache.values?.[ key ];
  },
  dump: () => {
    
  }
}

export default cache;
