import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RateLimitModal } from '../components/RateLimitModal';
import { useRateLimit } from '../context/RateLimitContext';

// Mock do hook useRateLimit
vi.mock('../context/RateLimitContext', () => ({
  useRateLimit: vi.fn(),
}));

describe('RateLimitModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('não deve renderizar nada quando visible é false (timeLeft <= 0)', () => {
    (useRateLimit as any).mockReturnValue({
      showModal: false,
      timeLeft: 0,
      hideModal: vi.fn(),
    });

    const { container } = render(<RateLimitModal />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o modal central quando showModal é true e timeLeft > 0', () => {
    (useRateLimit as any).mockReturnValue({
      showModal: true,
      timeLeft: 45,
      hideModal: vi.fn(),
    });

    render(<RateLimitModal />);
    
    // Verifica se o modal central aparece
    expect(screen.getByText('Limite de Requisições')).toBeInTheDocument();
    // O tempo aparece no modal central e no cronômetro
    expect(screen.getAllByText('45s').length).toBeGreaterThan(0);
  });

  it('deve mostrar apenas o cronômetro flutuante quando showModal é false mas timeLeft > 0', () => {
    (useRateLimit as any).mockReturnValue({
      showModal: false,
      timeLeft: 15,
      hideModal: vi.fn(),
    });

    render(<RateLimitModal />);
    
    // O modal central NÃO deve estar presente (isMinimized será true no useEffect interno)
    expect(screen.queryByText('Limite de Requisições')).not.toBeInTheDocument();
    // O cronômetro flutuante deve estar presente
    expect(screen.getByText('Rate Limit')).toBeInTheDocument();
    expect(screen.getByText('15s')).toBeInTheDocument();
  });
});
