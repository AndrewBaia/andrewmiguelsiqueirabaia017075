import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Artist, PaginatedResponse } from '../types';
import { useNotifications } from '../context/NotificationContext';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Music,
  ArrowUpDown,
  Filter
} from 'lucide-react';

const ListaArtistasPage: React.FC = () => {
  const [artists, setArtists] = useState<PaginatedResponse<Artist> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const { addNotification } = useNotifications();

  const loadArtists = async () => {
    try {
      setLoading(true);
      const data = await apiService.getArtists(currentPage, 12, sortDirection, searchTerm || undefined);
      setArtists(data);
    } catch (error) {
      addNotification('Falha ao carregar artistas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadArtists();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, sortDirection, searchTerm]);

  const handleSortChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setCurrentPage(0);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Artistas</h1>
          <p className="text-slate-500 mt-1 font-medium">Gerencie e explore sua coleção de artistas musicais</p>
        </div>
        <Link
          to="/artistas/novo"
          className="btn btn-primary px-6 py-3 h-fit group"
        >
          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
          Adicionar Novo Artista Musical
        </Link>
      </div>

      {/* Controls section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Buscar artistas musicais por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 py-3 shadow-sm"
          />
        </div>
        <button
          onClick={handleSortChange}
          className="btn btn-secondary px-6 shadow-sm flex items-center gap-2 group whitespace-nowrap"
        >
          <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          Ordenar: {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        </button>
      </div>

      {/* Grid section */}
      {loading && !artists ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-slate-100/50"></div>
          ))}
        </div>
      ) : artists && artists.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.content.map((artist) => (
              <Link
                key={artist.id}
                to={`/artistas/${artist.id}`}
                className="card card-hover group flex flex-col p-6"
              >
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                  <User className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {artist.nome}
                </h3>
                <div className="flex items-center text-slate-500 gap-2 mb-4">
                  <Music className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {artist.quantidadeAlbuns || 0} {artist.quantidadeAlbuns === 1 ? 'Álbum' : 'Álbuns'}
                  </span>
                </div>
                <div className="mt-auto flex items-center text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                  Ver Perfil
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
            <div className="text-sm font-semibold text-slate-500">
              Mostrando <span className="text-slate-900">{artists.number * artists.size + 1}</span> até{' '}
              <span className="text-slate-900">{Math.min((artists.number + 1) * artists.size, artists.totalElements)}</span> de{' '}
              <span className="text-slate-900">{artists.totalElements}</span> resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={artists.first}
                className="btn btn-secondary p-2 disabled:bg-slate-50 disabled:text-slate-300 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center px-4 font-bold text-sm text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm">
                Página {artists.number + 1} de {artists.totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={artists.last}
                className="btn btn-secondary p-2 disabled:bg-slate-50 disabled:text-slate-300 shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
          <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Filter className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum artista encontrado</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-8">
            {searchTerm
              ? `Não conseguimos encontrar nenhum artista correspondendo a "${searchTerm}"`
              : "Você ainda não adicionou nenhum artista. Comece criando o seu primeiro!"}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-secondary"
            >
              Limpar busca
            </button>
          ) : (
            <Link to="/artistas/novo" className="btn btn-primary px-8">
              Adicione seu primeiro artista
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ListaArtistasPage;

