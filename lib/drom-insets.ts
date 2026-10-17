// The France map shows the five DROM as insets in the Atlantic, west of Brittany.
// Each inset moves and scales the real coordinates around a center; the placement game
// (phase 4) uses `fromInset` to turn a click on an inset back into real coordinates.

export type LonLat = [number, number];

type Inset = {
  code: string;
  // Real center of the territory and where it is drawn on the France map.
  source: LonLat;
  target: LonLat;
  // Zoom factor: the drawn territory is `scale` times its real size.
  scale: number;
};

export const DROM_INSETS: readonly Inset[] = [
  { code: "971", source: [-61.45, 16.2], target: [-8.6, 48.9], scale: 1.1 }, // Guadeloupe
  { code: "972", source: [-61.0, 14.65], target: [-8.6, 47.6], scale: 1.8 }, // Martinique
  { code: "973", source: [-53.2, 3.95], target: [-8.6, 46.0], scale: 0.42 }, // Guyane
  { code: "974", source: [55.53, -21.12], target: [-8.6, 44.4], scale: 1.6 }, // La Réunion
  { code: "976", source: [45.14, -12.82], target: [-8.6, 43.1], scale: 2.4 }, // Mayotte
];

const RAD = Math.PI / 180;

// Web Mercator is conformal: a shape keeps its proportions only if its latitude span is
// rescaled by the ratio of cosines between the target and the source latitude.
function factors(inset: Inset) {
  const kx = inset.scale;
  const ky =
    (inset.scale * Math.cos(inset.target[1] * RAD)) /
    Math.cos(inset.source[1] * RAD);
  return { kx, ky };
}

export function insetFor(departmentCode: string): Inset | undefined {
  return DROM_INSETS.find((inset) => inset.code === departmentCode);
}

export function toInset(inset: Inset, [lon, lat]: LonLat): LonLat {
  const { kx, ky } = factors(inset);
  return [
    inset.target[0] + (lon - inset.source[0]) * kx,
    inset.target[1] + (lat - inset.source[1]) * ky,
  ];
}

export function fromInset(inset: Inset, [x, y]: LonLat): LonLat {
  const { kx, ky } = factors(inset);
  return [
    inset.source[0] + (x - inset.target[0]) / kx,
    inset.source[1] + (y - inset.target[1]) / ky,
  ];
}
