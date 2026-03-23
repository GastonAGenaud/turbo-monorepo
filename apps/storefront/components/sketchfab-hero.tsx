export function SketchfabHero() {
  return (
    <div className="relative h-full min-h-[540px] w-full overflow-hidden bg-[color:var(--card-strong)]">
      <iframe
        title="SOUTH PARK Tegridy Weed from Tegridy Farms"
        className="h-full w-full"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking; web-share"
        src="https://sketchfab.com/models/68395f8ce9714bf2823c5cdbd31135d2/embed"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.12),rgba(7,9,13,0.62)_90%)]" />
      <div className="absolute bottom-4 left-4 right-4 rounded-[20px] border border-[var(--line)] bg-[color:var(--card)]/78 p-3 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Modelo embebido de referencia
        </p>
        <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
          South Park // Tegridy Weed from Tegridy Farms por Von Rapozzo en Sketchfab.
        </p>
      </div>
    </div>
  );
}
