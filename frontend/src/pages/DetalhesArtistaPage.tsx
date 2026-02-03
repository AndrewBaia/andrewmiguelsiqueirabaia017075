import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Artist, Album } from '../types';
import { useNotifications } from '../context/NotificationContext';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Music,
  MoreVertical,
  Disc,
  UserX,
  User
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const DetalhesArtistaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (id) {
      loadArtistAndAlbums();
    }
  }, [id]);

  const loadArtistAndAlbums = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [artistData, albumsData] = await Promise.all([
        apiService.getArtist(parseInt(id)),
        apiService.getAllAlbumsByArtist(parseInt(id))
      ]);
      setArtist(artistData);
      setAlbums(albumsData);
    } catch (error) {
      addNotification('Falha ao carregar detalhes do artista', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlbum = async (albumId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este álbum?')) {
      try {
        await apiService.deleteAlbum(albumId);
        addNotification('Álbum excluído com sucesso', 'success');
        setAlbums(albums.filter(a => a.id !== albumId));
      } catch (error) {
        addNotification('Falha ao excluir álbum', 'error');
      }
    }
  };

  const handleDeleteArtist = async () => {
    if (!artist || !id) return;

    if (window.confirm(`Tem certeza que deseja excluir "${artist.nome}" e todos os seus álbuns? Esta ação não poderá ser desfeita.`)) {
      try {
        await apiService.deleteArtist(parseInt(id));
        addNotification('Artista excluído com sucesso', 'success');
        navigate('/artistas');
      } catch (error) {
        addNotification('Falha ao excluir artista', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-50 rounded-2xl border border-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Artista não encontrado</h2>
        <p className="text-slate-500 mb-8">O artista que você está procurando não existe ou foi removido.</p>
        <Link to="/artistas" className="btn btn-primary px-8">Voltar para Artistas</Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#282828] to-[#121212] p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10">
          <Link
            to="/artistas"
            className="inline-flex items-center text-spotify-subtext hover:text-white font-semibold mb-8 transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para Artistas
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 md:h-48 md:w-48 rounded-full bg-[#282828] flex items-center justify-center shadow-2xl overflow-hidden">
                <User className="h-12 w-12 md:h-24 md:w-24 text-spotify-subtext" />
              </div>
              <div className="flex flex-col justify-end h-full py-2">
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                  <span className="bg-spotify-green h-2 w-2 rounded-full inline-block"></span>
                  Artista Verificado
                </span>
                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-4 text-white">
                  {artist.nome}
                </h1>
                <div className="flex items-center gap-4 text-white font-medium text-sm md:text-base">
                  <span>{albums.length} {albums.length === 1 ? 'lançamento' : 'lançamentos'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/artistas/${id}/albuns/novo`}
                className="btn btn-primary px-8 py-3 rounded-full font-bold tracking-wider text-xs md:text-sm transform hover:scale-105 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                NOVO ÁLBUM
              </Link>
              <Link
                to={`/artistas/${id}/editar`}
                className="btn bg-transparent border border-[#535353] hover:border-white text-white px-6 py-3 rounded-full font-bold text-xs md:text-sm tracking-wider uppercase"
              >
                <Pencil className="h-4 w-4 mr-2" />
                EDITAR
              </Link>
              <button
                onClick={handleDeleteArtist}
                className="btn bg-transparent border border-[#535353] hover:border-spotify-error text-spotify-subtext hover:text-white hover:bg-spotify-error px-4 py-3 rounded-full transition-colors"
                title="Excluir Artista"
              >
                <UserX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Albums Section */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-[#282828] pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Discografia
          </h2>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="card bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-all duration-300 group">
                {/* Cover Image Placeholder/Actual */}
                <div className="aspect-square w-full relative overflow-hidden bg-[#282828] rounded-md mb-4 shadow-lg">
                  {album.urlImagemCapaAssinada ? (
                    <img
                      src={album.urlImagemCapaAssinada}
                      alt={`Capa de ${album.titulo}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#535353]">
                      <Music className="h-16 w-16 mb-2 opacity-50" />
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Menu as="div" className="relative">
                      <Menu.Button className="h-8 w-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-[#333] rounded-md bg-[#282828] shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-20">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to={`/albuns/${album.id}/editar`}
                                  className={`${
                                    active ? 'bg-[#333] text-white' : 'text-spotify-subtext'
                                  } group flex w-full items-center rounded-sm px-3 py-2 text-sm font-medium`}
                                >
                                  <Pencil className="mr-3 h-4 w-4" />
                                  Editar
                                </Link>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDeleteAlbum(album.id!)}
                                  className={`${
                                    active ? 'bg-[#333] text-white' : 'text-spotify-subtext'
                                  } group flex w-full items-center rounded-sm px-3 py-2 text-sm font-medium hover:text-spotify-error`}
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Excluir
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1 truncate group-hover:text-white transition-colors">
                    {album.titulo}
                  </h3>
                  <div className="flex items-center gap-2 text-spotify-subtext text-sm font-medium">
                    <span>{new Date(album.dataCriacao || '').getFullYear() || 'Ano desconhecido'} • Álbum</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-transparent rounded-lg border border-dashed border-[#282828]">
            <div className="mx-auto h-16 w-16 bg-[#282828] rounded-full flex items-center justify-center mb-4">
              <Disc className="h-8 w-8 text-spotify-subtext" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Nenhum álbum adicionado ainda</h3>
            <p className="text-spotify-subtext mb-8 max-w-xs mx-auto">Este artista ainda não tem lançamentos na sua galeria.</p>
            <Link
              to={`/artistas/${id}/albuns/novo`}
              className="btn btn-secondary rounded-full px-8 py-3 font-bold text-sm tracking-wider uppercase border-[#535353] hover:border-white text-white"
            >
              Adicionar Primeiro Álbum
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default DetalhesArtistaPage;
