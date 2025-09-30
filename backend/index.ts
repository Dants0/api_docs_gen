// backend/index.ts
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";

const fastify = Fastify({ logger: true });

fastify.register(fastifySwagger, {
  swagger: {
    info: {
      title: "API Doc Generator",
      description: "Auto-generated API documentation",
      version: "0.1.0",
    },
    host: "localhost:3001",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
});

fastify.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
})

fastify.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
