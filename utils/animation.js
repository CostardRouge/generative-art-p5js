import mappers from './mappers.js';

const animation = {
  animate: (fn, duration, onProgress, onComplete) => {
    const start = performance.now();

    const animate = time => {
      const timeFraction = (time - start) / duration;
      const timeProgression = timeFraction > 1 ? 1 : timeFraction;
  
      onProgress(fn(timeProgression));
  
      if (timeProgression < 1) {
        requestAnimationFrame(animate);
      }
      else {
        onComplete()
      }
    }
  
    requestAnimationFrame(animate);
  },
  ease: ({
    values,
    currentTime,
    duration = 1,
    easingFn = x => x,
    lerpFn = lerp,
    startIndex = currentTime,
    endIndex = currentTime + 1
  }) => (
    lerpFn(
      mappers.circularIndex(startIndex, values),
      mappers.circularIndex(endIndex, values),
      easingFn( (currentTime*duration) % duration )
    )
  ),
  makeEaseInOut: (inFn, outFn = inFn) => ( timeFraction => {
    if (timeFraction < .5)
      return inFn(2 * timeFraction) / 2;
    else
      return (2 - outFn(2 * (1 - timeFraction))) / 2;
  } ),  
  sequence: function(key, speed, values, amount = 0.07, lerpFn = lerp) {
    this.values = this.values ?? {};

    const newValue = mappers.circularIndex(speed, values);
    const currentSavedValue = this.values[ key ] ? this.values[ key ] : newValue;

    return this.values[ key ] = lerpFn(currentSavedValue, newValue, amount);
  }
};

export default animation;
