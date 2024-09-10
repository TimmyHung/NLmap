import osmtogeojson from "osmtogeojson";

export function osmToGeoJson(osmJson){
  return osmtogeojson(osmJson);
}

// 取得顯示名稱
export function record_getDisplayName(record) {
  if (record?.tags["brand:zh"] && record?.tags?.branch)
      return `${record.tags["brand:zh"]}-${record.tags.branch}`;
  
  if (record?.tags?.name && record?.tags?.branch)
      return `${record.tags.name}-${record.tags.branch}`;

  if (record?.tags?.brand && record?.tags?.branch)
      return `${record.tags.brand}-${record.tags.branch}`;

  if (record?.tags?.full_name)
      return record.tags.full_name;

  if (record?.tags?.name)
      return record.tags.name;

  if (record?.tags["name:en"])
      return record.tags["name:en"];

  if (record?.tags?.is_in)
      return record.tags.is_in;

  return '未命名紀錄';
}

//取得顯示的地址
export function record_getDisplayAddress(record) {
  if (record.tags["addr:full"] != null) {
      const fullAddress = record.tags["addr:full"].replace(/^\d+/, "");
      return fullAddress;
  }

  const parts = [];
  let streetName = record.tags["addr:street"] || "";
  let housenumber = record.tags["addr:housenumber"] || "";
  let floor = record.tags["addr:floor"] || "";
  
  if (record.ctyName) parts.push(record.ctyName);
  if (record.townName && record.ctyName != "未知") parts.push(record.townName);
  if (streetName) parts.push(streetName);
  if (housenumber) parts.push(housenumber + "號");
  if (floor) parts.push(floor + "樓");

  return parts.length > 0 ? parts.join('') : "未知";
}

let usedColors: string[] = [];

// 計算兩個顏色的距離，用於判斷顏色的相似度
function colorDistance(color1: string, color2: string): number {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}

// 檢查生成的顏色是否與已有顏色過於相似
function isColorTooSimilar(newColor: string, existingColors: string[]): boolean {
  const threshold = 10; // 數值越小變化度越高
  return existingColors.some((color) => colorDistance(newColor, color) < threshold);
}

// 生成隨機深色，並避免與已有顏色過於相似
export default function getRandomDarkColor(): string {
  let newColor: string;
  do {
    const red = Math.floor(Math.random() * 128);
    const green = Math.floor(Math.random() * 128);
    const blue = Math.floor(Math.random() * 128);

    const redHex = red.toString(16).padStart(2, "0");
    const greenHex = green.toString(16).padStart(2, "0");
    const blueHex = blue.toString(16).padStart(2, "0");

    newColor = `#${redHex}${greenHex}${blueHex}`;
  } while (isColorTooSimilar(newColor, usedColors));

  usedColors.push(newColor);
  return newColor;
}

