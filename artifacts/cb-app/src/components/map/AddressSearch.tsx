import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Search, Loader2 } from "lucide-react";

interface AddressSearchProps {
  onLocationFound: (lat: number, lng: number, label: string) => void;
  disabled?: boolean;
}

interface PlanningLabsFeature {
  geometry: { coordinates: [number, number] };
  properties: { label: string };
}

async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  try {
    const planningUrl = `https://geosearch.planninglabs.nyc/v2/search?text=${encodeURIComponent(query)}&size=1`;
    const planningRes = await fetch(planningUrl);
    if (planningRes.ok) {
      const planningData = await planningRes.json() as { features?: PlanningLabsFeature[] };
      if (planningData.features && planningData.features.length > 0) {
        const feature = planningData.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng, label: feature.properties.label };
      }
    }
  } catch {
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", New York City")}&format=json&limit=1`;
    const nominatimRes = await fetch(nominatimUrl, {
      headers: { "Accept-Language": "en" },
    });
    if (nominatimRes.ok) {
      const nominatimData = await nominatimRes.json() as Array<{ lat: string; lon: string; display_name: string }>;
      if (nominatimData.length > 0) {
        return {
          lat: parseFloat(nominatimData[0].lat),
          lng: parseFloat(nominatimData[0].lon),
          label: nominatimData[0].display_name,
        };
      }
    }
  } catch {
  }

  return null;
}

export function AddressSearch({ onLocationFound, disabled }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching || disabled) return;

    setIsSearching(true);
    setError(null);

    try {
      const result = await geocodeAddress(trimmed);
      if (result) {
        onLocationFound(result.lat, result.lng, result.label);
        setQuery("");
      } else {
        setError("Address not found in NYC. Try a more specific address.");
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="px-4 pt-3 pb-2 border-b border-border bg-card/30 shrink-0">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search any NYC address…"
            disabled={isSearching || disabled}
            className="w-full pl-9 pr-10 py-2 text-sm bg-background border border-border rounded-lg
              placeholder:text-muted-foreground/60 text-foreground
              focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching || disabled}
            className="absolute right-2 p-1 rounded-md text-muted-foreground
              hover:text-foreground hover:bg-muted/50
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
            aria-label="Search address"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500/80 px-1">{error}</p>
        )}
      </form>
    </div>
  );
}
