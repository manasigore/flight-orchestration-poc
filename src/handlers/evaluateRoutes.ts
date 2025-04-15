import { FastifyInstance } from "fastify";
import { getFlightById, insertFlight } from "../adapters/flightRepo.ts";
import { getAllRules, insertRule } from "../adapters/ruleRepo.ts";
import { evaluateRules } from "../usecases/evaluateRules.ts";
import { FlightSchema } from "../domain/flight.ts";
import { RuleSchema } from "../domain/rule.ts";

export async function evaluateRoutes(app: FastifyInstance) {
  app.get("/flights/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const flight = getFlightById(app, id);
    if (!flight) {
      return reply.status(404).send({ error: "Flight not found" });
    }
    return flight;
  });

  app.get("/rules", async (req, reply) => {
    const rules = getAllRules(app);
    return rules;
  });

  app.post("/evaluate", async (req, reply) => {
    const { flightId } = req.body as { flightId: string };

    const flight = getFlightById(app, flightId);
    if (!flight) {
      return reply.status(404).send({ error: "Flight not found" });
    }

    const rules = getAllRules(app);
    const results = evaluateRules(flight, rules);

    return { results };
  });

  app.post("/flights", async (req, reply) => {
    const parsed = FlightSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.format() });
    }
    insertFlight(app, parsed.data);
    return { success: true };
  });

  app.post("/rules", async (req, reply) => {
    const result = RuleSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.format() });
    }

    const rule = result.data;

    const insertPayload = {
      id: rule.id,
      name: rule.name,
      condition: JSON.stringify(rule.condition), // important: manually convert
      messageTemplate: rule.messageTemplate,
      isActive: rule.isActive ? 1 : 0, // SQLite prefers numeric booleans
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };

    console.log("[INSERT RULE PAYLOAD]", insertPayload); // for debugging

    const stmt = req.server.db.prepare(`
      INSERT INTO rules (id, name, condition, messageTemplate, isActive, createdAt, updatedAt)
      VALUES (@id, @name, @condition, @messageTemplate, @isActive, @createdAt, @updatedAt)
    `);

    stmt.run(insertPayload);

    return { success: true };
  });
}
