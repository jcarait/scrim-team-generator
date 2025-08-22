'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Section from '@/components/layout/section';

type Session = {
  sessionId: string;
  sessionName: string;
  players: Player[];
  teamA: Player[];
  teamB: Player[];
};

type Player = {
  playerId: string;
  playerName: string;
  sessionCount: number;
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

  const setupInitialPlayers = () => {
    return initialPlayers.map((name, index) => {
      return {
        playerId: (index + 1).toString(),
        playerName: name,
        sessionCount: 0,
      };
    });
  };

  const [totalSessionMinutes, setTotalSessionMinutes] = useState<string>('');
  const [segmentSessionMinutes, setSegmentSessionMinutes] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Player[]>(setupInitialPlayers());

  const generateSessions = () => {
    setSessions([]);
    setPlayers([...setupInitialPlayers()]);
    const sessions = calculateNumberOfSessions();

    let resultSessions: { session: Session; players: Player[] }[] = [];

    for (let i = 0; i < sessions; i++) {
      resultSessions = [
        ...resultSessions,
        generateSession((i + 1).toString(), `Game ${i + 1}`, resultSessions[resultSessions.length - 1]?.players ?? setupInitialPlayers()),
      ];
    }

    setPlayers(resultSessions[resultSessions.length - 1].players);
    setSessions(resultSessions.map(rs => rs.session));
  };

  const generateSession = (id: string, sessionName: string, players: Player[]): { session: Session; players: Player[] } => {
    const sessionPlayers: Player[] = [];
    let updatedPlayers: Player[] = [...players];
    let lowestSessionPlayers: Player[];
    let lowestSessionCount = 0;

    // Find lowest session count
    lowestSessionCount = Math.min(...updatedPlayers.map(p => p.sessionCount));

    // Find players with the lowest session count
    lowestSessionPlayers = updatedPlayers.filter(p => p.sessionCount === lowestSessionCount);

    if (lowestSessionPlayers.length < MAX_PLAYERS_PER_SESSION) {
      // If there are not enough players with the lowest session count, include players with the next lowest count
      lowestSessionCount = lowestSessionCount + 1;
      // Filter players with the next lowest session count
      const nextLowestSessionPlayers = updatedPlayers.filter(p => p.sessionCount === lowestSessionCount);
      shuffle(nextLowestSessionPlayers);

      // If filtered players and lowest session players are more than MAX_PLAYERS_PER SESSION, we need to cut down the filtered players
      if (lowestSessionPlayers.length + nextLowestSessionPlayers.length > MAX_PLAYERS_PER_SESSION) {
        const playersNeeded = MAX_PLAYERS_PER_SESSION - lowestSessionPlayers.length;
        lowestSessionPlayers = [...lowestSessionPlayers, ...nextLowestSessionPlayers.slice(0, playersNeeded)];
      }
    }

    for (let i = 0; i < MAX_PLAYERS_PER_SESSION; i++) {
      // Filter out players that are already in the session set
      const filtered = lowestSessionPlayers.filter(p => !sessionPlayers.some(sp => sp.playerId === p.playerId));

      // Choose a random player that is not already in the session
      const selectedPlayer = filtered[Math.floor(Math.random() * filtered.length)];
      const updatedPlayer = { ...selectedPlayer, sessionCount: selectedPlayer.sessionCount + 1 };

      updatedPlayers = updatedPlayers.map(p => {
        if (p.playerId === updatedPlayer.playerId) {
          return {
            ...p,
            ...updatedPlayer,
          };
        }

        return p;
      });

      sessionPlayers.push(updatedPlayer);
    }

    const shuffledSessionPlayers = [...sessionPlayers];
    shuffle(shuffledSessionPlayers);

    const session: Session = {
      sessionId: id,
      sessionName: sessionName,
      players: sessionPlayers,
      teamA: shuffledSessionPlayers.slice(0, MAX_PLAYERS_PER_SESSION / 2),
      teamB: shuffledSessionPlayers.slice(MAX_PLAYERS_PER_SESSION / 2, MAX_PLAYERS_PER_SESSION),
    };

    return { session, players: updatedPlayers };
  };

  const calculateNumberOfSessions = (): number => {
    if (!totalSessionMinutes || !segmentSessionMinutes) return 0;
    return Math.floor(Number(totalSessionMinutes) / Number(segmentSessionMinutes));
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
  console.log(sessions);

  return (
    <>
      <Section>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl">Scrim Team Generator</h1>
          <div className="flex gap-8 max-w-2/3">
            <div className="grid gap-3">
              <Label>Number of minutes per session</Label>
              <Input
                type="number"
                value={segmentSessionMinutes ?? undefined}
                onChange={e => setSegmentSessionMinutes(e.target.value)}
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
          <div className="flex">
            <Button onClick={generateSessions}>Generate session</Button>
          </div>
        </div>
      </Section>
      <Section>
        <p className="text-xl">{players.length} players</p>
        <ol className="list-decimal">
          {players.map((player, index) => (
            <li key={index}>
              {player.playerName} | Number of Sessions: {player.sessionCount} {}
            </li>
          ))}
        </ol>
      </Section>
      <Section>
        <div className="grid gap-6 grid-cols-3">
          {sessions.map(session => (
            <Card key={session.sessionId}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{session.sessionName}</h2>
                  <span className="text-sm text-muted-foreground">ID: {session.sessionId}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mt-1">Team A: {Array.from(session.teamA.map(p => p.playerName)).join(', ')}</p>
                <p className="text-sm text-muted-foreground mt-1">Team B: {Array.from(session.teamB.map(p => p.playerName)).join(', ')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
