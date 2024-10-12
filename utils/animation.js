import mappers from './mappers.js';
import sketch from './sketch.js';
import time from './time.js';

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

  time: 0,
  reset() {
    animation.time = 0;
  },
  get maximumFramesCount() {
    return sketch.sketchOptions?.animation?.duration * sketch.sketchOptions?.animation?.framerate
  },
  incrementTime() {
    const timeIncrement = 1 / animation.maximumFramesCount;

    animation.time += timeIncrement; 
  },

  get progression() {
    return time.seconds() % sketch.sketchOptions?.animation?.duration / sketch.sketchOptions?.animation?.duration;
  },
  get circularProgression() {
    return mappers.circular(animation.progression, 0, 1);
  },

  get angle() {
    return animation.time * TAU
    return map(animation.circularProgression, 0, 1, 0, TAU)
  },

  get sinAngle() {
    return animation.angle
    return map(animation.circularProgression, 0, 1, -PI/2, PI/2)
  },
  get cosAngle() {
    return animation.angle
    return map(animation.circularProgression, 0, 1, PI, TAU)
  },

  get sinOscillation() {
    return Math.sin(animation.angle)
  },
  get cosOscillation() {
    return Math.cos(animation.angle)
  },
  get linearOscillation() {
    const progression = animation.progression
  
    if (progression < 0.5) {
      return map(progression, 0, 0.5, -1, 1); // Forward phase
    }

    return map(progression, 0.5, 1, 1, -1); // Backward phase
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
