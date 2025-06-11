export const API = {
  BASE_URL: import.meta.env.VITE_PUBLIC_API_URL,
  ENDPOINTS: {
    AUTH: {
      BASE_URL: () => "/auth",
      REGISTER: () => "/register",
      LOGIN: () => "/login",
      SESSION: () => "/session",
      PROFILE: () => "/profile",
      REFRESH_SHOWDOWN: () => "/refresh-showdown",
    },
    TOURNAMENTS: {
      BASE_URL: () => "/tournaments",
      CREATE: () => "/",
      GET_BY_ID: (id: string) => `/${id}`,
      // GET_DETAILS: (id: string) => `/${id}/details`,
      GET_BASIC: (id: string) => `/${id}/basic`,
      GET_STAGES: (id: string) => `/${id}/stages`,
      GET_PLAYERS: (id: string) => `/${id}/players`,
      GET_MATCHES: (id: string) => `/${id}/matches`,
      JOIN: (id: string) => `/${id}/join`,
      GET_TEAM: (id: string) => `/${id}/team`,
      GET_STAGE_TEAM: (tournamentId: string, stageId: string) =>
        `/${tournamentId}/stage/${stageId}/team`,
      DISABLE_JOINS: (id: string) => `/${id}/disable-joins`,
      START: (id: string) => `/${id}/start`,
      END: (id: string) => `/${id}/end`,
      UPDATE_STAGE_STATUS: (tournamentId: string, stageId: string) =>
        `/${tournamentId}/stage/${stageId}`,
    },
    MATCHES: {
      BASE_URL: () => "/matches",
      CREATE: (tournamentId: string, stageId: string) =>
        `/tournament/${tournamentId}/stage/${stageId}`,
      GET_BY_ID: (id: string) => `/${id}`,
      UPDATE: (id: string) => `/${id}`,
      GET_TOURNAMENT_MATCHES: (tournamentId: string) => `/tournament/${tournamentId}`,
    },
  },
};
