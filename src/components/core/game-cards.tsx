import Section from '@/components/layout/section';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Game } from '@/components/core/generator';

type GameCardsProps = {
  games: Game[];
};

export default function GameCards({ games }: GameCardsProps) {
  return (
    <Section>
      <div className="grid gap-6 px-5 md:grid-cols-3">
        {games.map(game => (
          <Card key={game.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{game.name}</h2>
                <span className="text-sm text-muted-foreground">ID: {game.id}</span>
              </div>
            </CardHeader>
            <CardContent>
              {game.teams.map(team => {
                return (
                  <div key={team.id} className="mb-4">
                    <h3 className="text-md font-semibold">{team.name}</h3>
                    {team.players.map(p => p.name).join(', ')}
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
