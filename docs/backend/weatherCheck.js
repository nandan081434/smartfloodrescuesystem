export async function getRainfall() {

  // Simulated rainfall between 0–100 mm
  const randomRainfall = Math.floor(Math.random() * 100);

  console.log("🌧 Rainfall:", randomRainfall);

  return randomRainfall;
}
