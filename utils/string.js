import cache from './cache.js';

const string = {
  fonts: {
    loaded: {},
    loadFont: (key, path) => {
      return string.fonts.loaded[key] ?? (string.fonts.loaded[key] = loadFont(path)) ;
    },
    get serif() {
      return string.fonts.loadFont("serif", "assets/fonts/libre-baskerville.ttf");
    },
    get sans() {
      return string.fonts.loadFont("sans", "assets/fonts/passion-one.ttf")
    },
    get openSans() {
      return string.fonts.loadFont("openSans", "assets/fonts/open-sans.ttf");
    },
    get tilt() {
      return string.fonts.loadFont("tilt", "assets/fonts/tilt-prism.ttf");
    },
    get multicoloure() {
      return string.fonts.loadFont("multicoloure", "assets/fonts/multicoloure.ttf");
    },
    get martian() {
      return string.fonts.loadFont("martian", "assets/fonts/martian.ttf");
    },
    get cloitre() {
      return string.fonts.loadFont("cloitre", "assets/fonts/cloitre.ttf");
    },
    get agiro() {
      return string.fonts.loadFont("agiro", "assets/fonts/agiro.otf");
    },
  },
  write: function (
    str,
    x,
    y,
    options = {}
  ) {
    const {
      size = 18,
      fill = 0,
      stroke = 255,
      strokeWeight = 2,
      font = string.fonts.serif,
      graphics = window,
      showBox = false,
      showLines = false,
      center = false,
    } = options;
// console.log(font?.textBounds);


    if (!font?.font) {
      console.log({font});

      return;
    }

    const position = createVector( x, y )

    push()

    graphics.fill(fill);
    graphics.stroke(stroke);
    graphics.strokeWeight(strokeWeight);
    graphics.textSize(size);
    graphics.textFont?.(font);

    const box = font.textBounds(str, 0, 0, size);
    const asc =  int(textAscent() * 0.8);
    const desc = int(textDescent() * 0.8);

    if ( center ) {
      // translate( -box.w / 2, (asc + desc)/4 );
      position.add( -box.w / 2, (asc + desc)/4 );
      // position.add( -(asc + desc)/3, box.h/2 );
    }

    if ( showLines ) {
      push()
      // translate(position.x, position.y)
      line(-width / 2, position.y - asc, width / 2, position.y - asc);
      line(-width / 2, position.y + desc, width / 2, position.y + desc);
      line(-width / 2, position.y, width, position.y); // baseline
      pop()
    }

    if ( showBox ) {
      push()
      translate(position.x, position.y)
      graphics.stroke(255)
      graphics.strokeWeight(1)
      graphics.noFill()
      // rect( 0, 0, box.w, -box.h )
      rect( box.x, box.y, box.w, box.h )

      pop()
    }

    // rect( box.x, box.y, box.w, box.h )

    graphics.text(str, position.x, position.y);

    pop()
  },
  getTextPoints: ({ text, size, font, position = createVector(0, 0), sampleFactor, simplifyThreshold }) => {
    if (!font?.font) {
      return;
    }
    
    const fontFamily = font.font?.names?.fontFamily?.en;
    const textPointsCacheKey = cache.key(text, fontFamily, "text-points", sampleFactor, size)
  
    return cache.store( textPointsCacheKey, () => {
      const textPoints = font.textToPoints(text, position.x, position.y, size, {
        sampleFactor, simplifyThreshold
      });
  
      const xMin = textPoints.reduce((a, {x}) => Math.min(a, x), Infinity);
      const xMax = textPoints.reduce((a, {x}) => Math.max(a, x), -Infinity);
      const xCenter = (xMax/2)+(xMin/2)
  
      const yMin = textPoints.reduce((a, {y}) => Math.min(a, y), Infinity);
      const yMax = textPoints.reduce((a, {y}) => Math.max(a, y), -Infinity);
      const yCenter = (yMax/2)+(yMin/2)
  
      return textPoints.map( ({x, y}) => {
        const testPointVector = createVector(x, y);
  
        testPointVector.add((position.x-xCenter),(position.y-yCenter))
  
        return testPointVector;
      })
    })
  }
};

export default string;
