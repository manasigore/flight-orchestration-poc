import Fastify from "fastify";
import { registerDb } from "./plugins/db.ts";
import diagnosticsChannel from "@fastify/diagnostics-channel";
import { evaluateRoutes } from "handlers/evaluateRoutes.ts";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

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
          url: "http://localhost:3001",
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
  await app.register(fastifyCors, {
    origin: "http://localhost:3000",
  });
  await registerDb(app);
  //   await evaluateRoutes(app);
  await app.register(evaluateRoutes);

  return app;
}
