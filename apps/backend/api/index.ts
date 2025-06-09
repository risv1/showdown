import { handle } from "@hono/node-server/vercel";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRoutes } from "./routes/auth.routes.js";
import { matchesRoutes } from "./routes/matches.routes.js";
import { tournamentRoutes } from "./routes/tournament.routes.js";

const app = new Hono().basePath("/api");

app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://showdown-bois.vercel.app",
      "https://showdown-bois-hikqkrmof-rvfolio.vercel.app",
    ],
    credentials: true,
  })
);

app.route("/auth", authRoutes);
app.route("/tournaments", tournamentRoutes);
app.route("/matches", matchesRoutes);

app.get("/health", (c) => {
  return c.json({ status: "OK", timestamp: new Date().toISOString() });
});

const handler = handle(app);

export default handler;

// if (env.NODE_ENV === "development") {
//   serve(
//     {
//       fetch: app.fetch,
//       port: env.PORT,
//     },
//     (info) => {
//       console.log(`Server is running on http://localhost:${info.port}`);
//     }
//   );
// }
