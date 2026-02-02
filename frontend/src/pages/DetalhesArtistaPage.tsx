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
  Calendar,
  MoreVertical,
  Disc,
  UserX
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
      <div className="relative overflow-hidden rounded-3xl bg-indigo-950 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-10"></div>

        <div className="relative z-10">
          <Link
            to="/artistas"
            className="inline-flex items-center text-indigo-200 hover:text-white font-semibold mb-8 transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para Artistas
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                <Disc className="h-12 w-12 md:h-16 md:w-16 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                  {artist.nome}
                </h1>
                <div className="flex items-center gap-4 text-indigo-100 font-medium">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm">
                    <Music className="h-4 w-4" />
                    {albums.length} {albums.length === 1 ? 'Álbum' : 'Álbuns'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteArtist}
                className="btn bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 hover:text-white border border-rose-500/20 transition-all font-bold px-4"
                title="Excluir Artista"
              >
                <UserX className="h-5 w-5" />
              </button>
              <Link
                to={`/artistas/${id}/editar`}
                className="btn bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all font-bold px-6"
              >
                <Pencil className="h-5 w-5 mr-2" />
                Editar Perfil
              </Link>
              <Link
                to={`/artistas/${id}/albuns/novo`}
                className="btn bg-white text-indigo-950 hover:bg-indigo-50 shadow-xl transition-all font-bold px-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Novo Álbum
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Albums Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Discografia
            <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              {albums.length}
            </span>
          </h2>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div key={album.id} className="card card-hover flex flex-col group">
                {/* Cover Image Placeholder/Actual */}
                <div className="aspect-square w-full relative overflow-hidden bg-slate-100">
                  {album.urlImagemCapaAssinada ? (
                    <img
                      src={album.urlImagemCapaAssinada}
                      alt={`Capa de ${album.titulo}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Disc className="h-20 w-20 mb-2" />
                      <span className="text-sm font-bold opacity-50">Sem Capa</span>
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Menu as="div" className="relative">
                      <Menu.Button className="h-10 w-10 bg-white/90 backdrop-blur shadow-xl rounded-full flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors">
                        <MoreVertical className="h-5 w-5" />
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
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-slate-100 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to={`/albuns/${album.id}/editar`}
                                  className={`${
                                    active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold`}
                                >
                                  <Pencil className="mr-3 h-4 w-4" />
                                  Editar Álbum
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
                                    active ? 'bg-rose-50 text-rose-600' : 'text-slate-700'
                                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold`}
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Excluir Álbum
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {album.titulo}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Data de lançamento indisponível</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Disc className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum álbum adicionado ainda</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Este artista ainda não foi vinculado a nenhum álbum na sua coleção.</p>
            <Link
              to={`/artistas/${id}/albuns/novo`}
              className="btn btn-secondary shadow-sm font-bold"
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
