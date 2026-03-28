import type { ArchivalPhoto } from "@workspace/api-client-react/src/generated/api.schemas";

interface PhotoViewerProps {
  year: number;
  photos?: ArchivalPhoto[];
}

export function PhotoViewer({ year, photos }: PhotoViewerProps) {
  const photo = photos?.find(p => p.year === year);

  if (!photo) {
    return (
      <div className="my-8 w-full border border-border bg-muted/20 rounded-sm p-8 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 border border-border border-dashed rounded flex items-center justify-center mb-3 opacity-50">
          <span className="font-serif text-xs">IMG</span>
        </div>
        <p className="text-sm font-medium text-foreground">Archival Record: {year}</p>
        <p className="text-xs text-muted-foreground mt-1">Image temporarily unavailable in municipal archives.</p>
      </div>
    );
  }

  return (
    <figure className="my-10 group relative">
      <div className="relative overflow-hidden rounded-sm border border-border shadow-sm bg-muted/10">
        <img 
          src={photo.url} 
          alt={`Historical view from ${photo.year}`} 
          className="w-full h-auto object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700 ease-out"
          loading="lazy"
        />
        {/* Subtle vignette overlay for documentary feel */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-sm"></div>
      </div>
      
      <figcaption className="mt-4 border-l-2 border-primary/20 pl-4">
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold font-serif mr-2">{photo.year}.</span>
          {photo.description || `Archival municipal record.`}
        </p>
        {photo.source && (
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
            Source: {photo.source}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
