type PlacementStory = {
  name: string;
  outcome: string;
  quote: string;
};

// Real placements only. This section stays invisible until the first true story lands here.
const PLACEMENT_STORIES: PlacementStory[] = [];

export function PlacementStories() {
  if (PLACEMENT_STORIES.length === 0) return null;
  return (
    <section aria-label="Placement stories" className="mt-10 border-t border-border pt-8">
      <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Placements
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {PLACEMENT_STORIES.map((story) => (
          <figure key={story.name} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <blockquote className="text-sm leading-relaxed">&ldquo;{story.quote}&rdquo;</blockquote>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {story.name} · {story.outcome}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
