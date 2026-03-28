import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom minimalist marker SVG to avoid Leaflet default icon 404s in Vite
const customMarkerIcon = L.divIcon({
  className: "custom-marker",
  html: `<svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.37258 18.6274 0 12 0ZM12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5Z" fill="hsl(0 0% 9%)"/>
  </svg>`,
  iconSize: [24, 34],
  iconAnchor: [12, 34],
});

interface BlockMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

// Default center: NYC City Hall area
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 };

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyTo({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
}

export function BlockMap({ onLocationSelect, selectedLocation }: BlockMapProps) {
  // Use CartoDB Positron for a clean, minimalist map style that fits the editorial theme
  const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="relative w-full h-full bg-muted/20 border border-border rounded-xl overflow-hidden shadow-sm">
      <MapContainer 
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]} 
        zoom={13} 
        zoomControl={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_URL}
        />
        <MapEvents onLocationSelect={onLocationSelect} />
        <MapFlyTo center={selectedLocation} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={customMarkerIcon}
          />
        )}
      </MapContainer>
      
      {!selectedLocation && (
        <div className="absolute inset-x-0 top-6 z-10 flex justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border text-sm font-medium text-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Click anywhere on the map to investigate
          </div>
        </div>
      )}
    </div>
  );
}
