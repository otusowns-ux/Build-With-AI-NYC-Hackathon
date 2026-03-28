import { useRef, type ChangeEvent } from "react";
import { Camera, Loader2, Eye } from "lucide-react";

interface ImageUploadProps {
  onVisionResult: (description: string, imageDataUrl: string) => void;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
  onError: (msg: string) => void;
}

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ onVisionResult, isAnalyzing, onStartAnalysis, onError }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Please upload an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError("Image must be under 10 MB.");
      return;
    }

    onStartAnalysis();

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const imageDataUrl = `data:${mimeType};base64,${base64}`;

      const res = await fetch("/api/narrative/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!res.ok) {
        throw new Error("Vision analysis failed");
      }

      const data = await res.json() as { visualDescription: string };
      onVisionResult(data.visualDescription, imageDataUrl);
    } catch {
      onError("Gemini couldn't analyze the image. Please try again.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="vision-upload"
      />
      <label
        htmlFor="vision-upload"
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          border border-border bg-card shadow-sm cursor-pointer
          hover:border-foreground/30 hover:bg-muted/50
          transition-all duration-200
          ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Analyzing…</span>
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">Upload photo for vision analysis</span>
            <Camera className="w-3 h-3 text-muted-foreground/60" />
          </>
        )}
      </label>
    </div>
  );
}
