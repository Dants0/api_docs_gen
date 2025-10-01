import { Repository } from "@/types/Repository";
import { Search, GitBranch, Star, FileText, Github, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ReadmeModal } from "./ReadmeModal";
import Link from "next/link";

export const RepoList = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [displayedRepos, setDisplayedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [readme, setReadme] = useState<string | null>(null);


  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  // Carrega todos os repositórios do backend
  useEffect(() => {
    fetch("http://localhost:3001/github/repos", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const reposData = Array.isArray(data) ? data : [];
        setRepos(reposData);
        setFilteredRepos(reposData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtra repositórios baseado na busca
  useEffect(() => {
    const filtered = repos.filter(repo =>
      repo.full_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRepos(filtered);
    setPage(1);
    setDisplayedRepos([]);
  }, [search, repos]);

  // Carrega mais itens quando a página muda
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    const newDisplayed = filteredRepos.slice(startIndex, endIndex);

    setDisplayedRepos(newDisplayed);
    setHasMore(endIndex < filteredRepos.length);
    setLoadingMore(false);
  }, [page, filteredRepos]);

  // Intersection Observer para infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
      }, 300);
    }
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const handleGenerate = async (repo: Repository) => {
    setSelected(repo.id);

    try {
      const res = await fetch("http://localhost:3001/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoId: repo.id }),
      });

      const data = await res.json();
      if (data.readme) {
        setReadme(data.readme);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSelected(null);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando repositórios...</p>
          <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Seus Repositórios</h2>
            <p className="text-gray-600">
              {repos.length} repositório{repos.length !== 1 ? 's' : ''} encontrado{repos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar repositórios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow w-full"
              />
            </div>
            {search && (
              <p className="text-sm text-gray-500 mt-2">
                Mostrando {filteredRepos.length} resultado{filteredRepos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="grid gap-4">
            {displayedRepos.map((repo) => (
              <div
                key={repo.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all animate-fadeIn"
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
                        Criado {new Date(repo.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-gray-400">
                        Atualizado {new Date(repo.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        {repo.fork ? "Fork" : "Original"}
                      </span>
                      <span>
                        Branch: {repo.default_branch}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerate(repo)}
                    disabled={selected === repo.id}
                    className="ml-4 flex cursor-pointer items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {selected === repo.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Gerar Documentação
                      </>
                    )}
                    <Link href={repo.html_url} target="_blank" onClick={e => e.stopPropagation()} className="ml-2 p-1 rounded hover:bg-white/20 transition-colors">
                      <span className="sr-only">Abrir no GitHub</span>
                      <Github className="w-5 h-5" />
                    </Link>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator para infinite scroll */}
          {loadingMore && hasMore && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600 font-medium">Carregando mais...</span>
            </div>
          )}

          {/* Observer target */}
          <div ref={observerTarget} className="h-4" />

          {/* Empty state */}
          {displayedRepos.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {search ? "Nenhum repositório encontrado" : "Você ainda não tem repositórios"}
              </h3>
              <p className="text-gray-600">
                {search ? "Tente ajustar sua busca" : "Crie um novo repositório no GitHub"}
              </p>
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && displayedRepos.length > 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <div className="h-px w-12 bg-gray-300"></div>
                <span>Todos os repositórios carregados</span>
                <div className="h-px w-12 bg-gray-300"></div>
              </div>
            </div>
          )}
        </div>
        {readme && (
          <ReadmeModal
            readme={readme}
            onClose={() => setReadme(null)}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};