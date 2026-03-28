import { Router, type IRouter } from "express";
import { locateImageInNYC } from "./gemini";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

async function geocodeSearchQuery(
  query: string,
): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    const planningUrl = `https://geosearch.planninglabs.nyc/v2/search?text=${encodeURIComponent(query)}&size=1`;
    const resp = await fetch(planningUrl, {
      headers: { "User-Agent": "CB-CivicNarrative/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (resp.ok) {
      const data = await resp.json() as any;
      if (data?.features?.length > 0) {
        const f = data.features[0];
        const [lng, lat] = f.geometry.coordinates as [number, number];
        return { lat, lng, address: f.properties.label };
      }
    }
  } catch (err) {
    logger.warn({ err }, "Planning Labs geocode failed during image locate");
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", New York City")}&format=json&limit=1&countrycodes=us`;
    const resp = await fetch(nominatimUrl, {
      headers: { "User-Agent": "CB-CivicNarrative/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (resp.ok) {
      const data = await resp.json() as Array<{ lat: string; lon: string; display_name: string }>;
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name.split(",").slice(0, 3).join(",").trim(),
        };
      }
    }
  } catch (err) {
    logger.warn({ err }, "Nominatim geocode failed during image locate");
  }

  return null;
}

router.post("/", async (req, res) => {
  const { imageBase64, mimeType } = req.body as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!imageBase64 || typeof imageBase64 !== "string") {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const resolvedMimeType =
    mimeType && typeof mimeType === "string" ? mimeType : "image/jpeg";

  try {
    const locationResult = await locateImageInNYC(imageBase64, resolvedMimeType);

    const { confidence, searchQuery, visualDescription } = locationResult;

    if (
      (confidence === "high" || confidence === "medium") &&
      searchQuery
    ) {
      const geocoded = await geocodeSearchQuery(searchQuery);
      if (geocoded) {
        res.json({
          located: true,
          lat: geocoded.lat,
          lng: geocoded.lng,
          address: geocoded.address,
          confidence,
          neighborhood: locationResult.neighborhood,
          borough: locationResult.borough,
          visualDescription,
        });
        return;
      }
    }

    res.json({
      located: false,
      lat: null,
      lng: null,
      address: null,
      confidence,
      neighborhood: locationResult.neighborhood,
      borough: locationResult.borough,
      visualDescription,
    });
  } catch (err) {
    req.log.error({ err }, "Image locate failed");
    res.status(500).json({ error: "Failed to locate image" });
  }
});

export default router;
