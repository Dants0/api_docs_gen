// backend/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyOauth2 from "@fastify/oauth2";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";


dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "https://api-docs-gen.vercel.app/",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
})

fastify.register(fastifyCookie, {
  secret: "uma_chave_super_secreta", // para assinar cookies se quiser
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
  callbackUri: "https://api-docs-gen.onrender.com/auth/github/callback",
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
    return reply.redirect("https://api-docs-gen.vercel.app/repo");
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return reply.status(500).send({ error: "OAuth callback failed" });
  }
});

fastify.get("/auth/github/logout", async (req, reply) => {
  reply.clearCookie("gh_token", { path: "/" });
  return reply.redirect("https://api-docs-gen.vercel.app/");
})




// listar repositórios do usuário
fastify.get("/github/repos", async (req, reply) => {
  const accessToken = req.cookies.gh_token;

  if (!accessToken) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    let page = 1;
    const per_page = 100; // máximo permitido pelo GitHub
    let allRepos: any[] = [];

    while (true) {
      const res = await fetch(`https://api.github.com/user/repos?per_page=${per_page}&page=${page}`, {
        headers: {
          Authorization: `token ${accessToken}`,
          "User-Agent": "fastify-api-doc-gen",
        },
      });

      if (!res.ok) {
        return reply.status(res.status).send({ error: "Failed to fetch repositories" });
      }

      const repos: any = await res.json();
      allRepos = allRepos.concat(repos);

      // se a página atual retornou menos do que per_page, acabou
      if (repos.length < per_page) break;

      page++;
    }

    return allRepos;
  } catch (err) {
    console.error("GitHub repos fetch error:", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});


// pegar informações do usuário logado
fastify.get("/github/user", async (req, reply) => {
  const accessToken = req.cookies.gh_token;

  if (!accessToken) {
    return reply.status(401).send({ error: "Unauthorized", statusCode: 401 });
  }

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "fastify-api-doc-gen",
      },
    });

    if (!res.ok) {
      return reply.status(res.status).send({ error: "Failed to fetch user info" });
    }

    const user = await res.json();
    return user;
  } catch (err) {
    console.error("GitHub user fetch error:", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});


fastify.post("/generate", async (req, reply) => {
  const accessToken = req.cookies.gh_token;

  if (!accessToken) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const { repoId }: any = req.body;
  if (!repoId) {
    return reply.status(400).send({ error: "Repo ID is required" });
  }

  try {
    // 1️⃣ Buscar dados do repositório selecionado
    const repoRes = await fetch(`https://api.github.com/repositories/${repoId}`, {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "fastify-api-doc-gen",
      },
    });

    if (!repoRes.ok) {
      return reply.status(repoRes.status).send({ error: "Failed to fetch repository info" });
    }

    const repoData: any = await repoRes.json();

    // 2️⃣ Montar prompt para OpenAI
    const prompt = `
      Gere um README completo para este repositório GitHub:
      Nome: ${repoData.name}
      Descrição: ${repoData.description || "Sem descrição"}
      Linguagem principal: ${repoData.language || "Não especificada"}
      Visibilidade: ${repoData.private ? "Privado" : "Público"}

      Estrutura do README:
      - Título
      - Descrição
      - Instalação
      - Uso
      - Exemplos de API (se houver)
      - Licença
      - Contato

      Gere o conteúdo em Markdown pronto para usar.
    `;

    // 3️⃣ Chamar OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4", // ou gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return reply.status(openaiRes.status).send({ error: "OpenAI request failed", details: err });
    }

    const openaiData: any = await openaiRes.json();
    const readmeContent = openaiData.choices[0].message.content;
    console.log("Generated README:", readmeContent);

    // 4️⃣ Retornar conteúdo gerado para o frontend
    return reply.send({ readme: readmeContent });

  } catch (err) {
    console.error("Generate README error:", err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
