import Section from '@/components/layout/section';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Game } from '@/components/core/generator';
import { Button } from '@/components/ui/button';

type GameCardsProps = {
  games: Game[];
  onRegenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
};

export default function GameCards({
  games,
  onRegenerate,
  onReset,
  isGenerating,
}: GameCardsProps) {
  return (
    <Section>
      <div className="mb-4 flex flex-col items-stretch gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Game Plan</h2>
          <p className="text-sm text-muted-foreground">Balanced matchups ready to go—shuffle again anytime.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" className="sm:w-auto" onClick={onReset} disabled={isGenerating}>
            Start Over
          </Button>
          <Button className="sm:w-auto" onClick={onRegenerate} disabled={isGenerating}>
            Shuffle Teams
          </Button>
        </div>
      </div>
      <div className="grid gap-4 px-4 sm:grid-cols-2 xl:grid-cols-3" id="game-cards-section">
        {games.map(game => (
          <Card
            key={game.id}
            className="border border-primary/15 bg-white/95 shadow-[0_16px_40px_-20px_rgba(194,104,20,0.35)] backdrop-blur transition hover:-translate-y-[2px] hover:shadow-[0_18px_46px_-18px_rgba(194,104,20,0.45)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{game.name}</h2>
                <span className="text-sm text-muted-foreground">ID: {game.id}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {game.teams.map(team => {
                return (
                  <div key={team.id} className="rounded-lg border border-primary/10 bg-orange-50/60 p-3 shadow-sm shadow-orange-200/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary/90">{team.name}</h3>
                      <span className="text-xs font-medium text-primary/70">Players: {team.players.length}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {team.players.map(player => {
                        const genderSuffix = player.gender === 'male' ? 'M' : player.gender === 'female' ? 'F' : null;
                        return (
                          <span
                            key={player.id}
                            className="flex items-center gap-1 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm">
                            <span>{player.name}</span>
                            {genderSuffix && (
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-semibold ${
                                  genderSuffix === 'M'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                {genderSuffix}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
