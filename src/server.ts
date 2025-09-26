import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', async () => ({ ok: true, message: 'Backend online!' }))

app.listen({ port: 3333, host: '0.0.0.0' })
  .then(() => console.log('🚀 Backend rodando na porta 3333'))
