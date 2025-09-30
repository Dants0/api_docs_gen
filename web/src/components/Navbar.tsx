import { FileText } from "lucide-react";

export const Navbar = ({ user }: any) => (
  <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
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

        {user && (
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-purple-500" />
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
        )}
      </div>
    </div>
  </nav>
);