import { Flight } from "../domain/flight.ts";
import { Rule, RuleCondition } from "../domain/rule.ts";

type EvaluationResult = {
  ruleId: string;
  message: string;
};

function ruleMatchesFlight(condition: RuleCondition, flight: Flight): boolean {
  if (condition.status && condition.status !== flight.status) {
    return false;
  }

  if (condition.beforeDepartureMins) {
    const now = new Date();
    const departure = new Date(flight.departureTime);
    const diffMins = (departure.getTime() - now.getTime()) / (1000 * 60);

    if (diffMins > condition.beforeDepartureMins) {
      return false;
    }
  }

  return true;
}

function renderTemplate(template: string, flight: Flight): string {
  return template
    .replace("{{flightNumber}}", flight.flightNumber)
    .replace("{{departureTime}}", flight.departureTime)
    .replace("{{status}}", flight.status);
}

export function evaluateRules(
  flight: Flight,
  rules: Rule[]
): EvaluationResult[] {
  return rules
    .filter((rule) => rule.isActive)
    .filter((rule) => ruleMatchesFlight(rule.condition, flight))
    .map((rule) => ({
      ruleId: rule.id,
      message: renderTemplate(rule.messageTemplate, flight),
    }));
}
