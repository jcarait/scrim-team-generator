'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Section from '@/components/layout/section';
import { shuffle } from '@vitest/utils';

type Game = {
  id: string;
  name: string;
  teams: Team[];
};

type Player = {
  id: string;
  name: string;
  gameCount: number;
};

type Team = {
  [key: string]: Player[];
};

const PLAYERS_PER_GAME = 10;
const TEAMS = 2;
const PLAYERS_PER_TEAM = PLAYERS_PER_GAME / TEAMS;

const initialPlayers = ['Jono', 'Gel', 'Matt', 'Raimie', 'Qwayne', 'El', 'John', 'Mark', 'Matthew', 'Luke', 'Thad', 'Chad', 'Esther', 'Jude', 'Paul'];

// Make a list of 50 initial players with unique names of people
const initialPlayers35 = [
  ...initialPlayers,
  'Alice',
  'Bob',
  'Charlie',
  'David',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
  'Ivan',
  'Judy',
  'Karl',
  'Leo',
  'Mallory',
  'Nina',
  'Oscar',
  'Peggy',
  'Quentin',
  'Rupert',
  'Sybil',
  'Trent',
];

export function Generator() {
  const setupInitialPlayers = (): Player[] => {
    return initialPlayers.map((name, index): Player => {
      return {
        id: (index + 1).toString(),
        name: name,
        gameCount: 0,
      };
    });
  };

  const [totalSessionMinutes, setTotalSessionMinutes] = useState<string>('');
  const [gameMinutes, setGameMinutes] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>(setupInitialPlayers());

  function shuffleCopy<T>(a: T[]): T[] {
    const copy = a.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function divideTeams(players: Player[]): Team[] {
    return Array.from({ length: TEAMS }, (_, i) => ({
      [`Team ${i + 1}`]: players.slice(i * PLAYERS_PER_TEAM, (i + 1) * PLAYERS_PER_TEAM),
    }));
  }

  function generateAllGames(roster: Player[], gamesCount: number): { games: Game[]; players: Player[] } {
    let queue = shuffleCopy(roster);
    const outGames: Game[] = [];

    for (let g = 0; g < gamesCount; g++) {
      if (queue.length < PLAYERS_PER_GAME) break;
      const sorted = queue.sort((a, b) => a.gameCount - b.gameCount); // sort by game count
      const onCourt = sorted.slice(0, PLAYERS_PER_GAME);
      shuffle(onCourt);
      const bench = sorted.slice(PLAYERS_PER_GAME);

      const updatedOnCourt = onCourt.map(p => ({ ...p, gameCount: p.gameCount + 1 }));
      const teams = divideTeams(updatedOnCourt);
      outGames.push({ id: `${g + 1}`, name: `Game ${g + 1}`, teams });

      // rotate: those who played go to the back
      queue = bench.concat(updatedOnCourt);
    }

    return { games: outGames, players: queue }; // queue order = who’s up next / final state
  }

  const onGenerateGames = () => {
    const sessions = calculateNumberOfSessions();
    const start = setupInitialPlayers(); // or memoise (see below)
    const { games: built, players: finalQueue } = generateAllGames(start, sessions);
    setGames(built);
    setPlayers(finalQueue);
  };

  const calculateNumberOfSessions = (): number => {
    const minutesPerSession = parseInt(gameMinutes, 10) || 0;
    const totalMinutes = parseInt(totalSessionMinutes, 10) || 0;

    if (minutesPerSession <= 0 || totalMinutes <= 0) {
      return 0; // Invalid input
    }

    return Math.floor(totalMinutes / minutesPerSession);
  };

  return (
    <>
      <Section>
        <div className="flex flex-col gap-6">
          <div className="flex gap-8 max-w-2/3 mx-auto">
            <div className="grid gap-3">
              <Label>Number of minutes per session</Label>
              <Input
                type="number"
                value={gameMinutes ?? undefined}
                onChange={e => setGameMinutes(e.target.value)}
                placeholder="How many minutes per session?"
              />
            </div>
            <div className="grid gap-3">
              <Label>Total scrimmage minutes</Label>
              <Input
                type="number"
                value={totalSessionMinutes ?? undefined}
                onChange={e => setTotalSessionMinutes(e.target.value)}
                placeholder="Total session minutes"
              />
            </div>
          </div>
          <div className="flex mx-auto">
            <Button onClick={onGenerateGames}>Generate session</Button>
          </div>
        </div>
      </Section>
      <Section>
        <p className="text-xl">{players.length} players</p>
        <ol className="list-decimal">
          {players.map((player, index) => (
            <li key={index}>
              {player.name} | Number of Sessions: {player.gameCount} {}
            </li>
          ))}
        </ol>
      </Section>
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
                  const teamName = Object.keys(team)[0];
                  return (
                    <div key={teamName} className="mb-4">
                      <h3 className="text-md font-semibold">{teamName}</h3>
                      {team[teamName].map(p => p.name).join(', ')}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
