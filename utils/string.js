import events from './events.js';

const string = {
  fonts: {
    serif: undefined,
    sans: undefined,
    tilt: undefined,
    martian: undefined,
    multicoloure: undefined,
    openSans: undefined,
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

    const position = createVector( x, y )

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
  },
};

events.register("engine-window-preload", () => {
  string.fonts.serif = loadFont("assets/fonts/libre-baskerville.ttf");
  string.fonts.sans = loadFont("assets/fonts/passion-one.ttf");
  string.fonts.openSans = loadFont("assets/fonts/open-sans.ttf");
  string.fonts.tilt = loadFont("assets/fonts/tilt-prism.ttf");
  string.fonts.multicoloure = loadFont("assets/fonts/multicoloure.ttf");
  string.fonts.martian = loadFont("assets/fonts/martian.ttf");
});

export default string;
