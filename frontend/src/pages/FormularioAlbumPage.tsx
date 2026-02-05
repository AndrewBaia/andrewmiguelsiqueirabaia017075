import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { appFacade } from '../services/facade';
import { Album, CreateAlbumRequest, Artist } from '../types';
import { useNotifications } from '../context/NotificationContext';
import {
  ChevronLeft,
  Save,
  X,
  Upload,
  User,
  Type,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

const FormularioAlbumPage: React.FC = () => {
  const { id, artistId } = useParams<{ id: string; artistId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAlbumRequest>({
    titulo: '',
    idArtista: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!id;

  useEffect(() => {
    loadArtists();
    if (isEditing && id) {
      loadAlbum();
    } else if (artistId) {
      setFormData(prev => ({ ...prev, idArtista: parseInt(artistId) }));
    }
  }, [id, artistId, isEditing]);

  const loadArtists = async () => {
    try {
      const response = await apiService.getArtists(0, 1000, 'asc');
      setArtists(response.content);
    } catch (error) {
      addNotification('Falha ao carregar artistas', 'error');
    }
  };

  const loadAlbum = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const album = await apiService.getAlbum(parseInt(id));
      setFormData({
        titulo: album.titulo,
        idArtista: album.idArtista,
      });
      if (album.urlImagemCapaAssinada) {
        setPreviewUrl(album.urlImagemCapaAssinada);
      }
    } catch (error) {
      addNotification('Falha ao carregar álbum', 'error');
      navigate('/artistas');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título do álbum é obrigatório';
    } else if (formData.titulo.trim().length > 255) {
      newErrors.titulo = 'Título do álbum não deve exceder 255 caracteres';
    }

    if (!formData.idArtista || formData.idArtista === 0) {
      newErrors.idArtista = 'Selecione um artista';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idArtista' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing/selecting
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let album: Album;
      if (isEditing && id) {
        album = await apiService.updateAlbum(parseInt(id), formData);
        addNotification('Álbum atualizado com sucesso', 'success');
      } else {
        album = await apiService.createAlbum(formData);
        addNotification('Álbum criado com sucesso', 'success');
      }

      // Upload cover image if selected
      if (selectedFile && album.id) {
        try {
          await appFacade.uploadAlbumCover(album.id, selectedFile);
          addNotification('Imagem de capa enviada com sucesso', 'success');
        } catch (uploadError) {
          addNotification('Álbum criado, mas falha ao enviar imagem de capa', 'error');
        }
      }

      // Navigate back to artist detail page
      const artist = artists.find(a => a.id === formData.idArtista);
      if (artist) {
        navigate(`/artistas/${artist.id}`);
      } else {
        navigate('/artistas');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ titulo: 'Já existe um álbum com este título para este artista' });
      } else {
        addNotification(
          isEditing ? 'Falha ao atualizar álbum' : 'Falha ao criar álbum',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link
            to={artistId ? `/artistas/${artistId}` : '/artistas'}
            className="inline-flex items-center text-spotify-subtext hover:text-white font-semibold mb-4 transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            {artistId ? 'Voltar para Artista' : 'Voltar para Artistas'}
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isEditing ? 'Editar Álbum' : 'Criar Álbum'}
          </h1>
        </div>
        <p className="text-spotify-subtext font-medium md:ml-16">
          {isEditing
            ? `Atualize os detalhes de ${formData.titulo}`
            : 'Adicione um novo álbum à coleção musical'}
        </p>
      </div>

      <div className="bg-[#181818] rounded-lg shadow-xl border border-[#282828] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              <div>
                <label htmlFor="titulo" className="label text-base text-white font-bold mb-2">
                  Título do Álbum <span className="text-spotify-green">*</span>
                </label>
                <div className="relative group">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-subtext group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className={`input pl-12 py-3 text-lg bg-[#282828] border-transparent text-white placeholder-spotify-subtext rounded-full focus:bg-[#333] focus:ring-white ${errors.titulo ? 'border-spotify-error focus:ring-spotify-error' : ''}`}
                    placeholder="ex: The Dark Side of the Moon"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {errors.titulo && (
                  <div className="mt-3 flex items-center gap-2 text-spotify-error animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-bold">{errors.titulo}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="idArtista" className="label text-base text-white font-bold mb-2">
                  Artista <span className="text-spotify-green">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-subtext group-focus-within:text-white transition-colors z-10" />
                  <select
                    id="idArtista"
                    name="idArtista"
                    value={formData.idArtista}
                    onChange={handleChange}
                    className={`input pl-12 py-3 appearance-none bg-[#282828] border-transparent text-white rounded-full focus:bg-[#333] focus:ring-white ${errors.idArtista ? 'border-spotify-error focus:ring-spotify-error' : ''}`}
                    disabled={loading || !!artistId}
                  >
                    <option value={0} className="bg-[#282828] text-spotify-subtext">Selecione um artista...</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id} className="bg-[#282828] text-white">
                        {artist.nome}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.idArtista && (
                  <div className="mt-3 flex items-center gap-2 text-spotify-error animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-bold">{errors.idArtista}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cover Image Upload */}
            <div className="space-y-6">
              <div>
                <label className="label text-base text-white font-bold mb-2">Imagem de Capa</label>
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="aspect-square w-full max-w-sm mx-auto relative overflow-hidden bg-[#282828] rounded-md border-2 border-dashed border-[#404040] group hover:border-white transition-colors">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview da capa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#535353]">
                        <ImageIcon className="h-16 w-16 mb-4" />
                        <span className="text-sm font-bold">Nenhuma imagem selecionada</span>
                      </div>
                    )}

                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm font-bold">Alterar imagem</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                  </div>

                  <p className="text-xs text-spotify-subtext text-center font-medium">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#282828] flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 py-4 text-lg rounded-full font-bold tracking-wider uppercase transform hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Atualizando...' : 'Criando...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  {isEditing ? 'ATUALIZAR ÁLBUM' : 'CRIAR ÁLBUM'}
                </span>
              )}
            </button>
            <Link
              to={artistId ? `/artistas/${artistId}` : '/artistas'}
              className="btn btn-secondary flex-1 py-4 text-lg rounded-full font-bold tracking-wider uppercase border-[#535353] hover:border-white text-white bg-transparent"
            >
              <span className="flex items-center gap-2">
                <X className="h-5 w-5" />
                CANCELAR
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAlbumPage;
