import { z } from "zod";

export const FlightSchema = z.object({
  id: z.string(),
  flightNumber: z.string(),
  status: z.string(),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Flight = z.infer<typeof FlightSchema>;
