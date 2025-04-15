// src/app.ts
import Fastify from "fastify";
import { registerDb } from "./plugins/db.ts";
import diagnosticsChannel from "@fastify/diagnostics-channel";
import { evaluateRoutes } from "handlers/evaluateRoutes.ts";

export async function buildApp() {
  const app = Fastify();

  await app.register(diagnosticsChannel);
  await registerDb(app);
  await evaluateRoutes(app);

  // Routes will be added here later
  return app;
}
