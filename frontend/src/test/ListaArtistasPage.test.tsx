import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ListaArtistasPage from '../pages/ListaArtistasPage';
import { appFacade } from '../services/facade';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../context/NotificationContext';
import React from 'react';

// Mock do appFacade
vi.mock('../services/facade', () => {
  const { BehaviorSubject } = require('rxjs');
  return {
    appFacade: {
      paginatedArtists$: new BehaviorSubject(null),
      loadingArtists$: new BehaviorSubject(false),
      loadArtists: vi.fn().mockResolvedValue(undefined),
      handleWebSocketAlbumCreate: vi.fn(),
    },
  };
});

// Mock do WebSocketService
vi.mock('../services/websocket', () => {
  return {
    webSocketService: {
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn().mockReturnValue(false),
    },
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        {ui}
      </NotificationProvider>
    </BrowserRouter>
  );
};

describe('ListaArtistasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    (appFacade.paginatedArtists$ as any).next(null);
    (appFacade.loadingArtists$ as any).next(false);
  });

  it('deve exibir o estado de carregamento inicial', () => {
    (appFacade.loadingArtists$ as any).next(true);
    renderWithProviders(<ListaArtistasPage />);
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve exibir a lista de artistas quando os dados são carregados', async () => {
    const mockArtists = {
      content: [
        { id: 1, nome: 'Artista Teste 1', quantidadeAlbuns: 2, urlImagemPerfilAssinada: null },
        { id: 2, nome: 'Artista Teste 2', quantidadeAlbuns: 5, urlImagemPerfilAssinada: null },
      ],
      totalElements: 2,
      totalPages: 1,
      size: 12,
      number: 0,
      first: true,
      last: true,
    };

    (appFacade.paginatedArtists$ as any).next(mockArtists);
    (appFacade.loadingArtists$ as any).next(false);

    renderWithProviders(<ListaArtistasPage />);

    expect(screen.getByText('Artista Teste 1')).toBeInTheDocument();
    expect(screen.getByText('Artista Teste 2')).toBeInTheDocument();
  });

  it('deve chamar loadArtists ao mudar o termo de busca', async () => {
    renderWithProviders(<ListaArtistasPage />);
    
    const searchInput = screen.getByPlaceholderText(/Buscar artistas musicais/);
    fireEvent.change(searchInput, { target: { value: 'Queen' } });

    await waitFor(() => {
      expect(appFacade.loadArtists).toHaveBeenCalledWith(0, 12, 'asc', 'Queen');
    }, { timeout: 1500 });
  });

  it('deve alternar a ordenação ao clicar no botão de ordenar', async () => {
    renderWithProviders(<ListaArtistasPage />);
    
    const sortButton = screen.getByText(/ORDENAR:/);
    fireEvent.click(sortButton);

    await waitFor(() => {
      expect(appFacade.loadArtists).toHaveBeenCalled();
    });
    
    expect(screen.getByText('ORDENAR: Z-A')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando nenhum artista é encontrado', () => {
    (appFacade.paginatedArtists$ as any).next({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 12,
      number: 0,
      first: true,
      last: true,
    });

    renderWithProviders(<ListaArtistasPage />);

    expect(screen.getByText('Nenhum artista encontrado')).toBeInTheDocument();
  });
});
