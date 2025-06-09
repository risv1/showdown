export interface Tournament {
  id: number;
  name: string;
  format: string;
  description: string;
  maxPlayers: number;
  currentPlayers: number;
  creator: number;
  isStarted: boolean;
  isEnded: boolean;
  joinsDisabled: boolean;
  createdAt: string;
  updatedAt: string;
  stages?: Array<{
    name: string;
    playersSelected: number;
  }>;
  isParticipating?: boolean;
  pokemonTeam?: string[];
  wins?: number;
  losses?: number;
  points?: number;
}

export interface CreateTournamentData {
  name: string;
  format: string;
  description: string;
  maxPlayers: number;
  stages: Array<{
    name: string;
    playersSelected: number;
  }>;
}

export interface JoinTournamentData {
  pokemonTeam: string[];
}
