const cos_sin = (value, amount) => map(amount, 0, 1, cos(value), sin(value))

const colors = {
  test: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360, easingFunction}) => (
    color(
      map(sin(PI * hueIndex+hueOffset, hueOffset), -1, 1, min, max) / opacityFactor,
      map(cos(PI * (hueIndex + 1/3+hueOffset), hueOffset), -1, 1, min, max) / opacityFactor,
      map(cos(PI * (hueIndex + 2/3+hueOffset), hueOffset), -1, 1, min, max) / opacityFactor,
    )
  ),
  rainbowCrazy: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360, easingFunction}) => (
    color(
      map((easingFunction ?? cos)(hueOffset-hueIndex), -1, 1, min, max) / opacityFactor,
      map((easingFunction ?? sin)(hueOffset+hueIndex), -1, 1, max, min) / opacityFactor,
      map((easingFunction ?? cos)(hueOffset-hueIndex), -1, 1, max, min) / opacityFactor
    )
  ),
  rainbow: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360, easingFunction, alpha}) => (
    color(
      map((easingFunction ?? sin)(hueOffset+hueIndex), -1, 1, min, max) / opacityFactor,
      map((easingFunction ?? cos)(hueOffset-hueIndex), -1, 1, max, min) / opacityFactor,
      map((easingFunction ?? sin)(hueOffset+hueIndex), -1, 1, max, min) / opacityFactor,
      alpha
    )
  ),
  darkBlueYellow: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      map(cos(hueOffset+hueIndex), -1, 1, min, max) / opacityFactor,
      map(cos(hueOffset+hueIndex), -1, 1, min, max) / opacityFactor,
      map(sin(hueOffset+hueIndex), -1, 1, max, min) / opacityFactor,
    )
  ),
  purple: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      max/4 / opacityFactor,
      map(sin(hueOffset-hueIndex), -1, 1, max/2, 0) / opacityFactor,
      max / opacityFactor,
    )
  ),
  purpleSimple: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      128, 128, 255
    )
  ),
  green: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      92, 255, 128
    )
  ),
  black: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      4, 2, 8
    )
  ),
};

export default colors;
