export interface Player {
  id: number;
  username: string;
  email: string;
  joinDate: string;
  wins: number;
  losses: number;
  points: number;
  rank: number;
  stageTeams?: Record<number, string[]>;
  isCurrentUser?: boolean;
}

export interface Match {
  id: number;
  tournamentId: number;
  stageId: number;
  player1Id: number;
  player2Id: number;
  winnerId: number | null;
  loserId: number | null;
  pointsWon: number | null;
  replayUrl: string | null;
  createdAt: string;
  updatedAt: string;
  pokemon?: Array<{
    playerId: number;
    pokemonName: string;
  }>;
}

export interface Stage {
  id: number;
  name: string;
  playersSelected: number;
  stageOrder: number;
  stageStarted: boolean;
  hasTeamSubmitted?: boolean;
  pokemonTeam?: string[];
}

export interface Tournament {
  id: number;
  name: string;
  format: string;
  description: string;
  maxPlayers: number;
  currentPlayers: number;
  isStarted: boolean;
  isEnded: boolean;
  joinsDisabled: boolean;
  stages: Stage[];
  players: Player[];
  matches: Match[];
  isCreator: boolean;
}
