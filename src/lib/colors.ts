/** Color palette for street polylines on the map. */
const COLORS = [
  "#e6194b", // red
  "#3cb44b", // green
  "#4363d8", // blue
  "#f58231", // orange
  "#911eb4", // purple
  "#42d4f4", // cyan
  "#f032e6", // magenta
  "#bfef45", // lime
  "#fabed4", // pink
  "#469990", // teal
  "#dcbeff", // lavender
  "#9A6324", // brown
  "#800000", // maroon
  "#aaffc3", // mint
  "#808000", // olive
];

export function getStreetColor(index: number): string {
  return COLORS[index % COLORS.length];
}
