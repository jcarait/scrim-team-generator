import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Game } from '@/components/core/generator';

type HistoryRunProps = {
  games: Game[];
  label?: string;
};

export default function HistoryRun({ games, label }: HistoryRunProps) {
  return (
    <div className="grid gap-4">
      {label && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">{label}</p>}
      {games.map(game => (
        <Card
          key={game.id}
          className="border border-primary/15 bg-white/95 shadow-[0_12px_30px_-18px_rgba(194,104,20,0.4)] backdrop-blur">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-primary/80">{game.name}</h2>
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-primary/60">
                {game.teams.reduce((total, team) => total + team.players.length, 0)} players
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-foreground/85">
            {game.teams.map(team => (
              <div key={team.id} className="rounded-md border border-primary/10 bg-orange-50/60 p-3 shadow-sm shadow-orange-100/25">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold uppercase tracking-wide text-primary/80">{team.name}</span>
                  <span className="text-[0.62rem] font-medium text-primary/60">Players: {team.players.length}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {team.players.map(player => (
                    <span
                      key={player.id}
                      className="rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-[0.7rem] font-medium text-foreground/80 shadow-sm">
                      {player.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
