/** One distinct color per route, indexed by sortering (1-based). */
const ROUTE_COLORS: Record<string, string> = {
  "1": "#e6194b",   // red
  "1A": "#3cb44b",  // green
  "2": "#4363d8",   // blue
  "3": "#f58231",   // orange
  "3A": "#911eb4",  // purple
  "5": "#42d4f4",   // cyan
  "5A": "#f032e6",  // magenta
  "6": "#bfef45",   // lime
  "7": "#fabed4",   // pink
  "8": "#469990",   // teal
  "8A": "#dcbeff",  // lavender
  "9": "#9A6324",   // brown
  "10A": "#800000", // maroon
  "4": "#aaffc3",   // mint
  "10": "#808000",  // olive
};

export function getRouteColor(routeId: string): string {
  return ROUTE_COLORS[routeId] ?? "#888888";
}
