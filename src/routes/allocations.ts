import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";

export async function allocationRoutes(app: FastifyInstance) {
  // Criar allocation
  app.post("/allocations", async (req, res) => {
    const bodySchema = z.object({
      simulationId: z.string().uuid(),
      type: z.enum(["FINANCIAL", "IMMOBILIZED"]),
      name: z.string(),
      value: z.number(),
      date: z.coerce.date(),
    });

    const data = bodySchema.parse(req.body);
    const allocation = await prisma.allocation.create({ data });
    return res.code(201).send(allocation);
  });

  // Listar allocations de uma simulação
  app.get("/allocations/:simulationId", async (req, res) => {
    const paramsSchema = z.object({ simulationId: z.string().uuid() });
    const { simulationId } = paramsSchema.parse(req.params);

    const allocations = await prisma.allocation.findMany({
      where: { simulationId },
      orderBy: { date: "desc" },
    });
    return allocations;
  });

  // Atualizar allocation
  app.put("/allocations/:id", async (req, res) => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const bodySchema = z.object({
      type: z.enum(["FINANCIAL", "IMMOBILIZED"]),
      name: z.string(),
      value: z.number(),
      date: z.coerce.date(),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const allocation = await prisma.allocation.update({
      where: { id },
      data,
    });
    return allocation;
  });

  // Deletar allocation
  app.delete("/allocations/:id", async (req, res) => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(req.params);

    await prisma.allocation.delete({ where: { id } });
    return res.code(204).send();
  });
}
