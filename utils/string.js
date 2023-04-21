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

    push()
    translate( x, y );

    graphics.fill(fill);
    graphics.stroke(stroke);
    graphics.strokeWeight(strokeWeight);
    graphics.textSize(size);
    graphics.textFont?.(font);

    const box = font.textBounds(str, 0, 0, size);
    const asc =  int(textAscent() * 0.8);
    const desc = int(textDescent() * 0.8);

    if ( center ) {
      translate( -box.w / 2, (asc + desc)/4 );
    }

    if ( showLines ) {
      line(-width / 2, y - asc, width / 2, y - asc);
      line(-width / 2, y + desc, width / 2, y + desc);
      line(-width / 2, y, width, y); // baseline
    }

    if ( showBox ) {
      // rect( 0, 0, box.w, -box.h )
      rect( box.x, box.y, box.w, box.h )
    }

    graphics.text(str, 0, 0);

    pop()
  },
  
};

events.register("engine-window-preload", () => {
  string.fonts.serif = loadFont(
    gitHubPagesPathHack("assets/fonts/libre-baskerville.ttf")
  );
  string.fonts.sans = loadFont(
    gitHubPagesPathHack("assets/fonts/passion-one.ttf")
  );
  string.fonts.openSans = loadFont(
    gitHubPagesPathHack("assets/fonts/open-sans.ttf")
  );
  string.fonts.tilt = loadFont(
    gitHubPagesPathHack("assets/fonts/tilt-prism.ttf")
  );
  string.fonts.multicoloure = loadFont(
    gitHubPagesPathHack("assets/fonts/multicoloure.ttf")
  );
  string.fonts.martian = loadFont(
    gitHubPagesPathHack("assets/fonts/martian.ttf")
  );
});

export default string;
