import osmtogeojson from "osmtogeojson";

export default function getRandomDarkColor() {
  const red = Math.floor(Math.random() * 128);
  const green = Math.floor(Math.random() * 128);
  const blue = Math.floor(Math.random() * 128);

  const redHex = red.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const blueHex = blue.toString(16).padStart(2, "0");
  
  const alphaHex = Math.floor(0.75 * 255).toString(16).padStart(2, "0");

  return `#${redHex}${greenHex}${blueHex}${alphaHex}`;
}

export function osmToGeoJson(osmJson){
  return osmtogeojson(osmJson);
}