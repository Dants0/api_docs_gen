// backend/index.ts
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";
import fastifyOauth2 from "@fastify/oauth2";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";


dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
})

fastify.register(fastifyCookie, {
  secret: "uma_chave_super_secreta", // para assinar cookies se quiser
});

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

fastify.register(fastifyOauth2, {
  name: "githubOAuth2",
  credentials: {
    client: {
      id: process.env.GITHUB_CLIENT_ID!,
      secret: process.env.GITHUB_CLIENT_SECRET!,
    },
    auth: fastifyOauth2.GITHUB_CONFIGURATION,
  },
  scope: ["repo", "user"],
  startRedirectPath: "/auth/github/login",
  callbackUri: "http://localhost:3001/auth/github/callback",
});


fastify.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});


fastify.get("/health", async () => {
  return { status: "ok" };
});

// callback do GitHub
fastify.get("/auth/github/callback", async function (req, reply) {
  try {
    const token = await (this as any).githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

    // ⚠️ acessando corretamente
    const access_token = token.token.access_token;

    if (!access_token) {
      return reply.status(400).send({ error: "Failed to get access token" });
    }

    // Salva o token em cookie HttpOnly
    reply.setCookie("gh_token", access_token, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    });

    // Redireciona para o frontend
    return reply.redirect("http://localhost:3000/repo");
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return reply.status(500).send({ error: "OAuth callback failed" });
  }
});



// listar repositórios do usuário
fastify.get("/github/repos", async (req, reply) => {
  const accessToken = req.cookies.gh_token;
  console.log("Access Token:", accessToken);

  if (!accessToken) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const ghRes = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${accessToken}`,
      "User-Agent": "fastify-api-doc-gen",
    },
  });

  const repos = await ghRes.json();
  return repos;
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
