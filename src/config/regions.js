// Taiwan regional presets for agricultural water estimation
export const REGIONAL_PRESETS = [
  {
    id: "north",
    name: "北部",
    defaultCrops: ["rice", "leafy_greens"],
    defaultWellDepth: 20.0,
    gpsCoordinates: { latitude: 25.033, longitude: 121.5654 },
  },
  {
    id: "central",
    name: "中部",
    defaultCrops: ["rice", "root_vegetables", "citrus"],
    defaultWellDepth: 25.0,
    gpsCoordinates: { latitude: 24.1477, longitude: 120.6736 },
  },
  {
    id: "south",
    name: "南部",
    defaultCrops: ["rice", "mango", "banana"],
    defaultWellDepth: 30.0,
    gpsCoordinates: { latitude: 22.6273, longitude: 120.3014 },
  },
];
