export function getSpotId(drawer, row, col) {
  return `D${drawer}-R${row}-C${col}`;
}

export function parseSpotId(spotId) {
  if (!spotId) return null;
  const match = spotId.match(/D(\d+)-R(\d+)-C(\d+)/i);
  if (!match) return null;
  return {
    drawer: parseInt(match[1], 10),
    row: parseInt(match[2], 10),
    col: parseInt(match[3], 10),
  };
}

export function formatCoordinate(drawer, row, col, lang = 'pt') {
  if (lang === 'pt') {
    return `Gaveta ${drawer} · Linha ${row} · Coluna ${col}`;
  }
  return `Drawer ${drawer} · Row ${row} · Column ${col}`;
}

export function getShortCoordinate(drawer, row, col, lang = 'pt') {
  if (lang === 'pt') {
    return `G${drawer}-L${row}-C${col}`;
  }
  return `D${drawer}-R${row}-C${col}`;
}

export function generateAllSpots(totalDrawers = 4, rows = 4, cols = 5) {
  const spots = [];
  for (let d = 1; d <= totalDrawers; d++) {
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        spots.push({
          spotId: getSpotId(d, r, c),
          drawer: d,
          row: r,
          col: c,
        });
      }
    }
  }
  return spots;
}
