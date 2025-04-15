// src/app.ts
import Fastify from "fastify";
import { registerDb } from "./plugins/db.ts";
import diagnosticsChannel from "@fastify/diagnostics-channel";
import { evaluateRoutes } from "handlers/evaluateRoutes.ts";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

export async function buildApp() {
  const app = Fastify();

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Flight Orchestration API",
        description: "Flight Orchestration API documentation",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
  });
  await app.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
    },
  });
  await app.register(diagnosticsChannel);
  await registerDb(app);
  await evaluateRoutes(app);

  // Routes will be added here later
  return app;
}
