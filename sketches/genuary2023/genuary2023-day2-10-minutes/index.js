import { sketch, string, mappers, easing, animation, colors, cache, grid , events } from './utils/index.js';

sketch.setup( undefined, { type: 'webgl'});

// events.register("engine-window-preload", () => {
//   cache.store("image", () => loadImage( "2.png" ))
// });

let xAdd = 0, yAdd = 0;

sketch.draw( (time, center) => {
  background(0);
  // translate(center)

  //const img = cache.get("image")

  // texture(img);
  //image(img, -width/2, -height/2, width, height);

  const columns = 15;
  const rows = 24;

  const gridOptions = {
    topLeft: createVector( -width/2, -height/2 ),
    topRight: createVector( width/2, -height/2 ),
    bottomLeft: createVector( -width/2, height/2 ),
    bottomRight: createVector( width/2, height/2 ),
    rows,
    columns,
    centered: true
  }

  const h = height / columns;
  const w = width / rows;

  noiseDetail( 8, 0.3  )

  let locX = 0;
  let locY = 0;
  pointLight(255, 255, 255, locX, locY, 50);

  xAdd += sin(time) * 0.01
  yAdd += cos(time) * 0.01

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const xOff = x/columns;
    const yOff = y/rows;
    const angleX = noise(xOff+xAdd, yOff+yAdd) * PI;
    const angleY = (angleX) * PI/8;

    // const imageX = ~~map(x, 0, columns -1, 0, img.width);
    // const imageY = ~~map(y, 0, rows-1, 0, img.height);
    // const imagePixel = img.get( imageX, imageY );

    const z = mappers.fn(angleX, 0, PI, 0, -500, easing.easeInOutExpo)

    push()
    translate(cellVector.x, cellVector.y, z)
    //rotateX(angleX)
    //rotateY(angleY)
    // fill(imagePixel)
    //rotate(speed+xOff-yOff)
    rotateX(PI/2)

    // fill()
    // ellipse(cellVector.x, cellVector.y, (w + h) / 1.5)
    // plane(w, h)
    specularMaterial(colors.rainbow({
      hueOffset: 0,
      hueIndex: mappers.fn(angleX, 0, PI, -PI, PI)*4,
      opacityFactor: 1.5,
      opacityFactor: mappers.fn(z, 0, -500, 1, 3)
    }));
    shininess(200);
    cone(w/2, h);
    pop()
  })

  orbitControl()
});
