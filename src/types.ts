export interface Street {
  type: "street";
  name: string;
  details: string | null;
}

export interface NoteEntry {
  type: "note";
  text: string;
}

export interface Route {
  id: string;
  sortering: number;
  antalBlade: number;
  streets: Street[];
  notes: string[];
  koder: string | null;
  routeNote?: string;
}

export interface RouteGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      name: string;
      streetIndex: number;
    };
    geometry: {
      type: "LineString" | "MultiLineString" | "Point";
      coordinates: number[][] | number[][][] | number[];
    };
  }>;
}
