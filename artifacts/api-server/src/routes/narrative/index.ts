import { Router, type IRouter } from "express";
import { GenerateNarrativeBody } from "@workspace/api-zod";
import {
  geocodeLatLng,
  fetchPropertyData,
  fetchLandmarkData,
  getMortgageData,
  getPPPData,
  fetchArchivalPhotos,
} from "./data";
import { generateCivicNarrative } from "./gemini";
import visionRouter from "./vision";
import locateRouter from "./locate";

const router: IRouter = Router();

const DEMO_BLOCKS = [
  {
    name: "East Flatbush, Brooklyn",
    description: "Redlined 1940s, Caribbean community, PPP gap",
    lat: 40.6404,
    lng: -73.9337,
    zipCode: "11203",
  },
  {
    name: "South Bronx",
    description: "Lowest PPP coverage in NYC, disinvestment",
    lat: 40.8167,
    lng: -73.9168,
    zipCode: "10456",
  },
  {
    name: "Harlem, Manhattan",
    description: "Century of demographic shift, landmark erasure",
    lat: 40.8116,
    lng: -73.9465,
    zipCode: "10037",
  },
  {
    name: "Dumbo, Brooklyn",
    description: "Industrial to luxury conversion, wealth gap",
    lat: 40.7032,
    lng: -73.9872,
    zipCode: "11201",
  },
  {
    name: "Jackson Heights, Queens",
    description: "Immigrant business density, COVID impact",
    lat: 40.7557,
    lng: -73.8827,
    zipCode: "11372",
  },
];

router.get("/demo-blocks", (_req, res) => {
  res.json(DEMO_BLOCKS);
});

router.use("/vision", visionRouter);
router.use("/locate", locateRouter);

router.post("/", async (req, res) => {
  const parseResult = GenerateNarrativeBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { lat, lng } = parseResult.data;

  try {
    const [geocoded, photos] = await Promise.all([
      geocodeLatLng(lat, lng),
      fetchArchivalPhotos(lat, lng),
    ]);

    const { address, zipCode, bbl } = geocoded;

    const [propertyData, landmarkData] = await Promise.all([
      fetchPropertyData(lat, lng, bbl),
      fetchLandmarkData(lat, lng),
    ]);

    const mortgageData = getMortgageData(zipCode);
    const pppData = getPPPData(zipCode);

    const narrative = await generateCivicNarrative({
      address,
      propertyData,
      landmarkData,
      mortgageData,
      pppData,
      photos,
    });

    res.json({
      narrative,
      propertyData,
      landmarkData,
      mortgageData,
      pppData,
      photos,
      address,
      coordinates: { lat, lng },
    });
  } catch (err) {
    req.log.error({ err }, "Narrative generation failed");
    res.status(500).json({ error: "Failed to generate narrative" });
  }
});

export default router;
