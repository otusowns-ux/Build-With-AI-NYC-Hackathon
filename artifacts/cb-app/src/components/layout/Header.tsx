import { MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <span className="font-serif text-xl font-bold italic">CB</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold leading-none tracking-tight">New York City Block Stories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Click any block. See the full economic and historical picture.</p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
            <MapPin className="h-3 w-3" />
            <span>Interactive Demo</span>
          </div>
        </div>
      </div>
    </header>
  );
}
