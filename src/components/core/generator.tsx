'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import Section from '@/components/layout/section';
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

type Gender = 'male' | 'female' | 'unspecified';

type Player = {
  id: string;
  name: string;
  gender: Gender;
  gameCount: number;
  gamesPlayed: number;
  consecutiveGames: number;
};

type Team = {
  id: string;
  name: string;
  players: Player[];
};

const PLAYERS_PER_GAME = 10;
const TEAMS = 2;

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
  const [maxConsecutiveGames, setMaxConsecutiveGames] = useState<string>('2');
  const [restMinutes, setRestMinutes] = useState<string>('0');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef<{ games: Game[]; players: Player[] } | null>(null);

  function shuffleCopy<T>(a: T[]): T[] {
    const copy = a.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function computeGenderTargets(maleAvailable: number, femaleAvailable: number, totalSpots: number): {
    maleTarget: number;
    femaleTarget: number;
  } {
    const clampedTotal = Math.max(0, totalSpots);
    const baseTarget = Math.floor(clampedTotal / 2);
    let maleTarget = Math.min(baseTarget, maleAvailable);
    let femaleTarget = Math.min(baseTarget, femaleAvailable);
    let assigned = maleTarget + femaleTarget;

    const incrementGender = (gender: 'male' | 'female') => {
      if (assigned >= clampedTotal) return;
      if (gender === 'male' && maleTarget < maleAvailable) {
        maleTarget += 1;
        assigned = maleTarget + femaleTarget;
      }
      if (gender === 'female' && femaleTarget < femaleAvailable) {
        femaleTarget += 1;
        assigned = maleTarget + femaleTarget;
      }
    };

    while (assigned < clampedTotal && (maleTarget < maleAvailable || femaleTarget < femaleAvailable)) {
      const maleRemaining = maleAvailable - maleTarget;
      const femaleRemaining = femaleAvailable - femaleTarget;

      if (maleRemaining > femaleRemaining) {
        incrementGender('male');
      } else if (femaleRemaining > maleRemaining) {
        incrementGender('female');
      } else if (maleRemaining > 0) {
        incrementGender('male');
      } else if (femaleRemaining > 0) {
        incrementGender('female');
      } else {
        break;
      }
    }

    return { maleTarget, femaleTarget };
  }

  function collectBalancedPlayers(pool: Player[], spots: number, selected: Player[], selectedIds: Set<string>) {
    if (spots <= 0) return;

    const available = pool.filter(player => !selectedIds.has(player.id));
    if (available.length === 0) return;

    const targetSpots = Math.min(spots, available.length);

    const maleCandidates = available.filter(p => p.gender === 'male');
    const femaleCandidates = available.filter(p => p.gender === 'female');
    const unspecifiedCandidates = available.filter(p => p.gender === 'unspecified');

    const { maleTarget, femaleTarget } = computeGenderTargets(maleCandidates.length, femaleCandidates.length, targetSpots);

    let taken = 0;

    const takeFromList = (list: Player[], limit?: number) => {
      if (taken >= targetSpots) return;
      let consumed = 0;
      for (const candidate of list) {
        if (taken >= targetSpots) break;
        if (selectedIds.has(candidate.id)) continue;
        if (limit !== undefined && consumed >= limit) break;
        selected.push(candidate);
        selectedIds.add(candidate.id);
        taken += 1;
        consumed += 1;
      }
    };

    takeFromList(maleCandidates, maleTarget);
    takeFromList(femaleCandidates, femaleTarget);

    if (taken < targetSpots) {
      takeFromList(unspecifiedCandidates);
    }

    if (taken < targetSpots) {
      takeFromList(maleCandidates.slice(maleTarget));
    }

    if (taken < targetSpots) {
      takeFromList(femaleCandidates.slice(femaleTarget));
    }

    if (taken < targetSpots) {
      takeFromList(available);
    }
  }

  function selectPlayersForGame(queue: Player[], consecutiveLimit: number): Player[] {
    const fairnessSorted = queue
      .slice()
      .sort((a, b) => {
        if (a.gameCount !== b.gameCount) return a.gameCount - b.gameCount;
        if (a.consecutiveGames !== b.consecutiveGames) return a.consecutiveGames - b.consecutiveGames;
        return a.name.localeCompare(b.name);
      });

    const isEligible = (player: Player) => consecutiveLimit <= 0 || player.consecutiveGames < consecutiveLimit;
    const eligible = fairnessSorted.filter(isEligible);
    const needsRest = fairnessSorted.filter(player => !isEligible(player));

    const selected: Player[] = [];
    const selectedIds = new Set<string>();

    collectBalancedPlayers(eligible, PLAYERS_PER_GAME, selected, selectedIds);

    if (selected.length < PLAYERS_PER_GAME) {
      collectBalancedPlayers(needsRest, PLAYERS_PER_GAME - selected.length, selected, selectedIds);
    }

    return selected.slice(0, PLAYERS_PER_GAME);
  }

  function chooseTeamIndex(teams: Team[], gender: Gender): number {
    const stats = teams.map((team, idx) => {
      const genderCount = team.players.filter(p => p.gender === gender).length;
      return {
        idx,
        genderCount,
        total: team.players.length,
      };
    });

    if (gender === 'unspecified') {
      const minTotal = Math.min(...stats.map(stat => stat.total));
      const candidates = stats.filter(stat => stat.total === minTotal);
      return candidates[Math.floor(Math.random() * candidates.length)].idx;
    }

    const minGender = Math.min(...stats.map(stat => stat.genderCount));
    const genderCandidates = stats.filter(stat => stat.genderCount === minGender);
    const minTotal = Math.min(...genderCandidates.map(stat => stat.total));
    const candidates = genderCandidates.filter(stat => stat.total === minTotal);
    return candidates[Math.floor(Math.random() * candidates.length)].idx;
  }

  function buildTeams(players: Player[]): Team[] {
    const teams = Array.from({ length: TEAMS }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Team ${i + 1}`,
      players: [] as Player[],
    }));

    const maleGroup = shuffleCopy(players.filter(player => player.gender === 'male'));
    const femaleGroup = shuffleCopy(players.filter(player => player.gender === 'female'));
    const unspecifiedGroup = shuffleCopy(players.filter(player => player.gender === 'unspecified'));

    const assignGroup = (group: Player[], gender: Gender) => {
      for (const player of group) {
        const idx = chooseTeamIndex(teams, gender);
        teams[idx].players.push(player);
      }
    };

    assignGroup(maleGroup, 'male');
    assignGroup(femaleGroup, 'female');

    for (const player of unspecifiedGroup) {
      const idx = chooseTeamIndex(teams, 'unspecified');
      teams[idx].players.push(player);
    }

    return teams;
  }

  function generateAllGames(roster: Player[], gamesCount: number, consecutiveLimit: number): { games: Game[]; players: Player[] } {
    let queue = shuffleCopy(roster);
    const outGames: Game[] = [];

    for (let g = 0; g < gamesCount; g++) {
      if (queue.length < PLAYERS_PER_GAME) break;

      const selected = selectPlayersForGame(queue, consecutiveLimit);
      if (selected.length < PLAYERS_PER_GAME) break;

      const selectedIds = new Set(selected.map(player => player.id));

      const updatedQueue = queue.map(player => {
        if (selectedIds.has(player.id)) {
          return {
            ...player,
            gameCount: player.gameCount + 1,
            gamesPlayed: player.gamesPlayed + 1,
            consecutiveGames: player.consecutiveGames + 1,
          };
        }

        return {
          ...player,
          consecutiveGames: 0,
        };
      });

      const playing = updatedQueue.filter(player => selectedIds.has(player.id));
      const bench = updatedQueue.filter(player => !selectedIds.has(player.id));

      const teams = buildTeams(playing);
      outGames.push({ id: `${g + 1}`, name: `Game ${g + 1}`, teams });

      queue = bench.concat(playing);
    }

    return { games: outGames, players: queue }; // queue order = who’s up next / final state
  }

  useEffect(() => {
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
    };
  }, []);

  const onGenerateGames = () => {
    const sessions = calculateNumberOfSessions();

    const playerReset = players.map(p => ({
      ...p,
      gameCount: 0,
      gamesPlayed: 0,
      consecutiveGames: 0,
    }));

    if (sessions < 1) {
      alert('Please enter valid session minutes and total scrimmage minutes.');
      return;
    }

    if (players.length < 1) {
      alert('Please add players before generating games.');
      return;
    }

    const parsedLimit = parseInt(maxConsecutiveGames, 10);
    const consecutiveLimit = Number.isNaN(parsedLimit) ? 0 : Math.max(0, parsedLimit);

    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = null;
    }

    setIsGenerating(true);

    const { games: built, players: finalQueue } = generateAllGames(playerReset, sessions, consecutiveLimit);
    const sortedPlayers = finalQueue.slice().sort((a, b) => a.name.localeCompare(b.name));

    pendingResultRef.current = { games: built, players: sortedPlayers };

    generationTimeoutRef.current = setTimeout(() => {
      const pending = pendingResultRef.current;
      if (pending) {
        setGames(pending.games);
        setPlayers(pending.players);
        pendingResultRef.current = null;
        window.scrollTo({ top: 5, behavior: 'smooth' });
      }
      setIsGenerating(false);
      generationTimeoutRef.current = null;
    }, 1500);
  };

  const calculateNumberOfSessions = (): number => {
    const minutesPerSession = parseInt(gameMinutes, 10) || 0;
    const totalMinutes = parseInt(totalSessionMinutes, 10) || 0;
    const restPerGame = Math.max(0, parseInt(restMinutes, 10) || 0);

    if (minutesPerSession <= 0 || totalMinutes <= 0) {
      return 0; // Invalid input
    }

    const block = minutesPerSession + restPerGame;

    if (block <= 0) {
      return 0;
    }

    return Math.floor((totalMinutes + restPerGame) / block);
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
        gender: 'unspecified' as const,
        gameCount: 0,
        gamesPlayed: 0,
        consecutiveGames: 0,
      }));

    setPlayers(prev => [...prev, ...newPlayers]);
  };

  const updatePlayerGender = (id: string, gender: Gender): void => {
    setPlayers(prev =>
      prev.map(player => {
        if (player.id !== id) return player;
        return { ...player, gender };
      }),
    );
  };

  const removePlayer = (id: string): void => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const genderOptions: { label: string; value: Gender }[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  const formatGender = (gender: Gender): string => {
    if (gender === 'male') return 'Male';
    if (gender === 'female') return 'Female';
    return 'Not set';
  };

  return (
    <>
      {isGenerating && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true">
          <div className="flex flex-col items-center gap-2" aria-hidden="true">
            <div className="basketball-wrapper">
              <div className="basketball">
                <span className="basketball-stripe stripe-vertical stripe-left" />
                <span className="basketball-stripe stripe-vertical stripe-right" />
                <span className="basketball-stripe stripe-horizontal stripe-top" />
                <span className="basketball-stripe stripe-horizontal stripe-bottom" />
              </div>
            </div>
            <div className="basketball-shadow" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Building balanced teams...</p>
        </div>
      )}
      {/* ========= GAME SETTINGS =========*/}
      {!games ||
        (games.length < 1 && (
          <>
            <Section>
              <Card className="border border-primary/15 bg-white/95 shadow-[0_18px_46px_-18px_rgba(194,104,20,0.35)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="row-start-1 row-span-2">Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 mx-auto w-full max-w-3xl">
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
                      <p className="text-xs text-muted-foreground">
                        Tip: separate names with commas or line breaks—either format works.
                      </p>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={handleAddPlayers}>
                      <CirclePlus />
                      Add Players
                    </Button>
                    {players.length > 0 && (
                      <div className="space-y-2">
                        <Label>Players ({players.length})</Label>
                        {/*<div className="space-y-1 max-h-48 overflow-y-auto">*/}
                        <div className="space-y-2">
                          {players.map(player => (
                            <div
                              key={player.id}
                              className="flex flex-col gap-3 rounded border border-primary/10 bg-orange-50/70 p-3 shadow-sm shadow-orange-200/40 transition hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                <span className="font-medium text-sm sm:text-base">{player.name}</span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span>
                                    {player.gameCount} {player.gameCount === 1 ? 'game' : 'games'}
                                  </span>
                                  <span>{formatGender(player.gender)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Select gender">
                                  {genderOptions.map(option => {
                                    const isActive = player.gender === option.value;
                                    return (
                                      <Button
                                        key={option.value}
                                        type="button"
                                        size="sm"
                                        role="radio"
                                        aria-checked={isActive}
                                        variant={isActive ? 'default' : 'outline'}
                                        className="h-6 px-2 text-xs"
                                        onClick={() => updatePlayerGender(player.id, option.value)}>
                                        {option.label}
                                      </Button>
                                    );
                                  })}
                                  <Button
                                    type="button"
                                    size="sm"
                                    role="radio"
                                    aria-checked={player.gender === 'unspecified'}
                                    variant={player.gender === 'unspecified' ? 'default' : 'ghost'}
                                    className="h-6 px-2 text-xs"
                                    onClick={() => updatePlayerGender(player.id, 'unspecified')}>
                                    Clear
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePlayer(player.id)}
                                  className="ml-auto h-6 w-6 p-0 text-red-400 hover:text-red-600 sm:ml-0">
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
              <Card className="border border-primary/15 bg-white/95 shadow-[0_18px_46px_-18px_rgba(194,104,20,0.35)] backdrop-blur">
                <CardHeader>
                  <CardTitle>Game Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 mx-auto w-full max-w-3xl">
                    <div className="grid gap-3">
                      <Label>Minutes per game</Label>
                      <Input
                        type="number"
                        value={gameMinutes ?? undefined}
                        onChange={e => setGameMinutes(e.target.value)}
                        placeholder="e.g. 10 for 10 minutes"
                        className="w-full"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label>Total scrimmage duration (minutes)</Label>
                      <Input
                        type="number"
                        value={totalSessionMinutes ?? undefined}
                        onChange={e => setTotalSessionMinutes(e.target.value)}
                        placeholder="e.g. 120 for 120 minutes"
                        className="w-full"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label>Rest between games (minutes)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={restMinutes ?? undefined}
                        onChange={e => setRestMinutes(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label>Max consecutive games before rest</Label>
                      <Input
                        type="number"
                        min={0}
                        value={maxConsecutiveGames ?? undefined}
                        onChange={e => setMaxConsecutiveGames(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full"
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
