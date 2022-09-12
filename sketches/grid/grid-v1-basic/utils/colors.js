const colors = {
  rainbow: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      map(sin(hueOffset+hueIndex), -1, 1, min, max) / opacityFactor,
      map(cos(hueOffset-hueIndex), -1, 1, max, min) / opacityFactor,
      map(sin(hueOffset+hueIndex), -1, 1, max, min) / opacityFactor
    )
  ),
  darkBlueYellow: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      map(cos(hueOffset+hueIndex), -1, 1, min, max) / opacityFactor,
      map(cos(hueOffset+hueIndex), -1, 1, min, max) / opacityFactor,
      map(sin(hueOffset+hueIndex), -1, 1, max, min) / opacityFactor,
    )
  ),
  purple: ({index, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      map(sin(index), -1, 1, min, max) / opacityFactor,
      map(cos(index), -1, 1, max, min) / opacityFactor,
      map(sin(index), -1, 1, max, min) / opacityFactor
    )
  )
};

export default colors;
