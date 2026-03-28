import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Landmark, Clock, CheckCircle2, AlertCircle, Plus, Check } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ImageUpload } from "./ImageUpload";
import type { NarrativeResponse } from "@workspace/api-client-react/src/generated/api.schemas";

export interface VisionState {
  description: string;
  imageDataUrl: string;
}

interface NarrativeViewerProps {
  isLoading: boolean;
  data: NarrativeResponse | undefined;
  addressLabel?: string | null;
  vision: VisionState | null;
  isAnalyzing: boolean;
  visionError: string | null;
  selectedLocation?: { lat: number; lng: number } | null;
  onVisionResult: (description: string, imageDataUrl: string) => void;
  onStartAnalysis: () => void;
  onVisionError: (msg: string) => void;
  onAddToComparison?: () => void;
  isInComparison?: boolean;
  comparisonFull?: boolean;
}

export function NarrativeViewer({
  isLoading,
  data,
  addressLabel,
  vision,
  isAnalyzing,
  visionError,
  selectedLocation,
  onVisionResult,
  onStartAnalysis,
  onVisionError,
  onAddToComparison,
  isInComparison,
  comparisonFull,
}: NarrativeViewerProps) {

  const uploadBar = (
    <div className="px-2 md:px-8 pt-5 pb-3 flex flex-col gap-2">
      <ImageUpload
        onVisionResult={onVisionResult}
        isAnalyzing={isAnalyzing}
        onStartAnalysis={onStartAnalysis}
        onError={onVisionError}
        selectedLocation={selectedLocation}
      />
      {visionError && (
        <div className="flex items-center gap-1.5 text-xs text-red-500/80 px-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {visionError}
        </div>
      )}
      {vision && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 rounded-xl border border-border bg-muted/20 overflow-hidden"
        >
          <div className="flex gap-3 p-3">
            <img
              src={vision.imageDataUrl}
              alt="Uploaded building photo"
              className="w-20 h-20 object-cover rounded-lg border border-border shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                What Gemini Sees
              </p>
              <p className="text-sm text-foreground leading-relaxed">{vision.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-[500px] w-full">
        {uploadBar}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-in fade-in duration-500">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md"
          >
            <div className="mb-8 flex justify-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-2 border-border border-t-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-border/50 border-b-foreground animate-spin-reverse"></div>
              </div>
            </div>

            <h2 className="font-serif text-2xl font-medium tracking-tight mb-4 text-foreground">
              Synthesizing municipal datasets
              <span className="inline-flex w-8 ml-1 text-left">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
                >.</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, times: [0, 0.5, 1] }}
                >.</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, times: [0, 0.5, 1] }}
                >.</motion.span>
              </span>
            </h2>

            <div className="space-y-3 text-sm text-muted-foreground text-left mt-8 border border-border/50 bg-muted/20 p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary opacity-50 animate-pulse" />
                <span>Querying NYC PLUTO Property Database</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary opacity-50 animate-pulse" style={{ animationDelay: '300ms' }}/>
                <span>Cross-referencing HMDA Mortgage Records</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary opacity-50 animate-pulse" style={{ animationDelay: '600ms' }}/>
                <span>Retrieving SBA PPP Loan Distributions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary opacity-50 animate-pulse" style={{ animationDelay: '900ms' }}/>
                <span>Generating cohesive civic narrative</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full min-h-[500px] w-full">
        {uploadBar}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center text-muted-foreground">
          <div className="h-24 w-24 mb-6 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border">
            <MapPin className="h-8 w-8 opacity-20" />
          </div>
          <p className="font-serif text-xl mb-2 text-foreground">Awaiting coordinates</p>
          <p className="max-w-[280px] text-sm leading-relaxed">
            Select a location on the map, search an address, or upload a photo to generate a comprehensive profile of the block.
          </p>
        </div>
      </div>
    );
  }

  const displayAddress = addressLabel || data.address || "Unnamed Location";

  return (
    <div className="flex flex-col h-full">
      {uploadBar}
      <AnimatePresence mode="wait">
        <motion.div
          key={data.address}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pb-24 px-2 md:px-8"
        >
          {/* Header Section */}
          <header className="mb-10 border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary mb-5">
              <MapPin className="w-3.5 h-3.5" />
              Coordinates: {data.coordinates.lat.toFixed(4)}, {data.coordinates.lng.toFixed(4)}
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground mb-6 leading-tight">
              {displayAddress}
            </h2>

            {/* Property Data Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {data.propertyData?.yearBuilt && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-xs text-foreground font-medium shadow-sm hover:border-muted-foreground/30 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Built {data.propertyData.yearBuilt}</span>
                </div>
              )}
              {data.propertyData?.landUse && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-xs text-foreground font-medium shadow-sm hover:border-muted-foreground/30 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="capitalize">{data.propertyData.landUse.toLowerCase()}</span>
                </div>
              )}
              {data.propertyData?.zoning && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-xs text-foreground font-medium shadow-sm hover:border-muted-foreground/30 transition-colors">
                  <div className="w-3.5 h-3.5 flex items-center justify-center bg-muted-foreground/20 rounded-sm text-[8px] font-bold">Z</div>
                  <span>Zone {data.propertyData.zoning}</span>
                </div>
              )}
              {data.landmarkData?.isLandmark && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/50 border border-accent rounded-md text-xs text-foreground font-medium shadow-sm hover:bg-accent transition-colors">
                  <Landmark className="w-3.5 h-3.5 text-foreground" />
                  <span>Historic Landmark</span>
                </div>
              )}
            </div>
          </header>

          {/* Archival Photo Strip — shows first 1-2 OldNYC photos above narrative */}
          {data.photos && data.photos.length > 0 && (
            <div className="mb-10 space-y-6">
              {data.photos.slice(0, 2).map((photo, i) => (
                <figure key={`${photo.url}-${i}`} className="group relative">
                  <div className="relative overflow-hidden rounded-sm border border-border shadow-sm bg-muted/10">
                    <img
                      src={photo.url}
                      alt={`Historical view from ${photo.year}`}
                      className="w-full h-auto object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700 ease-out"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget.closest("figure") as HTMLElement | null)?.style.setProperty("display", "none"); }}
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-sm" />
                  </div>
                  <figcaption className="mt-3 border-l-2 border-primary/20 pl-4">
                    {photo.description && (
                      <p className="text-sm leading-relaxed text-foreground">
                        <span className="font-bold font-serif mr-2">{photo.year}.</span>
                        {photo.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 tracking-wide uppercase">
                      Photo: {photo.source}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {/* Narrative Content */}
          <article className="min-w-0">
            <MarkdownRenderer data={data} />
          </article>

          {/* Add to Comparison */}
          {onAddToComparison && (
            <div className="mt-10 pt-6 border-t border-border/50">
              <button
                onClick={onAddToComparison}
                disabled={isInComparison || comparisonFull}
                className={`
                  inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200
                  ${isInComparison
                    ? "bg-primary/5 border-primary/20 text-primary cursor-default"
                    : comparisonFull
                      ? "bg-muted/30 border-border text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-card border-border text-foreground hover:bg-muted/50 hover:border-foreground/30 shadow-sm"}
                `}
              >
                {isInComparison ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Comparison
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {comparisonFull ? "Comparison Full (max 3)" : "+ Add to Comparison"}
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
