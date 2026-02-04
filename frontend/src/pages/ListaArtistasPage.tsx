import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appFacade } from '../services/facade';
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

  useEffect(() => {
    const subscription = appFacade.paginatedArtists$.subscribe((data: PaginatedResponse<Artist> | null) => {
      setArtists(data);
    });
    const loadingSubscription = appFacade.loadingArtists$.subscribe((isLoading: boolean) => {
      setLoading(isLoading);
    });

    return () => {
      subscription.unsubscribe();
      loadingSubscription.unsubscribe();
    };
  }, []);

  const loadArtists = async () => {
    try {
      await appFacade.loadArtists(currentPage, 12, sortDirection, searchTerm || undefined);
    } catch (error) {
      addNotification('Falha ao carregar artistas', 'error');
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Artistas</h1>
          <p className="text-spotify-subtext mt-1 font-medium">Gerencie e explore sua coleção de artistas musicais</p>
        </div>
        <Link
          to="/artistas/novo"
          className="btn btn-primary px-6 py-3 h-fit group font-bold tracking-wider text-xs"
        >
          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
          ADICIONAR NOVO ARTISTA MUSICAL
        </Link>
      </div>

      {/* Controls section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-subtext group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Buscar artistas musicais por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 py-3 bg-[#282828] border-transparent text-white placeholder-spotify-subtext rounded-full focus:bg-[#333] focus:ring-white"
          />
        </div>
        <button
          onClick={handleSortChange}
          className="btn btn-ghost px-6 flex items-center gap-2 group whitespace-nowrap text-spotify-subtext hover:text-white border border-[#282828] hover:border-white rounded-full bg-[#181818]"
        >
          <ArrowUpDown className="h-4 w-4 text-spotify-subtext group-hover:text-white transition-colors" />
          ORDENAR: {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        </button>
      </div>

      {/* Grid section */}
      {loading && !artists ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-[#181818] border border-[#282828]"></div>
          ))}
        </div>
      ) : artists && artists.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.content.map((artist) => (
              <Link
                key={artist.id}
                to={`/artistas/${artist.id}`}
                className="card card-hover group flex flex-col p-6 items-center text-center bg-[#181818] hover:bg-[#282828] rounded-md transition-colors"
              >
                <div className="h-32 w-32 rounded-full bg-[#282828] group-hover:bg-[#333] flex items-center justify-center mb-6 shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
                  {artist.urlImagemPerfilAssinada ? (
                    <img 
                      src={artist.urlImagemPerfilAssinada} 
                      alt={artist.nome} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-spotify-subtext group-hover:text-white transition-colors duration-300" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 truncate w-full">
                  {artist.nome}
                </h3>
                <div className="flex items-center text-spotify-subtext gap-2 mb-4 text-sm font-medium">
                  <Music className="h-4 w-4" />
                  <span>
                    {artist.quantidadeAlbuns || 0} {artist.quantidadeAlbuns === 1 ? 'Álbum' : 'Álbuns'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#282828] mt-8">
            <div className="text-xs font-bold text-spotify-subtext uppercase tracking-wider">
              Mostrando <span className="text-white">{artists.number * artists.size + 1}</span> até{' '}
              <span className="text-white">{Math.min((artists.number + 1) * artists.size, artists.totalElements)}</span> de{' '}
              <span className="text-white">{artists.totalElements}</span> resultados
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={artists.first}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-[#181818] text-white hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center px-4 font-bold text-sm text-white bg-[#181818] rounded-full">
                Página {artists.number + 1} de {artists.totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={artists.last}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-[#181818] text-white hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-24 bg-[#181818] rounded-lg border border-[#282828]">
          <div className="mx-auto h-20 w-20 bg-[#282828] rounded-full flex items-center justify-center mb-6">
            <Filter className="h-10 w-10 text-spotify-subtext" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum artista encontrado</h3>
          <p className="text-spotify-subtext max-w-xs mx-auto mb-8 font-medium">
            {searchTerm
              ? `Não conseguimos encontrar nenhum artista correspondendo a "${searchTerm}"`
              : "Você ainda não adicionou nenhum artista. Comece criando o seu primeiro!"}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-secondary rounded-full px-8 py-3 font-bold text-sm tracking-wider"
            >
              LIMPAR BUSCA
            </button>
          ) : (
            <Link to="/artistas/novo" className="btn btn-primary px-8 py-3 rounded-full font-bold text-sm tracking-wider">
              ADICIONAR PRIMEIRO ARTISTA
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ListaArtistasPage;

