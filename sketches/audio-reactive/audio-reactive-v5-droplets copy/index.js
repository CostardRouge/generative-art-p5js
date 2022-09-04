import { canvas, sketch, converters, audio, midi, events, animation, string, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "opacity-speed",
    type: 'slider',
    label: 'Opacity speed',
    min: -10,
    max: 10,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "opacity-group-count",
    type: 'slider',
    label: 'Opacity group count',
    min: 1,
    max: 20,
    defaultValue: 10,
    category: 'Opacity'
  },
  {
    id: "start-opacity-factor",
    type: 'slider',
    label: 'Start opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 3,
    category: 'Opacity'
  },
  {
    id: "end-opacity-factor",
    type: 'slider',
    label: 'End opacity (reduction factor)',
    min: 1,
    max: 50,
    defaultValue: 1,
    category: 'Opacity'
  },

  {
    id: "background-lines-count",
    type: 'slider',
    min: 1,
    max: 1000,
    label: 'Lines count',
    defaultValue: 70,
    category: 'Background'
  },
  {
    id: "background-lines-weight",
    type: 'slider',
    min: 1,
    max: 25,
    label: 'Lines weight',
    defaultValue: 4,
    category: 'Background'
  },
  {
    id: "background-pixelated-blur",
    type: 'slider',
    min: 1,
    max: 8,
    label: 'Pixelated blur value',
    defaultValue: 4,
    category: 'Background'
  },
  {
    id: "background-pixel-density",
    type: 'slider',
    min: 0.01,
    max: 1,
    step: 0.01,
    label: 'Pixelated pixel density',
    defaultValue: 0.05,
    category: 'Background',
    onChange: value => {
      pixilatedCanvas.pixelDensity(value); 
    }
  },
] );

let pixilatedCanvas;

events.register("pre-setup", () => {
  audio.capture.setup();
  //midi.setup();
})

sketch.setup();

const easingFunctions = Object.entries( easing ).reverse();

const drawRadialPattern = (time, givenCanvas) => {
  const weight = 3;
  const columns = 7;

  const columnSize = width / columns
  const halfColumnSize = (columnSize /2 )
  const columnPadding = weight + halfColumnSize;
  const precision = 1 / 250;

  const hueSpeed = time*5;
  const functionChangeSpeed = time;

  for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
    const x = ( columnIndex * columnSize ) + halfColumnSize;
    const top = createVector( x, 0);
    const bottom = createVector(x, height);

    iterators.vector(top, bottom, precision, ( position, lerpIndex ) => {
      const [ easingFunctionName, easingFunction ] = mappers.circularIndex( functionChangeSpeed+columnIndex/10+3*lerpIndex*cos(time), easingFunctions);
      
      const driftBound = (halfColumnSize + columnPadding);
      let driftY = map( easingFunction((lerpIndex) % 1), 0, 1, -driftBound, driftBound) * cos(time + columnIndex);
      let driftX = map( easing.easeInOutBack((lerpIndex) % 1), 0, 1, -driftBound, driftBound) * sin(time + columnIndex/5)
      driftX = map( easingFunction((lerpIndex) % 1), 0, 1, -driftBound, driftBound) * sin(time + columnIndex/5)

      const hueIndex = columnIndex+lerpIndex*15;
      const hueMaximum = 360;
      const hueMinimum = 0;
  
      const opacityFactor = 1.5;
      
      givenCanvas.stroke( color(
        map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
        map(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor,
      ) );

      // givenCanvas.stroke( color(
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(cos(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum, easingFunction) / opacityFactor,
      //   mappers.fn(sin(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum, easingFunction) / opacityFactor,
      // ) );
    
      // givenCanvas.stroke( color(
      //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
      //   map(sin(hueSpeed+hueIndex), -1, 1, hueMinimum, hueMaximum) / opacityFactor,
      //   map(cos(hueSpeed+hueIndex), -1, 1, hueMaximum, hueMinimum) / opacityFactor,
      // ) );

      const maxS = audio.capture.energy.byIndex( columnIndex )
  
      givenCanvas.strokeWeight( mappers.fn(lerpIndex, 0, 1, -90, 90, easingFunction ) );
      // givenCanvas.strokeWeight( mappers.fn(lerpIndex, 0, 1, 100, 10 ) );
      // givenCanvas.strokeWeight( map(sin(time+lerpIndex*10), 0, 1, 70, 10 ) );
      // givenCanvas.point( position.x, position.y );
      givenCanvas.point(
        position.x + driftX,
        position.y// + driftY
      );
    })
  }
}

sketch.draw((time) => {
  background(
    lerpColor(
      color(0),
      color(255),
      midi.byCircularIndex( 1, "smooth" )|| audio.capture.energy.byCircularIndex( 1 )
    )
  );
  drawRadialPattern( time, window);
});
