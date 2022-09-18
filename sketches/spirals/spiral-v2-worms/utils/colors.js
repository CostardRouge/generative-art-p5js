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
  purple: ({hueOffset = 0, hueIndex, opacityFactor = 1, min = 0, max = 360}) => (
    color(
      max/4 / opacityFactor,
      map(sin(hueOffset-hueIndex), -1, 1, max/2, 0) / opacityFactor,
      max / opacityFactor,
    )

    
  )
};

export default colors;
