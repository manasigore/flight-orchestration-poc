import { Rule } from "../domain/rule.ts";
import { FastifyInstance } from "fastify";

type RuleRow = Omit<Rule, "condition"> & { condition: string };

export function insertRule(app: FastifyInstance, rule: Rule) {
  const payload = {
    id: rule.id,
    name: rule.name,
    condition: JSON.stringify(rule.condition), // must be string
    messageTemplate: rule.messageTemplate,
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };

  console.log("[DEBUG] Rule insert payload:", payload);

  const stmt = app.db.prepare(`
        INSERT INTO rules (id, name, condition, messageTemplate, isActive, createdAt, updatedAt)
        VALUES (@id, @name, @condition, @messageTemplate, @isActive, @createdAt, @updatedAt)
      `);

  stmt.run(payload);
}

export function getAllRules(app: FastifyInstance): Rule[] {
  const rows = app.db.prepare("SELECT * FROM rules").all() as RuleRow[];

  return rows.map((row) => ({
    ...row,
    condition: JSON.parse(row.condition),
  }));
}
