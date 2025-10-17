'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';
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

    const { games: built, players: finalQueue } = generateAllGames(playerReset, sessions, consecutiveLimit);
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
                      <p className="text-xs text-muted-foreground">
                        Tip: separate names with commas or line breaks—either format works.
                      </p>
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
                          {players.map(player => (
                            <div key={player.id} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">{player.name}</span>
                                <span className="text-xs text-gray-500">
                                  {player.gameCount} {player.gameCount === 1 ? 'game' : 'games'}
                                </span>
                                <span className="text-xs text-gray-500">{formatGender(player.gender)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="flex gap-1" role="radiogroup" aria-label="Select gender">
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
                    <div className="grid gap-3">
                      <Label>Max consecutive games before rest</Label>
                      <Input
                        type="number"
                        min={0}
                        value={maxConsecutiveGames ?? undefined}
                        onChange={e => setMaxConsecutiveGames(e.target.value)}
                        placeholder="e.g. 2"
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
