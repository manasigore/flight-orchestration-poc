import { Flight } from "../domain/flight.ts";
import { FastifyInstance } from "fastify";

export function insertFlight(app: FastifyInstance, flight: Flight) {
  const stmt = app.db.prepare(`
    INSERT INTO flights (id, flightNumber, status, departureTime, arrivalTime, createdAt, updatedAt)
    VALUES (@id, @flightNumber, @status, @departureTime, @arrivalTime, @createdAt, @updatedAt)
  `);
  stmt.run(flight);
}

export function getFlightById(app: FastifyInstance, id: string): Flight | null {
  const row = app.db.prepare("SELECT * FROM flights WHERE id = ?").get(id);
  return row ? (row as Flight) : null;
}
