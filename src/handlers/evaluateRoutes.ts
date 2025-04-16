import { FastifyInstance } from "fastify";
import { getFlightById, insertFlight } from "../adapters/flightRepo.ts";
import { getAllRules, insertRule } from "../adapters/ruleRepo.ts";
import { evaluateRules } from "../usecases/evaluateRules.ts";
import { FlightSchema } from "../domain/flight.ts";
import { RuleSchema } from "../domain/rule.ts";

export async function evaluateRoutes(app: FastifyInstance) {
  app.delete("/rules", async (req, reply) => {
    const stmt = app.db.prepare(`DELETE FROM rules`);
    const result = stmt.run();

    if (result.changes === 0) {
      return reply.status(404).send({ error: "No rules to delete" });
    }

    return { success: true };
  });

  app.post("/rules", async (req, reply) => {
    const result = RuleSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.format() });
    }

    const rule = result.data;

    const stmt = app.db.prepare(`
      INSERT INTO rules (id, name, condition, messageTemplate, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      rule.id,
      rule.name,
      JSON.stringify(rule.condition),
      rule.messageTemplate,
      rule.isActive ? 1 : 0,
      rule.createdAt,
      rule.updatedAt
    );

    return { success: true };
  });

  app.get("/rules", async (req, reply) => {
    const rules = getAllRules(app);
    return rules;
  });

  app.delete("/rules/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const stmt = app.db.prepare(`DELETE FROM rules WHERE id = ?`);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return reply.status(404).send({ error: "Automation not found" });
    }

    return { success: true };
  });

  app.put("/rules/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = RuleSchema.safeParse(req.body);
    console.log(req.body);
    console.log("[DEBUG] Rule update payload:", result);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.format() });
    }

    const rule = result.data;

    const update = app.db.prepare(`
      UPDATE rules
      SET name = ?, condition = ?, messageTemplate = ?, isActive = ?, updatedAt = ?
      WHERE id = ?
    `);

    const changes = update.run(
      rule.name,
      JSON.stringify(rule.condition),
      rule.messageTemplate,
      rule.isActive ? 1 : 0,
      rule.updatedAt,
      id
    );

    if (changes.changes === 0) {
      return reply.status(404).send({ error: "Rule not found" });
    }

    return { success: true };
  });

  app.get("/rules/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const row = app.db.prepare("SELECT * FROM rules WHERE id = ?").get(id) as {
      id: string;
      name: string;
      condition: string;
      messageTemplate: string;
      isActive: number;
      createdAt: string;
      updatedAt: string;
    };
    if (!row) {
      return reply.status(404).send({ error: "Rule not found" });
    }

    const rule = {
      ...row,
      condition: JSON.parse(row.condition),
      isActive: row.isActive === 1,
    };

    return rule;
  });

  app.delete("/flights", async (req, reply) => {
    const stmt = app.db.prepare(`DELETE FROM flights`);
    const result = stmt.run();

    if (result.changes === 0) {
      return reply.status(404).send({ error: "No flights to delete" });
    }

    return { success: true };
  });

  app.post("/flights", async (req, reply) => {
    const parsed = FlightSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.format() });
    }
    insertFlight(app, parsed.data);
    return { success: true };
  });

  app.get("/flights", async (req, reply) => {
    const rows = app.db.prepare("SELECT * FROM flights").all();
    return rows;
  });

  app.delete("/flights/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const stmt = app.db.prepare(`DELETE FROM flights WHERE id = ?`);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return reply.status(404).send({ error: "Flight not found" });
    }

    return { success: true };
  });

  console.log("[ROUTE] PUT /flights/:id registered");

  app.put("/flights/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = FlightSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.format() });
    }

    const flight = parsed.data;

    const update = app.db.prepare(`
      UPDATE flights
      SET flightNumber = ?, status = ?, departureTime = ?, arrivalTime = ?, updatedAt = ?
      WHERE id = ?
    `);

    const changes = update.run(
      flight.flightNumber,
      flight.status,
      flight.departureTime,
      flight.arrivalTime,
      flight.updatedAt,
      id
    );

    if (changes.changes === 0) {
      return reply.status(404).send({ error: "Flight not found" });
    }

    return { success: true };
  });

  app.get("/flights/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const flight = getFlightById(app, id);
    if (!flight) {
      return reply.status(404).send({ error: "Flight not found" });
    }
    return flight;
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
}
