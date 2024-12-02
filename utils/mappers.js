import { cache} from './index.js';

const mappers = {
  circularMap: function (value, length, min, max, fn) {
    return mappers.fn(abs((value % length) - length / 2), 0, length / 2, max, min, fn);
  },
  circular: function (value, min, max, start = min, end = max, fn, base = 1) {
    return constrain(base - Math.abs(mappers.fn(value, min, max, -1, 1, fn)), start, end)
  },
  circularPolar: function (v, min, max, start = min, end = max, fn = cos) {
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
    const result = [];
    const maxLength = Math.max(from?.length, to?.length);
  
    for (let i = 0; i < maxLength; i++) {
      if ( from[i % from.length] && to[i % to.length] ) {
        const lerpedVector = fn(
          from[i % from.length],
          to[i % to.length],
          amount
        );

        result.push(lerpedVector)
    
        // result[`${lerpedVector.x}${lerpedVector.y}`] = lerpedVector;
      }
    }
  
    return result;
    return Object.values(result);
  },
  fastLerpPoints: (from, to, amount, fn = p5.Vector?.lerp) => {
    const longest = from;
    const shortest = to;

    return longest.map( (point, index) => {
      // const targetIndex = ~~map(index, 0, longest.length-1, 0, shortest.length-1, true);
      const targetIndex = (index % shortest.length);
  
      return fn( longest[index], shortest[~~targetIndex], amount )
    })
  },
  traceVectors(count, vectorsGenerator, onStart, onTrace, onEnd, smoothLength = false, smoothSteps = false, smoothStepsCount = 1) {
    const vectorsList = Array( count ).fill(undefined).map( ( _, index ) => (
      vectorsGenerator( index / (count-1) )
    ));
  
    const longestVectorsLength = (
      smoothLength ?
      mappers.valuer(`longest-vectors-length`, Math.max( ...vectorsList.map( vectors => vectors.length )))?.smooth :
      Math.max( ...vectorsList.map( vectors => vectors.length ) )
    );
  
    for (let index = 0; index < longestVectorsLength; index++) {
      const vectorIndexProgression = index / (longestVectorsLength-1);
  
      if ( smoothSteps ) {
        const count = smoothStepsCount;
        const steps = vectorsList.length / count;
  
        for (let phase = 0; phase < steps; phase++) {
          onStart( vectorIndexProgression, phase/(steps-1) );
  
          const startIndex = (phase * count);
          const endIndex = ( count + (phase * count) )+1;
        
          for (let j = startIndex; (j < endIndex) && vectorsList[j]; j++) {
            const vectors = vectorsList[j];
            const vectorsListProgression = j/(vectorsList.length-1);
  
            // onTrace( vectors[index % vectors.length], vectorsListProgression, vectorIndexProgression );
            if (vectors[index]) {
              onTrace( vectors[index], vectorsListProgression, vectorIndexProgression );
            }
          }
  
          onEnd( vectorIndexProgression, phase/(steps-1) );
        }
      }
      else {
        onStart( vectorIndexProgression );
      
        for (let j = 0; j < vectorsList.length; j++) {
          const vectors = vectorsList[j];
          const vectorsListProgression = j/(vectorsList.length-1);
    
          onTrace( vectors[index % vectors.length], vectorsListProgression, vectorIndexProgression );
          // onTrace( vectors[index], vectorsListProgression, vectorIndexProgression );
        }
    
        onEnd( vectorIndexProgression,1 );
      }
    }
  
    return vectorsList;
  },
  valuer: (key, value, smoothAmount = 0.07, fn = lerp) => {
    const cacheKey = `valuer-${key}`;
    const storedValue = cache.store(cacheKey, () => undefined );
  
    return cache.set( cacheKey, {
      value: storedValue?.value,
      value: value,
      min: Math.min(storedValue?.min ?? Infinity, value),
      max: Math.max(storedValue?.max ?? -Infinity, value),
      smooth: fn(storedValue?.smooth ?? 0, value, smoothAmount)
    } );
  },
  smoother: (key, value, amount = 0.07, fn = lerp) => {
    const cacheKey = `smoother-${key}`;
    const storedValue = cache.store(cacheKey, () => value );
  
    return cache.set(cacheKey, fn(storedValue, value, amount) );
  }
};

export default mappers;
