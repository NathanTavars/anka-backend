import fastify from "fastify";
import cors from "@fastify/cors";
import { simulationRoutes } from "./routes/simulations.ts";
import { projectionRoutes } from "./routes/projections.ts";

const app = fastify();
app.register(cors, { origin: "*" });

app.register(simulationRoutes);
app.register(projectionRoutes);

app.listen({ port: 3333, host: "0.0.0.0" })
  .then(() => console.log("🚀 Server running on http://localhost:3333"));
