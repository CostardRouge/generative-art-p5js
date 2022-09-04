const colors = {
  rainbow: (cadence, opacityFactor = 1) =>
    color(
      map(sin(cadence), -1, 1, 0, 360) / opacityFactor,
      map(cos(cadence), -1, 1, 360, 0) / opacityFactor,
      map(sin(cadence), -1, 1, 360, 0) / opacityFactor
    ),
};

export default colors;
