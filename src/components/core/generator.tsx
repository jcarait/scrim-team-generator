'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import Section from '@/components/layout/section';
import { shuffle } from '@vitest/utils';
import GameCards from '@/components/core/game-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type Game = {
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

    if (sessions < 1) {
      alert('Please enter valid session minutes and total scrimmage minutes.');
      return;
    }

    if (players.length < 1) {
      alert('Please add players before generating games.');
      return;
    }

    const { games: built, players: finalQueue } = generateAllGames(players, sessions);
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
        <div className="flex px-5">
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
                    placeholder=""
                    className="text-xs"
                  />
                </div>
                <div className="grid gap-3">
                  <Label>Total minutes</Label>
                  <Input
                    type="number"
                    value={totalSessionMinutes ?? undefined}
                    onChange={e => setTotalSessionMinutes(e.target.value)}
                    placeholder="Total session minutes"
                    className="text-xs"
                  />
                </div>
              </div>
              {/*<div className="flex py-5">*/}
              {/*  <Button className="mx-auto" onClick={onGenerateGames}>*/}
              {/*    Generate session*/}
              {/*  </Button>*/}
              {/*</div>*/}
            </CardContent>
          </Card>
        </div>
      </Section>
      {/*<Section>*/}
      {/*  <p className="text-xl">{players.length} players</p>*/}
      {/*  <ol className="list-decimal">*/}
      {/*    {players.map((player, index) => (*/}
      {/*      <li key={index}>*/}
      {/*        {player.name} | Number of Sessions: {player.gameCount} {}*/}
      {/*      </li>*/}
      {/*    ))}*/}
      {/*  </ol>*/}
      {/*</Section>*/}
      <GameCards games={games} />
    </>
  );
}
