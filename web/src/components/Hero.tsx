import { Zap, Github, ArrowRight, Code, FileText } from "lucide-react";

export const Hero = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3001/auth/github/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Documentação automática em segundos
            </div>

            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent leading-tight">
              Transforme seu código em<br />documentação profissional
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Conecte seus repositórios do GitHub e gere documentação de API automaticamente.
              Swagger, OpenAPI e muito mais com apenas um clique.
            </p>

            <button
              onClick={handleLogin}
              className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Github className="w-6 h-6" />
              Conectar com GitHub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {[
              {
                icon: Github,
                title: "Integração GitHub",
                desc: "Conecte diretamente com seus repositórios",
                color: "from-gray-600 to-gray-800"
              },
              {
                icon: Code,
                title: "Análise Automática",
                desc: "Detecta rotas, schemas e endpoints",
                color: "from-blue-600 to-blue-800"
              },
              {
                icon: FileText,
                title: "Docs Profissionais",
                desc: "Gera Swagger/OpenAPI completo",
                color: "from-purple-600 to-purple-800"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};