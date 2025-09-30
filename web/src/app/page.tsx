"use client"
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { RepoList } from "@/components/RepoList";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<any>({});

  // Simula detecção de página baseada na URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/repos')) {
      setCurrentPage('repos');
      // Simulando dados do usuário
      setUser({ name: 'Desenvolvedor', avatar: 'https://github.com/ghost.png' });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      {currentPage === 'home' ? <Hero /> : <RepoList />}
    </div>
  );
}