import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import grids from "./gridLoader.js";
import { simulateFlood } from "./floodLogic.js";
import { getRainfall } from "./weatherCheck.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/alert", async (req, res) => {
  try {

    const { userGridId } = req.body;

    const rainfall = await getRainfall();

    const result = simulateFlood(grids, rainfall, userGridId);

    res.json({
      rainfall,
      level: result.level,
      message: result.message,
      floodedGrids: result.floodedGrids
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
