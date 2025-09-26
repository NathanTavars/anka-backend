import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";

export async function movementRoutes(app: FastifyInstance) {
  // Criar movimento
  app.post("/movements", async (request, reply) => {
    const bodySchema = z.object({
      simulationId: z.string().uuid(),
      type: z.enum(["INCOME", "EXPENSE"]),
      value: z.number(),
      frequency: z.enum(["ONCE", "MONTHLY", "YEARLY"]),
      startDate: z.coerce.date(),  
      endDate: z.coerce.date().optional(),
    });

    const data = bodySchema.parse(request.body);

    const movement = await prisma.movement.create({ data });
    return reply.status(201).send(movement);
  });

  // Listar movimentos de uma simulação
  app.get("/movements/:simulationId", async (request) => {
    const paramsSchema = z.object({
      simulationId: z.string().uuid(),
    });

    const { simulationId } = paramsSchema.parse(request.params);

    return prisma.movement.findMany({
      where: { simulationId },
      orderBy: { startDate: "asc" },
    });
  });

  // Atualizar movimento
  app.put("/movements/:id", async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() });

    const bodySchema = z.object({
      type: z.enum(["INCOME", "EXPENSE"]).optional(),
      value: z.number().optional(),
      frequency: z.enum(["ONCE", "MONTHLY", "YEARLY"]).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });

    const { id } = paramsSchema.parse(request.params);
    const data = bodySchema.parse(request.body);

    const movement = await prisma.movement.update({
      where: { id },
      data,
    });

    return reply.send(movement);
  });

  // Deletar movimento
  app.delete("/movements/:id", async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const { id } = paramsSchema.parse(request.params);

    await prisma.movement.delete({ where: { id } });

    return reply.status(204).send();
  });
}
