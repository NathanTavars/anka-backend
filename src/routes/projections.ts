import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma.ts"

export async function projectionRoutes(app: FastifyInstance) {
  app.post("/simulations/:id/projection", async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      status: z.enum(["ALIVE", "DEAD", "INVALID"]),
    })

    const { id } = paramsSchema.parse(req.params)
    const { status } = bodySchema.parse(req.body)

    // Busca simulação
    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        allocations: true,
        movements: true,
      },
    })

    if (!simulation) {
      return res.code(404).send({ message: "Simulation not found" })
    }

    // Patrimônio inicial = soma das allocations até a data de início da simulação
    let patrimonioInicial: number = simulation.allocations
      .filter((a: { date: Date; value: number }) => new Date(a.date) <= simulation.startDate)
      .reduce((acc: number, a: { value: number }) => acc + a.value, 0)

    const taxa = simulation.realRate || 0.04 // taxa real composta (padrão 4% a.a.)
    const startYear = simulation.startDate.getFullYear()

    const projection: {
      year: number
      patrimonio: number
      entradas: number
      despesas: number
    }[] = []

    let patrimonio = patrimonioInicial

    for (let year = startYear; year <= 2060; year++) {
      // Movements desse ano
    const yearMovements = simulation.movements.filter((m: {
      startDate: Date
      endDate: Date | null
      type: "INCOME" | "EXPENSE"
      frequency: "MONTHLY" | "YEARLY" | "ONCE"
      value: number
    }) => {
      const start = new Date(m.startDate).getFullYear()
      const end = m.endDate ? new Date(m.endDate).getFullYear() : 2060
      return year >= start && year <= end
    })

      let entradas = 0
      let despesas = 0

      for (const m of yearMovements) {
        if (m.type === "INCOME") {
          if (m.frequency === "MONTHLY") entradas += m.value * 12
          else if (m.frequency === "YEARLY") entradas += m.value
          else entradas += m.value
        } else if (m.type === "EXPENSE") {
          if (m.frequency === "MONTHLY") despesas += m.value * 12
          else if (m.frequency === "YEARLY") despesas += m.value
          else despesas += m.value
        }
      }

      // Ajuste pelo status
      if (status === "DEAD") {
        entradas = 0
        despesas = despesas / 2
      } else if (status === "INVALID") {
        entradas = 0
        // despesas ficam iguais
      }

      // Atualiza patrimônio
      patrimonio = patrimonio * (1 + taxa) + entradas - despesas

      projection.push({
        year,
        patrimonio: Math.round(patrimonio),
        entradas,
        despesas,
      })
    }

    return {
      simulationId: simulation.id,
      status,
      projection,
    }
  })
}
