import Section from '@/components/layout/section';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Game } from '@/components/core/generator';

type GameCardsProps = {
  games: Game[];
};

export default function GameCards({ games }: GameCardsProps) {
  return (
    <Section>
      <div className="grid gap-4 px-4 sm:grid-cols-2 md:grid-cols-3" id="game-cards-section">
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
            <CardContent>
              {game.teams.map(team => {
                return (
                  <div key={team.id} className="mb-4 rounded-lg bg-orange-50/60 p-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary/90">{team.name}</h3>
                    <p className="mt-1 text-sm text-foreground/80">
                      {team.players
                        .map(player => {
                          if (player.gender === 'male') return `${player.name} (M)`;
                          if (player.gender === 'female') return `${player.name} (F)`;
                          return player.name;
                        })
                        .join(', ')}
                    </p>
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
