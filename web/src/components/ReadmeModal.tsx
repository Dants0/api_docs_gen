import { ReadmeModalProps } from "@/types/Readme";
import { useState } from "react";



export const ReadmeModal = ({ readme, onClose }: ReadmeModalProps) => {
  const handleDownload = () => {
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(readme);
    alert("Conteúdo copiado para a área de transferência!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">README Gerado</h2>
        <div className="overflow-auto max-h-96 p-4 bg-gray-50 border border-gray-200 rounded mb-4">
          <pre className="whitespace-pre-wrap text-sm">{readme}</pre>
        </div>
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Copiar
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
};
