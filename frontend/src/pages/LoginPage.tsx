import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Music2, Lock, User, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      await login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nome de usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-base py-12 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(to_bottom,#121212,black)]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-spotify-green shadow-2xl shadow-green-900/20 mb-6">
            <Music2 className="h-10 w-10 text-black" />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Galeria
          </h2>
          <p className="text-spotify-subtext font-medium text-lg">
            Música para todos.
          </p>
        </div>

        <div className="bg-spotify-highlight p-8 rounded-lg shadow-2xl border border-[#282828]">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-md bg-spotify-error/10 p-4 border border-spotify-error/20 flex items-center gap-3 animate-shake">
                <AlertCircle className="h-5 w-5 text-spotify-error flex-shrink-0" />
                <p className="text-sm font-semibold text-spotify-error">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label uppercase tracking-widest text-xs" htmlFor="username">Usuário</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-subtext group-focus-within:text-white transition-colors" />
                  <input
                    {...register('username')}
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`input pl-11 rounded-full ${errors.username ? 'border-spotify-error focus:ring-spotify-error' : ''}`}
                    placeholder="Nome de usuário"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-xs font-semibold text-spotify-error">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="label uppercase tracking-widest text-xs" htmlFor="password">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-subtext group-focus-within:text-white transition-colors" />
                  <input
                    {...register('password')}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`input pl-11 rounded-full ${errors.password ? 'border-spotify-error focus:ring-spotify-error' : ''}`}
                    placeholder="Senha"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-semibold text-spotify-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-base tracking-widest shadow-none hover:scale-[1.02] transform transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando...
                </span>
              ) : 'ENTRAR'}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-spotify-highlight px-3 text-spotify-subtext font-bold tracking-widest">Acesso Avaliador</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-center">
              <button
                type="button"
                className="p-3 rounded-md bg-[#282828] border border-transparent hover:border-[#404040] transition-colors cursor-pointer group w-full"
                onClick={() => {
                  setValue('username', 'admin');
                  setValue('password', 'admin321');
                }}
              >
                <p className="text-[10px] font-bold text-spotify-subtext uppercase mb-1 group-hover:text-white transition-colors">Credenciais (Clique para preencher)</p>
                <p className="text-sm font-bold text-white">admin / admin321</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
