'use client';

import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import Section from '@/components/layout/section';
import { shuffle } from '@vitest/utils';
import GameCards from '@/components/core/game-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CirclePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Game = {
  id: string;
  name: string;
  teams: Team[];
};

type Player = {
  name: string;
  gameCount: number;
  gamesPlayed: number;
};

type Team = {
  id: string;
  name: string;
  players: Player[];
};

const PLAYERS_PER_GAME = 10;
const TEAMS = 2;
const PLAYERS_PER_TEAM = PLAYERS_PER_GAME / TEAMS;

// const initialPlayers = ['Jono', 'Gel', 'Matt', 'Raimie', 'Qwayne', 'El', 'John', 'Mark', 'Matthew', 'Luke', 'Thad', 'Chad', 'Esther', 'Jude', 'Paul'];
//
// // Make a list of 50 initial players with unique names of people
// const initialPlayers35 = [
//   ...initialPlayers,
//   'Alice',
//   'Bob',
//   'Charlie',
//   'David',
//   'Eve',
//   'Frank',
//   'Grace',
//   'Heidi',
//   'Ivan',
//   'Judy',
//   'Karl',
//   'Leo',
//   'Mallory',
//   'Nina',
//   'Oscar',
//   'Peggy',
//   'Quentin',
//   'Rupert',
//   'Sybil',
//   'Trent',
// ];

export default function Generator() {
  // const setupInitialPlayers = (): Player[] => {
  //   return initialPlayers.map((name, index): Player => {
  //     return {
  //       id: (index + 1).toString(),
  //       name: name,
  //       gameCount: 0,
  //     };
  //   });
  // };

  const [totalSessionMinutes, setTotalSessionMinutes] = useState<string>('');
  const [gameMinutes, setGameMinutes] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rawPlayerInput, setRawPlayerInput] = useState<string>('');

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
      id: (i + 1).toString(),
      name: `Team ${i + 1}`,
      players: players.slice(i * PLAYERS_PER_TEAM, (i + 1) * PLAYERS_PER_TEAM),
    }));
  }

  function generateAllGames(roster: Player[], gamesCount: number): { games: Game[]; players: Player[] } {
    let queue = shuffleCopy(roster);
    const outGames: Game[] = [];

    for (let g = 0; g < gamesCount; g++) {
      if (queue.length < PLAYERS_PER_GAME) break;
      const sorted = queue.sort((a, b) => a.gameCount - b.gameCount);
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

    const playerReset = players.map(p => ({ ...p, gameCount: 0 }));

    if (sessions < 1) {
      alert('Please enter valid session minutes and total scrimmage minutes.');
      return;
    }

    if (players.length < 1) {
      alert('Please add players before generating games.');
      return;
    }

    const { games: built, players: finalQueue } = generateAllGames(playerReset, sessions);
    setGames(built);
    setPlayers(finalQueue.sort((a, b) => a.name.localeCompare(b.name)));

    window.scrollTo({ top: 5, behavior: 'smooth' });
  };

  const calculateNumberOfSessions = (): number => {
    const minutesPerSession = parseInt(gameMinutes, 10) || 0;
    const totalMinutes = parseInt(totalSessionMinutes, 10) || 0;

    if (minutesPerSession <= 0 || totalMinutes <= 0) {
      return 0; // Invalid input
    }

    return Math.floor(totalMinutes / minutesPerSession);
  };

  const handleAddPlayers = (): void => {
    const tokens = rawPlayerInput
      .split(/\r?\n|,/)
      .map(s => s.replace(/^[^A-Za-z]+/, '').trim())
      .filter(Boolean);

    // Case-insensitive dedupe while preserving first-seen casing
    const seen = new Set<string>();
    const uniqueTokens: string[] = [];
    for (const name of tokens) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTokens.push(name);
      }
    }

    const cleaned = uniqueTokens.join(', ');
    setRawPlayerInput(cleaned);

    const newPlayers: Player[] = uniqueTokens
      .filter(name => !players.find(p => p.name.toLowerCase() === name.toLowerCase()))
      .map((name, index) => ({
        id: (players.length + index + 1).toString(),
        name,
        gameCount: 0,
        gamesPlayed: 0,
      }));

    setPlayers(prev => [...prev, ...newPlayers]);
  };

  const removePlayer = (name: string): void => {
    setPlayers(prev => prev.filter(p => p.name !== name));
  };

  return (
    <>
      {/* ========= GAME SETTINGS =========*/}
      {!games ||
        (games.length < 1 && (
          <>
            <Section>
              <Card>
                <CardHeader>
                  <CardTitle className="row-start-1 row-span-2">Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8 mx-auto">
                    <div className="grid gap-3">
                      <Label htmlFor="player-input">Add Players</Label>
                      <Textarea
                        id="player-input"
                        value={rawPlayerInput}
                        onChange={e => {
                          setRawPlayerInput(e.target.value);
                        }}
                        placeholder={`Type names separated by comma (e.g. John, Bob, Jane, Doe) or line breaks: \n John \n Bob \n Jane \n Doe`}
                      />
                    </div>
                    <Button onClick={handleAddPlayers}>
                      <CirclePlus />
                      Add Players
                    </Button>
                    {players.length > 0 && (
                      <div className="space-y-2">
                        <Label>Players ({players.length})</Label>
                        {/*<div className="space-y-1 max-h-48 overflow-y-auto">*/}
                        <div className="space-y-1">
                          {players.map((player, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">{player.name}</span>
                                <span className="text-xs text-gray-500">
                                  {player.gameCount} {player.gameCount === 1 ? 'game' : 'games'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePlayer(player.name)}
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-600 ml-1">
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Section>
            <Section>
              <Card>
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8 mx-auto">
                    <div className="grid gap-3">
                      <Label>Minutes per game</Label>
                      <Input
                        type="number"
                        value={gameMinutes ?? undefined}
                        onChange={e => setGameMinutes(e.target.value)}
                        placeholder="e.g. 10 for 10 minutes"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label>Total scrimmage duration (minutes)</Label>
                      <Input
                        type="number"
                        value={totalSessionMinutes ?? undefined}
                        onChange={e => setTotalSessionMinutes(e.target.value)}
                        placeholder="e.g. 120 for 120 minutes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>
            <div className="flex py-5">
              <Button className="mx-auto" onClick={onGenerateGames}>
                Create Games
              </Button>
            </div>
          </>
        ))}
      {games.length > 0 && <GameCards games={games} />}
    </>
  );
}
