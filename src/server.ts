import Fastify from "fastify"
import { simulationRoutes } from "./routes/simulations.ts"

const app = Fastify({ logger: true })

app.get("/health", async () => ({ ok: true, message: "Backend online!" }))

// 🔑 REGISTRA as rotas de Simulation
app.register(simulationRoutes, { prefix: "/simulations" })

app.listen({ port: 3333, host: "0.0.0.0" })
  .then(() => console.log("🚀 Backend running on port 3333"))
