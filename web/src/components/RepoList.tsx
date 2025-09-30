import { Search, GitBranch, Star, FileText, Github } from "lucide-react";
import { useState, useEffect } from "react";

export const RepoList = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/github/repos", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredRepos = repos.filter(repo =>
    repo.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = (repo: any) => {
    setSelected(repo.id);
    // Aqui você chamaria sua API para gerar a documentação
    setTimeout(() => {
      alert(`Documentação gerada para ${repo.name}!`);
      setSelected(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando repositórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Seus Repositórios</h2>
            <p className="text-gray-600">Selecione um repositório para gerar a documentação</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar repositórios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-bold text-gray-900">{repo.name}</h3>
                      {repo.private && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                          Private
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {repo.description || "Sem descrição disponível"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {repo.stargazers_count}
                      </span>
                      <span className="text-gray-400">
                        Atualizado {new Date(repo.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerate(repo)}
                    disabled={selected === repo.id}
                    className="ml-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {selected === repo.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Gerar Docs
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredRepos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum repositório encontrado</h3>
              <p className="text-gray-600">Tente ajustar sua busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};