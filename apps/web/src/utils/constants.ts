export const API = {
  BASE_URL: import.meta.env.API_URL || "http://localhost:8000/api",
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
      GET_DETAILS: (id: string) => `/${id}/details`,
      JOIN: (id: string) => `/${id}/join`,
      GET_TEAM: (id: string) => `/${id}/team`,
      DISABLE_JOINS: (id: string) => `/${id}/disable-joins`,
      START: (id: string) => `/${id}/start`,
      END: (id: string) => `/${id}/end`,
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
