export function simulateFlood(grids, rainfall, userGridId) {

  if (!grids || grids.length === 0) {
    return {
      level: "SAFE",
      message: "No flood risk currently.",
      floodedGrids: []
    };
  }

  let spreadFactor = rainfall < 30 ? 0.3 :
                     rainfall < 70 ? 0.6 : 1;

  let lowestGrid = grids.reduce((min, grid) =>
    grid.properties.altitude < min.properties.altitude ? grid : min
  );

  let flooded = [];
  let visited = new Set();

  function spread(grid, depth) {

    if (!grid || visited.has(grid.properties.id)) return;

    visited.add(grid.properties.id);

    let waterLevel =
      lowestGrid.properties.altitude +
      (rainfall * spreadFactor) -
      (depth * 2);

    if (waterLevel >= grid.properties.altitude) {

      flooded.push(grid);

      let neighbors = grids.filter(g =>
        g.properties.neighbors &&
        g.properties.neighbors.includes(grid.properties.id)
      );

      neighbors.forEach(n => spread(n, depth + 1));
    }
  }

  spread(lowestGrid, 0);

  let level = "SAFE";
  let message = "No flood risk currently.";

  const userGrid = grids.find(g => g.properties.id === userGridId);

  if (userGrid && flooded.includes(userGrid)) {
    level = "EMERGENCY";
    message = "⚠ Flood water has reached your location!";
  } else if (flooded.length > 0) {
    level = "DANGER";
    message = "Flood spreading in nearby areas.";
  }

  return { level, message, floodedGrids: flooded };
}
