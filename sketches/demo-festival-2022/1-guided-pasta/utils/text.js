import { canvas } from './index.js';

const text = {
  defaultFont: undefined,
  bounds: function (font, str, x, y, size) {
    return font.textBounds(str, x, y, size);
  },
  write: function (
    str,
    x,
    y,
    size = 18,
    font = text.defaultFont,
    graphics = canvas.main
  ) {
    const bbox = text.bounds(font, str, x, y, size);

    graphics.fill(55);
    graphics.textSize(size);
    graphics.textFont?.(font);
    graphics.text(str, x - bbox.w / 2, y + bbox.h / 2);
  },
};

window.preload = () => {
  text.defaultFont = loadFont(
    gitHubPagesPathHack("/assets/fonts/roboto-mono.ttf")
  );
}

export default text;
