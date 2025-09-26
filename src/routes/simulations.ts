import type { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma.ts"
import { createSimulationSchema, updateSimulationSchema } from "../schemas/simulation.ts"

export async function simulationRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return prisma.simulation.findMany({ orderBy: { createdAt: "desc" } })
  })

  app.post("/", async (req, res) => {
    const parsed = createSimulationSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.code(400).send(parsed.error.issues)
    }
    const sim = await prisma.simulation.create({ data: parsed.data })
    return res.code(201).send(sim)
  })

  app.patch("/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const parsed = updateSimulationSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.code(400).send(parsed.error.issues)
    }
    const sim = await prisma.simulation.update({ where: { id }, data: parsed.data })
    return res.send(sim)
  })

  app.delete("/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    await prisma.simulation.delete({ where: { id } })
    return res.code(204).send()
  })
}
