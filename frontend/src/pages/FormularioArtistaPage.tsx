import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { CreateArtistRequest } from '../types';
import { useNotifications } from '../context/NotificationContext';
import {
  User,
  ChevronLeft,
  Save,
  X,
  UserPlus,
  AlertCircle
} from 'lucide-react';

const FormularioArtistaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateArtistRequest>({
    nome: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      loadArtist();
    }
  }, [id, isEditing]);

  const loadArtist = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const artist = await apiService.getArtist(parseInt(id));
      setFormData({ nome: artist.nome });
    } catch (error) {
      addNotification('Falha ao carregar artista', 'error');
      navigate('/artistas');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do artista é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome do artista deve ter pelo menos 2 caracteres';
    } else if (formData.nome.trim().length > 255) {
      newErrors.nome = 'Nome do artista não deve exceder 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        await apiService.updateArtist(parseInt(id), formData);
        addNotification('Artista atualizado com sucesso', 'success');
      } else {
        await apiService.createArtist(formData);
        addNotification('Artista criado com sucesso', 'success');
      }

      navigate('/artistas');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ nome: 'Já existe um artista com este nome' });
      } else {
        addNotification(
          isEditing ? 'Falha ao atualizar artista' : 'Falha ao criar artista',
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
            to="/artistas"
            className="inline-flex items-center text-spotify-subtext hover:text-white font-semibold mb-4 transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para Artistas
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isEditing ? 'Editar Artista' : 'Criar Artista'}
          </h1>
        </div>
        <p className="text-spotify-subtext font-medium md:ml-16">
          {isEditing
            ? `Atualize as informações de ${formData.nome}`
            : 'Adicione um novo artista à sua galeria musical'}
        </p>
      </div>

      <div className="bg-[#181818] rounded-lg shadow-xl border border-[#282828] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="nome" className="label text-base text-white font-bold mb-2">
                Nome do Artista <span className="text-spotify-green">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-subtext group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`input pl-12 py-3 text-lg bg-[#282828] border-transparent text-white placeholder-spotify-subtext rounded-full focus:bg-[#333] focus:ring-white ${errors.nome ? 'border-spotify-error focus:ring-spotify-error' : ''}`}
                  placeholder="ex: Pink Floyd"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {errors.nome && (
                <div className="mt-3 flex items-center gap-2 text-spotify-error animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-bold">{errors.nome}</p>
                </div>
              )}
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
                  {isEditing ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  {isEditing ? 'ATUALIZAR ARTISTA' : 'CRIAR ARTISTA'}
                </span>
              )}
            </button>
            <Link
              to="/artistas"
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

export default FormularioArtistaPage;




