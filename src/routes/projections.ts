import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";

type Movement = {
  type: "INCOME" | "EXPENSE";
  value: number;
};

export async function projectionRoutes(app: FastifyInstance) {
  app.post("/simulations/:id/projection", async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const bodySchema = z.object({
      status: z.enum(["ALIVE", "DEAD", "INVALID"]).default("ALIVE"),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        allocations: true,
        movements: true,
        insurances: true,
      },
    });

    if (!simulation) {
      return res.status(404).send({ message: "Simulation not found" });
    }

    const startYear = simulation.startDate.getFullYear();
    const endYear = 2060;
    const rate = simulation.realRate || 0.04; // taxa real default 4%

    let patrimonio = 0;
    const projection: any[] = [];

    for (let year = startYear; year <= endYear; year++) {
      // Entradas e saídas (simplificado)
    let entradas = simulation.movements
      .filter((m: Movement) => m.type === "INCOME")
      .reduce((acc: number, m: Movement) => acc + m.value, 0);

      let despesas = simulation.movements
        .filter((m: Movement) => m.type === "EXPENSE")
      .reduce((acc: number, m: Movement) => acc + m.value, 0);

      // Ajusta pelo status
      if (status === "DEAD") {
        despesas = despesas / 2;
      } else if (status === "INVALID") {
        entradas = 0;
      }

      // Crescimento composto
      patrimonio = (patrimonio + entradas - despesas) * (1 + rate);

      projection.push({
        year,
        patrimonio: Number(patrimonio.toFixed(2)),
        entradas,
        despesas,
      });
    }

    return { simulationId: id, status, projection };
  });
}
