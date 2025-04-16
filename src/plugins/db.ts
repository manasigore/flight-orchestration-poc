import fastifyPlugin from "fastify-plugin";
import Database from "better-sqlite3";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: Database.Database;
  }
}

export const registerDb = fastifyPlugin(async function (
  fastify: FastifyInstance
) {
  const db = new Database("flight.db");

  // Create basic tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS flights (
      id TEXT PRIMARY KEY,
      flightNumber TEXT NOT NULL,
      status TEXT,
      departureTime TEXT,
      arrivalTime TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      condition TEXT NOT NULL,
      messageTemplate TEXT NOT NULL,
      isActive BOOLEAN DEFAULT true,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

  fastify.decorate("db", db);
});
