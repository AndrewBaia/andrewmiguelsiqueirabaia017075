import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Music2, 
  Users, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Artistas', path: '/artistas', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/artistas' && (location.pathname === '/' || location.pathname.startsWith('/artistas'))) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-20 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsSidebarOpen(false)}>
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-indigo-200">
              <Music2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Galeria de Artistas
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ActiveIcon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  <span className="font-semibold">{item.name}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {user?.role?.toLowerCase() || 'member'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 rounded-xl group"
          >
            <LogOut className="h-5 w-5 mr-3 text-slate-400 group-hover:text-rose-500" />
            <span className="font-semibold">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 w-full lg:ml-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
