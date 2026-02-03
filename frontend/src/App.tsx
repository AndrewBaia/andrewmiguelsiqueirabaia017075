import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/LoginPage';
import ListaArtistasPage from './pages/ListaArtistasPage';
import DetalhesArtistaPage from './pages/DetalhesArtistaPage';
import FormularioArtistaPage from './pages/FormularioArtistaPage';
import FormularioAlbumPage from './pages/FormularioAlbumPage';
import Layout from './components/Layout';
import NotificationContainer from './components/NotificationContainer';
import { TokenRenewalModal } from './components/TokenRenewalModal';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 animate-pulse shadow-xl shadow-indigo-200 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-slate-500 font-bold tracking-tight animate-pulse">Inicializando Galeria...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          <NotificationContainer />
          <TokenRenewalModal />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ListaArtistasPage />} />
              <Route path="artistas" element={<ListaArtistasPage />} />
              <Route path="artistas/:id" element={<DetalhesArtistaPage />} />
              <Route path="artistas/novo" element={<FormularioArtistaPage />} />
              <Route path="artistas/:id/editar" element={<FormularioArtistaPage />} />
              <Route path="artistas/:idArtista/albuns/novo" element={<FormularioAlbumPage />} />
              <Route path="albuns/:id/editar" element={<FormularioAlbumPage />} />
            </Route>
          </Routes>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
