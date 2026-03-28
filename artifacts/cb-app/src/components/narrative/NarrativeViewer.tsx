import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Landmark, Clock, CheckCircle2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { NarrativeResponse } from "@workspace/api-client-react/src/generated/api.schemas";

interface NarrativeViewerProps {
  isLoading: boolean;
  data: NarrativeResponse | undefined;
}

export function NarrativeViewer({ isLoading, data }: NarrativeViewerProps) {
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] w-full px-8 text-center animate-in fade-in duration-500">
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
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] w-full px-8 text-center text-muted-foreground">
        <div className="h-24 w-24 mb-6 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border">
          <MapPin className="h-8 w-8 opacity-20" />
        </div>
        <p className="font-serif text-xl mb-2 text-foreground">Awaiting coordinates</p>
        <p className="max-w-[280px] text-sm leading-relaxed">
          Select a location on the map to generate a comprehensive economic and historical profile of the block.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={data.address}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="pb-24 pt-6 px-2 md:px-8"
      >
        {/* Header Section */}
        <header className="mb-10 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary mb-5">
            <MapPin className="w-3.5 h-3.5" />
            Coordinates: {data.coordinates.lat.toFixed(4)}, {data.coordinates.lng.toFixed(4)}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground mb-6 leading-tight">
            {data.address || "Unnamed Location"}
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

        {/* Narrative Content */}
        <article className="min-w-0">
          <MarkdownRenderer data={data} />
        </article>
      </motion.div>
    </AnimatePresence>
  );
}
