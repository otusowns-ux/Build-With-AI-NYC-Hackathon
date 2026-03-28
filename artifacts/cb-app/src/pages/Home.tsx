import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BlockMap } from "@/components/map/BlockMap";
import { AddressSearch } from "@/components/map/AddressSearch";
import { NarrativeViewer, type VisionState } from "@/components/narrative/NarrativeViewer";
import { ComparisonTray, type ComparisonEntry } from "@/components/comparison/ComparisonTray";
import { ComparisonModal } from "@/components/comparison/ComparisonModal";
import { useNarrative, useDemoBlocks } from "@/hooks/use-narrative";
import { MapPin } from "lucide-react";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressLabel, setAddressLabel] = useState<string | null>(null);

  const [vision, setVision] = useState<VisionState | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);

  const [comparisonTray, setComparisonTray] = useState<ComparisonEntry[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const { generateNarrative, isLoading, data: narrativeData } = useNarrative();
  const { blocks: demoBlocks, isLoading: blocksLoading } = useDemoBlocks();

  const handleLocationSelect = async (lat: number, lng: number, label?: string) => {
    setSelectedLocation({ lat, lng });
    if (label) setAddressLabel(label);
    else setAddressLabel(null);
    try {
      await generateNarrative({ lat, lng });
    } catch (error) {
      console.error("Failed to generate narrative:", error);
    }
  };

  const handleAddressFound = async (lat: number, lng: number, label: string) => {
    await handleLocationSelect(lat, lng, label);
  };

  const handleVisionResult = (description: string, imageDataUrl: string) => {
    setVision({ description, imageDataUrl });
    setIsAnalyzing(false);
    setVisionError(null);
  };

  const handleImageLocationFound = async (
    lat: number,
    lng: number,
    address: string,
    _visualDescription: string,
  ) => {
    setSelectedLocation({ lat, lng });
    setAddressLabel(address);
    setIsAnalyzing(false);
    try {
      await generateNarrative({ lat, lng });
    } catch (error) {
      console.error("Failed to generate narrative from image locate:", error);
    }
  };

  const handleAddToComparison = () => {
    if (!narrativeData || comparisonTray.length >= 3) return;
    const id = `${narrativeData.coordinates.lat}_${narrativeData.coordinates.lng}`;
    if (comparisonTray.some((e) => e.id === id)) return;

    const entry: ComparisonEntry = {
      id,
      address: addressLabel || narrativeData.address || "Unknown location",
      yearBuilt: narrativeData.propertyData?.yearBuilt ?? null,
      pppCoverageRate: narrativeData.pppData?.coverageRate ?? null,
      mortgageDenialRate: narrativeData.mortgageData?.denialRate ?? null,
      lat: narrativeData.coordinates.lat,
      lng: narrativeData.coordinates.lng,
    };

    setComparisonTray((prev) => [...prev, entry]);
  };

  const handleRemoveFromComparison = (id: string) => {
    setComparisonTray((prev) => prev.filter((e) => e.id !== id));
    if (comparisonTray.length <= 1) setIsComparisonOpen(false);
  };

  const currentLocationId = narrativeData
    ? `${narrativeData.coordinates.lat}_${narrativeData.coordinates.lng}`
    : null;

  const isInComparison = currentLocationId
    ? comparisonTray.some((e) => e.id === currentLocationId)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden selection:bg-primary/10">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)]">

        {/* LEFT PANEL: Map & Controls */}
        <section className="w-full lg:w-2/5 flex flex-col border-r border-border bg-muted/5 z-10 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

          {/* Demo Blocks Bar */}
          <div className="p-4 border-b border-border bg-card/50 backdrop-blur shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Explore Demo Blocks
            </h3>
            <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-2 px-3">
              {blocksLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-9 w-28 shrink-0 bg-muted/50 rounded-full animate-pulse border border-border/50"></div>
                ))
              ) : (
                demoBlocks.map((block) => (
                  <button
                    key={block.name}
                    onClick={() => handleLocationSelect(block.lat, block.lng)}
                    disabled={isLoading}
                    className={`
                      shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium
                      transition-all duration-200 border whitespace-nowrap
                      ${selectedLocation?.lat === block.lat
                        ? 'bg-foreground text-background border-foreground shadow-md'
                        : 'bg-card text-foreground border-border hover:border-foreground/30 hover:bg-muted/50 shadow-sm'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <MapPin className="w-3 h-3" />
                    {block.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Address Search Bar */}
          <AddressSearch
            onLocationFound={handleAddressFound}
            disabled={isLoading}
          />

          {/* Map Container */}
          <div className="flex-1 p-4 pb-4 h-full relative">
            <BlockMap
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </div>
        </section>

        {/* RIGHT PANEL: Narrative Output */}
        <section className="w-full lg:w-3/5 h-full overflow-y-auto overflow-x-hidden bg-background relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background))_90%)] pointer-events-none h-16 bottom-0 top-auto z-10" />
          <div className="max-w-3xl mx-auto h-full">
            <NarrativeViewer
              isLoading={isLoading}
              data={narrativeData}
              addressLabel={addressLabel}
              vision={vision}
              isAnalyzing={isAnalyzing}
              visionError={visionError}
              selectedLocation={selectedLocation}
              onVisionResult={handleVisionResult}
              onLocationFound={handleImageLocationFound}
              onStartAnalysis={() => { setIsAnalyzing(true); setVisionError(null); }}
              onVisionError={(msg) => { setVisionError(msg); setIsAnalyzing(false); }}
              onAddToComparison={narrativeData && !isLoading ? handleAddToComparison : undefined}
              isInComparison={isInComparison}
              comparisonFull={comparisonTray.length >= 3 && !isInComparison}
            />
          </div>
        </section>

      </main>

      {/* Comparison Tray — fixed bottom bar */}
      <ComparisonTray
        entries={comparisonTray}
        onRemove={handleRemoveFromComparison}
        onCompare={() => setIsComparisonOpen(true)}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        entries={comparisonTray}
        open={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
}
