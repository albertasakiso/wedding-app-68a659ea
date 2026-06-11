export default function ProgrammeSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 md:py-16 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-primary/10" />
        <div className="h-3 w-32 bg-muted/60 rounded" />
        <div className="h-12 w-64 bg-primary/15 rounded" />
        <div className="h-3 w-40 bg-muted/60 rounded" />
        <div className="h-12 w-64 bg-primary/15 rounded" />
        <div className="h-px w-24 bg-primary/30 my-4" />
        <div className="h-6 w-56 bg-muted/60 rounded" />
        <div className="h-4 w-72 bg-muted/40 rounded" />
      </div>
      <div className="mt-16 max-w-2xl mx-auto space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-baseline border-b border-primary/10 pb-3">
            <div className="h-5 w-8 bg-primary/15 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/60 rounded" />
              <div className="h-3 w-1/3 bg-muted/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
