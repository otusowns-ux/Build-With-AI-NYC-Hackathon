import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, Loader2, MapPin, SearchX, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onLocationFound: (lat: number, lng: number, address: string, visualDescription: string) => void;
  onVisionResult: (description: string, imageDataUrl: string) => void;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
  onError: (msg: string) => void;
}

interface LocateResponse {
  located: boolean;
  lat: number | null;
  lng: number | null;
  address: string | null;
  confidence: "high" | "medium" | "low" | "none";
  neighborhood: string | null;
  borough: string | null;
  visualDescription: string;
}

type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; address: string; confidence: string }
  | { status: "not-found"; reason: string };

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType: file.type || "image/jpeg", dataUrl: result });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  onLocationFound,
  onVisionResult,
  isAnalyzing,
  onStartAnalysis,
  onError,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError("Please upload an image file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      onError("Image must be under 15 MB.");
      return;
    }

    setSearchState({ status: "searching" });
    onStartAnalysis();

    try {
      const { base64, mimeType, dataUrl } = await fileToBase64(file);

      const res = await fetch("/api/narrative/locate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!res.ok) throw new Error("Locate request failed");

      const data = await res.json() as LocateResponse;

      onVisionResult(data.visualDescription, dataUrl);

      if (data.located && data.lat !== null && data.lng !== null && data.address) {
        setSearchState({
          status: "found",
          address: data.address,
          confidence: data.confidence,
        });
        onLocationFound(data.lat, data.lng, data.address, data.visualDescription);
      } else {
        const reason =
          data.confidence === "none"
            ? "No street signs or address markers visible — try a photo with visible signage."
            : "Couldn't pinpoint this block precisely — click a map location to generate its profile.";
        setSearchState({ status: "not-found", reason });
      }
    } catch {
      onError("Search failed. Please try again.");
      setSearchState({ status: "idle" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isSearching = searchState.status === "searching" || isAnalyzing;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="vision-upload"
        disabled={isSearching}
      />

      <label
        htmlFor="vision-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
          border transition-all duration-200 cursor-pointer select-none
          ${isDragging
            ? "border-primary bg-primary/5 text-primary shadow-md"
            : isSearching
              ? "border-border bg-muted/20 text-muted-foreground opacity-70 pointer-events-none"
              : searchState.status === "found"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-border bg-card shadow-sm text-foreground hover:border-foreground/30 hover:bg-muted/50"}
        `}
      >
        {isSearching ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Locating…</span>
          </>
        ) : searchState.status === "found" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[200px]">Found: {searchState.address.split(",")[0]}</span>
            <Camera className="w-3 h-3 shrink-0 opacity-50" />
          </>
        ) : (
          <>
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>Search by photo</span>
            <Camera className="w-3 h-3 text-muted-foreground/60 shrink-0" />
          </>
        )}
      </label>

      <AnimatePresence>
        {searchState.status === "not-found" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-1.5 text-xs text-muted-foreground"
          >
            <SearchX className="w-3 h-3 shrink-0 mt-0.5" />
            <span>{searchState.reason}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
