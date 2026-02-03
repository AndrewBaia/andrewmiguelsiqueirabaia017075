import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenRenewalModal } from '../components/TokenRenewalModal';

// Mock do useAuth para evitar erros de contexto
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      isAuthenticated: true,
      tokenExpiration: Date.now() + 30000,
      refreshToken: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

describe('TokenRenewalModal', () => {
  it('não deve renderizar quando show for false', () => {
    const { container } = render(
      <TokenRenewalModal 
        show={false} 
        onRenew={vi.fn()} 
        onLogout={vi.fn()} 
        timeLeft={30} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve exibir o tempo restante corretamente', () => {
    render(
      <TokenRenewalModal 
        show={true} 
        onRenew={vi.fn()} 
        onLogout={vi.fn()} 
        timeLeft={25} 
      />
    );
    expect(screen.getByText(/25 segundos/i)).toBeInTheDocument();
  });

  it('deve chamar onRenew quando o botão "CONTINUAR CONECTADO" for clicado', () => {
    const onRenewMock = vi.fn();
    render(
      <TokenRenewalModal 
        show={true} 
        onRenew={onRenewMock} 
        onLogout={vi.fn()} 
        timeLeft={30} 
      />
    );
    
    const button = screen.getByText(/CONTINUAR CONECTADO/i);
    fireEvent.click(button);
    
    expect(onRenewMock).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onLogout quando o botão "SAIR AGORA" for clicado', () => {
    const onLogoutMock = vi.fn();
    render(
      <TokenRenewalModal 
        show={true} 
        onRenew={vi.fn()} 
        onLogout={onLogoutMock} 
        timeLeft={30} 
      />
    );
    
    const button = screen.getByText(/SAIR AGORA/i);
    fireEvent.click(button);
    
    expect(onLogoutMock).toHaveBeenCalledTimes(1);
  });
});
