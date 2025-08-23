'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Section from '@/components/layout/section';

type Game = {
  id: string;
  name: string;
  players: Player[];
  teamA: Player[];
  teamB: Player[];
};

type Player = {
  id: string;
  name: string;
  gameCount: number;
};

export function Generator() {
  const MAX_PLAYERS_PER_SESSION = 10;

  const initialPlayers = [
    'Jono',
    'Gel',
    'Matt',
    'Raimie',
    'Qwayne',
    'El',
    'John',
    'Mark',
    'Matthew',
    'Luke',
    'Thad',
    'Chad',
    'Esther',
    'Jude',
    'Paul',
  ];

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
  const [game, setGame] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>(setupInitialPlayers());

  const generateGames = () => {
    setGame([]);
    setPlayers([...setupInitialPlayers()]);
    const sessions = calculateNumberOfSessions();

    let result: { session: Game; players: Player[] }[] = [];

    for (let i = 0; i < sessions; i++) {
      result = [...result, generateGame((i + 1).toString(), `Game ${i + 1}`, result[result.length - 1]?.players ?? setupInitialPlayers())];
    }

    setPlayers(result[result.length - 1].players);
    setGame(result.map(rs => rs.session));
  };

  const generateGame = (id: string, sessionName: string, players: Player[]): { session: Game; players: Player[] } => {
    const gamePlayers: Player[] = [];
    let updatedPlayers: Player[] = [...players];
    let playersLowestGameCount: Player[];
    let lowestGameCount = 0;

    // Find lowest session count
    lowestGameCount = Math.min(...updatedPlayers.map(p => p.gameCount));

    // Find players with the lowest session count
    playersLowestGameCount = updatedPlayers.filter(p => p.gameCount === lowestGameCount);

    if (playersLowestGameCount.length < MAX_PLAYERS_PER_SESSION) {
      // If there are not enough players with the lowest session count, include players with the next lowest count
      lowestGameCount = lowestGameCount + 1;
      // Filter players with the next lowest session count
      const nextPlayersLowestGameCount = updatedPlayers.filter(p => p.gameCount === lowestGameCount);
      shuffle(nextPlayersLowestGameCount);

      // If filtered players and lowest session players are more than MAX_PLAYERS_PER SESSION, we need to cut down the filtered players
      if (playersLowestGameCount.length + nextPlayersLowestGameCount.length > MAX_PLAYERS_PER_SESSION) {
        const playersNeeded = MAX_PLAYERS_PER_SESSION - playersLowestGameCount.length;
        playersLowestGameCount = [...playersLowestGameCount, ...nextPlayersLowestGameCount.slice(0, playersNeeded)];
      }
    }

    for (let i = 0; i < MAX_PLAYERS_PER_SESSION; i++) {
      // Filter out players that are already in the session set
      const filtered = playersLowestGameCount.filter(p => !gamePlayers.some(sp => sp.id === p.id));

      // Choose a random player that is not already in the session
      const selectedPlayer = filtered[Math.floor(Math.random() * filtered.length)];
      const updatedPlayer = { ...selectedPlayer, sessionCount: selectedPlayer.gameCount + 1 };

      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === updatedPlayer.id) {
          return {
            ...p,
            ...updatedPlayer,
          };
        }

        return p;
      });

      gamePlayers.push(updatedPlayer);
    }

    const shuffledSessionPlayers = [...gamePlayers];
    shuffle(shuffledSessionPlayers);

    const session: Game = {
      id: id,
      name: sessionName,
      players: gamePlayers,
      teamA: shuffledSessionPlayers.slice(0, MAX_PLAYERS_PER_SESSION / 2),
      teamB: shuffledSessionPlayers.slice(MAX_PLAYERS_PER_SESSION / 2, MAX_PLAYERS_PER_SESSION),
    };

    return { session, players: updatedPlayers };
  };

  const calculateNumberOfSessions = (): number => {
    if (!totalSessionMinutes || !gameMinutes) return 0;
    return Math.floor(Number(totalSessionMinutes) / Number(gameMinutes));
  };

  function shuffle<T>(arr: T[]) {
    let currentIndex = arr.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
  }

  console.log(players);
  console.log(game);

  return (
    <>
      <Section>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl text-center">Scrim Team Generator</h1>
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
            <Button onClick={generateGames}>Generate session</Button>
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
          {game.map(session => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{session.name}</h2>
                  <span className="text-sm text-muted-foreground">ID: {session.id}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mt-1">Team A: {Array.from(session.teamA.map(p => p.name)).join(', ')}</p>
                <p className="text-sm text-muted-foreground mt-1">Team B: {Array.from(session.teamB.map(p => p.name)).join(', ')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
