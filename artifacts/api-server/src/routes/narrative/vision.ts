import { Router, type IRouter } from "express";
import { analyzeImageWithVision } from "./gemini";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  const { imageBase64, mimeType, lat, lng } = req.body as {
    imageBase64?: string;
    mimeType?: string;
    lat?: number;
    lng?: number;
  };

  if (!imageBase64 || typeof imageBase64 !== "string") {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const resolvedMimeType = (mimeType && typeof mimeType === "string") ? mimeType : "image/jpeg";

  const locationHint = (typeof lat === "number" && typeof lng === "number")
    ? { lat, lng }
    : undefined;

  try {
    const visualDescription = await analyzeImageWithVision(imageBase64, resolvedMimeType, locationHint);
    res.json({ visualDescription });
  } catch (err) {
    req.log.error({ err }, "Vision analysis failed");
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

export default router;
