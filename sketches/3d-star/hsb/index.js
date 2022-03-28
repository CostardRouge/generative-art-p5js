import { shapes, sketch, converters, canvas, events, colors, mappers, options } from './utils/index.js';

options.add( [
  {
    id: "size",
    type: 'slider',
    label: 'Size',
    min: 1,
    max: 1280,
    defaultValue: 200,
    category: 'Integers'
  },
  {
    id: "angle-step",
    type: 'slider',
    label: 'Angles step',
    min: 2,
    max: 256,
    defaultValue: 128,
    category: 'Integers'
  },
  {
    id: "phase",
    type: 'number',
    label: 'Phase',
    min: 1,
    max: 32,
    defaultValue: 6,
    category: 'Integers'
  },
  {
    id: "amplitude",
    type: 'slider',
    label: 'Amplitude',
    min: 1,
    max: 1000,
    defaultValue: 150,
    category: 'Integers'
  },
  {
    id: "orbit-control",
    type: 'switch',
    label: 'Orbit control',
    defaultValue: 150,
    category: 'Debug'
  },
] );

sketch.setup(() => {
  colorMode(HSB);

  shapes.push(
    new Helix({
      position: createVector(0, 0),
    })
  );
}, { type: 'webgl' });

class Helix {
  constructor(options) {
    Object.assign(this, options);
  }

  draw(time) {
    const angleStep = TAU / options.get('angle-step');
    // const angleStep = map(sin(time / 4), -1, 1, .05, 1);
    // const angleStep = mappers.circularMap(time, 15, TAU/6, TAU/128);

    const { position } = this;
    const amplitude = options.get('amplitude');
    const phase = TAU / options.get('phase');
    const size = options.get('size');
    // const phase = mappers.circularMap(time, 10, TAU / 2, TAU / 70);

    specularMaterial(0);
    
    push();
    translate(position.x, position.y);
    beginShape();
    
    for (let angle = 0; angle < TAU; angle += angleStep) {
      const vector = converters.polar.vector(angle, size);
      const x = vector.x;
      const y = vector.y;
      const z = mappers.circularMap(angle + time, phase, -amplitude, amplitude);
      // const hueIndex = mappers.circularMap(angle + x/y+z, phase, 0, 360);
      const hueIndex = mappers.circularMap(angle + time, phase, 0, 360);

      fill(hueIndex, 0, 50);
      vertex(x, y, z);
    }

    endShape(CLOSE);

    pop();
  }
}

class Spiral {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();
  }

  calculateRelativePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRelativePosition();
  }

  draw(time, index) {
    const { position } = this;
    push();
    translate(position.x, position.y);

    const shadowsCount = 5//map(sin(time), -1, 1, 3, 5)
    const shadowIndexStep = 0.01; //map(sin(time), -1, 1, 0.2, 0.05);

    for (
      let shadowIndex = 0;
      shadowIndex <= shadowsCount;
      shadowIndex += shadowIndexStep
    ) {
      const weight = map(
        shadowIndex,
        0,
        shadowsCount,
        options.get("start-weight"),
        options.get("end-weight")
      );

      const opacityFactor = map(
        shadowIndex,
        0,
        shadowsCount,
        map(
          sin(-time * 5 + shadowIndex * 2),
          -1,
          1,
          options.get("start-opacity-factor"),
          options.get("start-opacity-factor") * 10
        ),
        options.get("end-opacity-factor")
      );

      const l = shadowIndex/2.5;
      const indexCoefficient = shadowIndex;
      const x = map(sin(time * 1 + indexCoefficient), -1, 1, -l, l);
      const y = map(cos(time * 2 + indexCoefficient), -1, 1, -l, l);

      translate(x*1.5, y*2);

      const angleStep = TAU / options.get("lines-count")

      for (let angle = 0; angle < TAU; angle += angleStep) {
        push();
        const vector = converters.polar.vector(
          angle,
          weight * options.get("size-ratio")
        );

        beginShape();
        strokeWeight(weight);

        rotate(map(sin(time+shadowIndex), -1, 1, -1, 1)*2);
        // rotate(TAU, 0, TAU, -1, 1);

        stroke(
          color(
            map(sin(time+shadowIndex + l*5), -1, 1, 0, 360) /
              opacityFactor,
            map(cos(time+shadowIndex + l*2), -1, 1, 360, 0) /
              opacityFactor,
            map(sin(time+shadowIndex*2 + l*5), -1, 1, 360, 0) /
              opacityFactor
          )
        );
        
        vertex(vector.x, vector.y);
        vertex(-vector.x, -vector.y);

        endShape();
        pop();
      }
    }

    pop();
  }
}

sketch.draw((time) => {
  background(0);


 //   const animationRange = PI / 10;

  const locX = mouseX - width / 2;
  const locY = mouseY - height / 2;

  camera(
    0,
    0,
    // map(cos(time), -1, 1, -0, 500),
    height / 2 / tan(PI / 6),
    0,
    0,
    0,
    map(cos(time*2), -1, 1, 0, 1),
    map(sin(time*2), -1, 1, 0, 1),
    map(cos(time*2), -1, 1, 0, 1)
  );

  const hueIndex = mappers.circularMap(time, 10, 0, 360);
  const lightVector = converters.polar.vector(time*2, width, width);

  ambientLight(0, 100, 30);
  pointLight(hueIndex, 100, 100, locX, locY, 5);
  pointLight(hueIndex, 100, 100, lightVector.x, lightVector.y, 50);

  // rotateX(map(sin(time), -1, 1, -animationRange, animationRange));
  // rotateY(map(cos(time), -1, 1, -animationRange, animationRange));

  //   rotateY( frameCount / 100)
  // rotateZ( frameCount / 100)
  // rotateX( frameCount / 50)

  // noFill()
  // ambientMaterial(0);


  shapes.forEach((shape, index) => shape.draw(time, index));

  options.get("orbit-control") && orbitControl();


});
