import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

import { env } from "../config/env";
import { authRoutes } from "./routes/auth.routes";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.route("/auth", authRoutes);

app.get("/health", (c) => {
  return c.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default handle(app);

if (env.NODE_ENV === "development") {
  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
}
