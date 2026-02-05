import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Music2, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Layout do sistema principal da galeria
const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Função para fazer logout e redirecionar para login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Itens de navegação do menu lateral
  const navItems = [
    { name: 'Artistas', path: '/artistas', icon: Users },
  ];

  // Checa se o item do menu está ativo pela rota
  const isActive = (path: string) => {
    if (path === '/artistas' && (location.pathname === '/' || location.pathname.startsWith('/artistas'))) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex bg-spotify-base">
      {/* Botão do menu lateral (Mobile) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-black/50 text-white rounded-full shadow-lg hover:bg-black/70 transition-colors backdrop-blur-md"
        aria-label="Menu"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay escurecido quando o menu está aberto no mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar lateral fixa */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-black flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsSidebarOpen(false)}>
            <div className="text-white p-1 rounded-full group-hover:scale-105 transition-transform duration-200">
              <Music2 className="h-10 w-10" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Galeria
            </span>
          </Link>
        </div>

        {/* Navegação dos itens */}
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 group font-bold ${
                  active
                    ? 'text-white bg-[#282828]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                <ActiveIcon className={`h-6 w-6 ${active ? 'text-white' : 'text-[#b3b3b3] group-hover:text-white'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Informações do usuário e botão de sair */}
        <div className="p-4 bg-black mt-auto">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="h-8 w-8 rounded-full bg-[#535353] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {/* Mostra a inicial do usuário autenticado, ou A por padrão */}
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {user?.username || 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-[#b3b3b3] hover:text-white transition-colors duration-200 font-bold text-sm group"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 w-full min-w-0 bg-spotify-base transition-all duration-300 overflow-y-auto">
        {/* Gradiente de fundo do topo */}
        <div className="bg-gradient-to-b from-[#535353] to-spotify-base h-64 absolute w-full md:left-64 md:w-[calc(100%-16rem)] z-0 opacity-30 pointer-events-none"></div>
        
        {/* Renderização de páginas */}
        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 pt-20 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
