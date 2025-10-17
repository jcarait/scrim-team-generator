import Generator from '@/components/core/generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
      <header className="w-full pt-12 pb-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Balanced scrimmage planner
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Craft balanced basketball teams in seconds
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Paste your roster, set the pace, and let the generator handle gender balance plus rest rotations for every pickup game.
          </p>
        </div>
      </header>
      <Generator />
    </main>
  );
}
