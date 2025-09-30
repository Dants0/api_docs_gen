"use client";

import { useEffect, useState } from "react";
import { FileText, LogOut } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // busca usuário logado do backend
    fetch("http://localhost:3001/github/user", {
      credentials: "include", // envia cookie automaticamente
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                API DocGen
              </h1>
              <p className="text-xs text-gray-500">Powered by GitHub</p>
            </div>
          </div>

          {/* Área do usuário */}
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">{user.name || user.login}</span>
              <button
                onClick={() => {
                  window.location.href = "http://localhost:3001/auth/github/logout";
                }}
                className="text-sm text-red-600 hover:underline border p-2 bg-red-100 rounded"
              >
                <LogOut className="w-5 h-5 inline-block" />
              </button>
            </div>
          ) : (
            <Link
              href="http://localhost:3001/auth/github/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Login com GitHub
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
