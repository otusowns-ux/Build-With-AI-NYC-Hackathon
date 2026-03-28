import { ai } from "@workspace/integrations-gemini-ai";
import type { PropertyData, LandmarkData, MortgageData, PPPData, ArchivalPhoto } from "./data";

interface NarrativeInput {
  address: string;
  propertyData: PropertyData | null;
  landmarkData: LandmarkData | null;
  mortgageData: MortgageData;
  pppData: PPPData;
  photos: ArchivalPhoto[];
}

export async function generateCivicNarrative(input: NarrativeInput): Promise<string> {
  const { address, propertyData, landmarkData, mortgageData, pppData, photos } = input;

  const propertySection = propertyData
    ? `Address: ${propertyData.address || address}
Borough: ${propertyData.borough || "Unknown"}
Year Built: ${propertyData.yearBuilt ?? "Unknown"}
Current Land Use: ${propertyData.landUse ?? "Unknown"}
Zoning District: ${propertyData.zoning ?? "Unknown"}
Building Area: ${propertyData.bldgArea ? `${propertyData.bldgArea.toLocaleString()} sq ft` : "Unknown"}
Floors: ${propertyData.numFloors ?? "Unknown"}
Total Units: ${propertyData.unitsTotal ?? "Unknown"}`
    : `Address: ${address}
(Full PLUTO property data unavailable for this location)`;

  const landmarkSection = landmarkData
    ? landmarkData.isLandmark
      ? `Landmark Status: YES
Landmark Name: ${landmarkData.landmarkName ?? "Unknown"}
Designation Type: ${landmarkData.designation ?? "Unknown"}
Designated: ${landmarkData.designationDate ?? "Unknown"}`
      : "Landmark Status: No landmark designation on record"
    : "Landmark Status: Data unavailable";

  const photoList = photos.length > 0
    ? photos
        .map((p) => `- ${p.year}: ${p.description ?? "Archival photograph"} (${p.source})`)
        .join("\n")
    : "No archival photographs found for this immediate location";

  const systemPrompt = `You are CB — a civic narrative agent for New York City.

Your job is to synthesize verified data into a single interleaved narrative about a specific NYC block.
Write in a precise, journalistic voice. Be factual and specific. Do not editorialize or moralize.
State what happened and what the numbers show. Let the data speak.

Format your response as interleaved Markdown:
- Write paragraphs of narrative
- Insert [PHOTO: YEAR] on its own line after the sentence that introduces that era, so the visual lands at the right moment. Only insert if photos for that year are available.
- Insert [CHART: mortgage_denial] on its own line when lending/mortgage data is discussed
- Insert [CHART: ppp_coverage] on its own line when pandemic relief data is discussed
- Continue narrative

Rules:
- Only describe conditions directly supported by the provided data
- If a data field is absent or zero, note the absence factually rather than speculate
- Only compare to city averages when that comparison is provided
- Anchor each era to a provided year — do not invent historical context beyond what the data supplies
- Do not editorialize. Do not moralize. Do not make policy recommendations
- 200-300 words maximum
- Do not invent street names, building names, or historical events not supported by the data`;

  const userPrompt = `Generate a narrative for this NYC block.

PROPERTY DATA (PLUTO):
${propertySection}

LANDMARK STATUS (LPC):
${landmarkSection}

FINANCIAL DATA (HMDA 2023):
Mortgage denial rate (zip ${mortgageData.zipCode}): ${mortgageData.denialRate}%
City average denial rate: ${mortgageData.cityAvgDenialRate}%
Total applications: ${mortgageData.totalApplications.toLocaleString()}
Total denials: ${mortgageData.totalDenials.toLocaleString()}

PANDEMIC RELIEF (SBA PPP 2020-2021):
Zip code: ${pppData.zipCode}
Total PPP loans: ${pppData.totalLoans.toLocaleString()}
Total PPP amount: $${pppData.totalAmount.toLocaleString()}
Business coverage rate: ${pppData.coverageRate}%
City average coverage rate: ${pppData.cityAvgCoverageRate}%

ARCHIVAL PHOTOS AVAILABLE (OldNYC / NYPL Milstein Collection):
${photoList}

Generate a chronological narrative anchored to this data. Move from the earliest dated reference to the present.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 8192,
    },
  });

  return response.text ?? "No narrative could be generated for this location.";
}
