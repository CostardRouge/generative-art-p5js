import { string, sketch, animation, colors, mappers, easing } from './utils/index.js';

sketch.setup(() => {

}, {
  animation: {
    framerate: 60,
    duration: 12
  },
  type: '2d'
});

let drawShapeNth = 0;

function drawShape( { canvas, depth = 1, points, position }) {
  if (!points) {
    return
  }

  canvas.push()

  for (let z = 0; z < depth; z++) {
    const depthProgression = -(z/depth)

    canvas.push();
    canvas.translate( position.x, position.y, mappers.fn(z, 0, depth, 0, -500, easing.easeInExpo_ ) )
    canvas.strokeWeight( 8 )

    for (let i = 0; i < points.length; i++) {
      //const progression = i / points.length

      const { x, y } = points[i];  
      const colorFunction = colors.rainbow;

      const opacityFactor = mappers.fn(
        Math.sin(depthProgression+animation.sinAngle),
          -1, 1,
          1.25, 1,
          easing.easeInOutExpo) * Math.pow(1.29, z);

      const _color = colorFunction({
        hueOffset: (
          // +depthProgression*10
          +drawShapeNth/10
          // +mappers.fn(depthProgression, 0, 1, 0, PI/2, easing.easeInOutExpo)
          +animation.circularProgression
          +0
        ),
        // hueIndex: mappers.circularPolar(progression, 0, 1, -PI, PI)*2,
        hueIndex: mappers.fn(noise(x/width+i/points.length, y/height+animation.circularProgression, drawShapeNth/10+depthProgression), 0, 1, -PI, PI)*14,
        // hueIndex:mappers.fn(noise(x/width, y/height, progression/2+depthProgression/2), 0, 1, -PI, PI)*10,
        opacityFactor,
        // opacityFactor: map(depthProgression, 0, 1, 1.75, 1) * Math.pow(1.05, z)
      });

      const { levels: [r, g, b ] } = _color;

      if (1 || r >= 10 && g >= 10 && b >= 10) {
        canvas.stroke(_color)

        const xx = (
          x*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
          +x*Math.pow(1.2, z)
        )
  
        const yy = (
          y*mappers.fn(z, 0, depth, 1, 0, easing.easeInExpo)
          +y*Math.pow(1.05, z)
        )
  
        canvas.point(xx, yy)
      }
    }
    canvas.pop()
  }
  canvas.pop()

  // canvas.orbitControl();

  drawShapeNth++;
}

function drawMask(canvas, step = 1/100) {
  const radius = width/4;
  const margin = radius+50;
  const position = createVector(
    mappers.fn(Math.sin(animation.sinAngle*3), -1, 1, -width/2+margin, width/2-margin, easing.easeInOutQuad ),
    mappers.fn(Math.cos(animation.cosAngle*1), -1, 1, -height/2+margin, height/2-margin, easing.easeInOutQuad )
  )

  position.add(width/2, height/2)

  for (let index = 0; index < 1+step; index += step) {
    const angle = TAU * index;
    const x = position.x + sin(angle) * radius;
    const y = position.y + cos(angle) * radius;

    canvas.vertex(
      x,
      y
    )
  }

  // string.write("the past", position.x, position.y, {
  //   // showBox: true,
  //   // showLines: true,
  //   center: true,
  //   graphics: canvas,
  //   size: 72,
  //   stroke: color(128, 128, 360),
  //   strokeWeight: 1,
  //   fill: color(128, 128, 360),
  //   font: string.fonts.serif
  // })
}

const columnCount = 6
const column = index => map(index + .5, 0, columnCount, -width / 2, width / 2)

const rowCount = 6
const row = index => map(index + .5, 0, rowCount, -height / 2, height / 2)

function sketchDurationBar(color) {
  const sketchDurationBarStartPosition = createVector(0, height-2);
  const sketchDurationBarEndPosition = createVector(width, height-2);
  const sketchDurationBarCurrentPosition = p5.Vector.lerp(
    sketchDurationBarStartPosition,
    sketchDurationBarEndPosition,
    animation.progression
  )

  stroke(color);
  strokeWeight(2);
  line(
    sketchDurationBarStartPosition.x,
    sketchDurationBarStartPosition.y,
    sketchDurationBarCurrentPosition.x,
    sketchDurationBarCurrentPosition.y
  );
}

sketch.draw((time, _, favoriteColor) => {
  const [ textColor, accentColor, backgroundColor ] = [
    color(255, 255, 255),
    color(128, 128, 255),
    color(0, 0, 0),
  ]

  // const templateOptions = {
  //   colors: {
  //     text,
  //     accent,
  //     background,
  //   }
  // };

  background(backgroundColor)

  sketchDurationBar(accentColor)
  });
