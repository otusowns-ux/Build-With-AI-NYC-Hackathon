import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DataChart } from "./DataChart";
import { PhotoViewer } from "./PhotoViewer";
import type { NarrativeResponse } from "@workspace/api-client-react/src/generated/api.schemas";

interface MarkdownRendererProps {
  data: NarrativeResponse;
}

export function MarkdownRenderer({ data }: MarkdownRendererProps) {
  const { narrative, mortgageData, pppData, photos } = data;

  if (!narrative) return null;

  // Split the narrative string by our custom markers: [PHOTO: year] and [CHART: type]
  // The regex captures the delimiter so it's included in the resulting array
  const parts = narrative.split(/(\[PHOTO:\s*\d+\]|\[CHART:\s*[a-zA-Z_]+\])/g);

  return (
    <div className="prose prose-gray max-w-none">
      {parts.map((part, index) => {
        // Handle Photo Marker
        const photoMatch = part.match(/\[PHOTO:\s*(\d+)\]/);
        if (photoMatch) {
          const year = parseInt(photoMatch[1], 10);
          return <PhotoViewer key={`photo-${index}`} year={year} photos={photos} />;
        }

        // Handle Chart Marker
        const chartMatch = part.match(/\[CHART:\s*([a-zA-Z_]+)\]/);
        if (chartMatch) {
          const type = chartMatch[1];
          return (
            <DataChart 
              key={`chart-${index}`} 
              type={type} 
              mortgageData={mortgageData} 
              pppData={pppData} 
            />
          );
        }

        // Handle Standard Markdown Text
        // Only render if it's not empty whitespace
        if (part.trim().length > 0) {
          return (
            <ReactMarkdown key={`md-${index}`} remarkPlugins={[remarkGfm]}>
              {part}
            </ReactMarkdown>
          );
        }

        return null;
      })}
    </div>
  );
}
