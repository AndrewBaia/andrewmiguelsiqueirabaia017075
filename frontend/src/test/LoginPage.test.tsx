import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock do useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    (useAuth as any).mockReturnValue({
      login: loginMock,
    });
  });

  it('deve renderizar o formulário de login corretamente', () => {
    renderLoginPage();
    
    expect(screen.getByText('Galeria')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome de usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ENTRAR/i })).toBeInTheDocument();
  });

  it('deve exibir erros de validação quando os campos estão vazios', async () => {
    renderLoginPage();
    
    const submitButton = screen.getByRole('button', { name: /ENTRAR/i });
    
    // Removemos o atributo 'required' dos inputs para testar a validação do Zod/React Hook Form
    const usernameInput = screen.getByPlaceholderText('Nome de usuário');
    const passwordInput = screen.getByPlaceholderText('Senha');
    usernameInput.removeAttribute('required');
    passwordInput.removeAttribute('required');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome de usuário é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('deve chamar a função login e navegar para a home em caso de sucesso', async () => {
    loginMock.mockResolvedValueOnce({});
    renderLoginPage();
    
    fireEvent.change(screen.getByPlaceholderText('Nome de usuário'), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'admin321' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin321',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('deve exibir mensagem de erro em caso de falha no login', async () => {
    loginMock.mockRejectedValueOnce({
      response: { data: { message: 'Credenciais inválidas' } },
    });
    
    renderLoginPage();
    
    fireEvent.change(screen.getByPlaceholderText('Nome de usuário'), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'wrong' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('deve preencher as credenciais ao clicar no botão de acesso avaliador', () => {
    renderLoginPage();
    
    const fillButton = screen.getByText(/admin \/ admin321/i).closest('button');
    if (fillButton) fireEvent.click(fillButton);

    expect(screen.getByPlaceholderText('Nome de usuário')).toHaveValue('admin');
    expect(screen.getByPlaceholderText('Senha')).toHaveValue('admin321');
  });
});
