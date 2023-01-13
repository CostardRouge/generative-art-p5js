import { debug, sketch, string, mappers, easing, animation, colors, cache, grid } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

sketch.draw( (time, center) => {
  background(0);

  translate(-1000, 1000, -5000)
  
  const t = frameCount/2
  
  const h = 15;
  const w = 15;
  const d = 15;
  
  rotateY(PI/8)
  rotateX(PI/8)

  strokeWeight(1)
  
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        
        const angle = noise(x, y, z) * TAU;
        const opacityFactor =  map(sin(-t/8+y*100), -1, 1, 1, 15)
        
        stroke(color(
          map(sin(angle), -1, 1, 0, 360) / opacityFactor,
          map(cos(angle), -1, 1, 360, 0) / opacityFactor,
          map(sin(angle), -1, 1, 360, 0) / opacityFactor
        ))
        
        point(
          map(x, 0, w -1, -width/2, width/2),
          map(y, 0, h -1, -height/2, height/2),
          map(z, 0, d -1, -4000, 4000)
        )
      }
    }
  }

  orbitControl()
});
