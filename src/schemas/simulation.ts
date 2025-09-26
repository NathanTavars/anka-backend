import { z } from "zod"

export const createSimulationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().transform((val) => new Date(val)),
  realRate: z.number().default(0.04),
  status: z.enum(["ALIVE", "DEAD", "INVALID"]).default("ALIVE"),
})

export const updateSimulationSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  realRate: z.number().optional(),
  status: z.enum(["ALIVE", "DEAD", "INVALID"]).optional(),
})
