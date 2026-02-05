import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appFacade } from '../services/facade';
import { apiService } from '../services/api';
import { Album } from '../types';

// Mock apiService
vi.mock('../services/api', () => ({
  apiService: {
    getAllAlbumsByArtist: vi.fn(),
    createAlbum: vi.fn(),
    uploadAlbumCover: vi.fn(),
  },
}));

describe('AppFacade (Lógica de Cache e WebSocket)', () => {
  const ARTIST_ID = 1;
  const ALBUM_1: Album = { id: 101, titulo: 'Album A', idArtista: ARTIST_ID, dataCriacao: '2023-01-01' };
  const ALBUM_2: Album = { id: 102, titulo: 'Album B', idArtista: ARTIST_ID, dataCriacao: '2023-02-01' };
  const MOCKED_ALBUMS = [ALBUM_1, ALBUM_2];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Limpar o cache interno e resetar subjects
    (appFacade as any).albumsCache.clear();
    (appFacade as any).artistsCache = null;
    (appFacade as any).albumsSubject.next([]);
    (appFacade as any).currentArtistId = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve carregar álbuns da API na primeira chamada', async () => {
    (apiService.getAllAlbumsByArtist as any).mockResolvedValue(MOCKED_ALBUMS);

    await appFacade.loadAlbumsByArtist(ARTIST_ID);

    expect(apiService.getAllAlbumsByArtist).toHaveBeenCalledWith(ARTIST_ID, 'asc');
    expect(appFacade.albumsValue).toEqual(MOCKED_ALBUMS);
  });

  it('deve usar o cache para chamadas subsequentes dentro do TTL (2 min)', async () => {
    (apiService.getAllAlbumsByArtist as any).mockResolvedValue(MOCKED_ALBUMS);

    // Primeira chamada
    await appFacade.loadAlbumsByArtist(ARTIST_ID);
    // Segunda chamada imediata
    await appFacade.loadAlbumsByArtist(ARTIST_ID);

    expect(apiService.getAllAlbumsByArtist).toHaveBeenCalledTimes(1);
    expect(appFacade.albumsValue).toEqual(MOCKED_ALBUMS);
  });

  it('deve invalidar o cache e chamar a API novamente após o TTL expirar', async () => {
    (apiService.getAllAlbumsByArtist as any).mockResolvedValue(MOCKED_ALBUMS);

    await appFacade.loadAlbumsByArtist(ARTIST_ID);
    expect(apiService.getAllAlbumsByArtist).toHaveBeenCalledTimes(1);

    // Avança 2 minutos e 1 segundo (TTL é 120000ms)
    vi.advanceTimersByTime(120001);

    await appFacade.loadAlbumsByArtist(ARTIST_ID);
    expect(apiService.getAllAlbumsByArtist).toHaveBeenCalledTimes(2);
  });

  it('deve atualizar a lista de álbuns em tempo real via WebSocket se for o artista atual', async () => {
    // Simula que o usuário está vendo o artista 1
    (appFacade as any).currentArtistId = ARTIST_ID;
    (appFacade as any).albumsSubject.next(MOCKED_ALBUMS);

    const NEW_ALBUM: Album = { id: 103, titulo: 'Novo Album WS', idArtista: ARTIST_ID, dataCriacao: '2023-03-01' };
    
    appFacade.handleWebSocketAlbumCreate(NEW_ALBUM);

    // O novo álbum deve ter sido adicionado à lista sem reload
    expect(appFacade.albumsValue).toContainEqual(NEW_ALBUM);
    expect(appFacade.albumsValue.length).toBe(3);
  });

  it('deve apenas limpar o cache (sem atualizar lista) se o álbum do WebSocket for de outro artista', async () => {
    (appFacade as any).currentArtistId = ARTIST_ID;
    (appFacade as any).albumsSubject.next(MOCKED_ALBUMS);

    const OTHER_ARTIST_ALBUM: Album = { id: 999, titulo: 'Album Outro', idArtista: 2, dataCriacao: '2023-03-01' };
    
    appFacade.handleWebSocketAlbumCreate(OTHER_ARTIST_ALBUM);

    // A lista do artista 1 NÃO deve mudar
    expect(appFacade.albumsValue).toEqual(MOCKED_ALBUMS);
    // Mas o cache deve ser limpo para garantir que quando o usuário for para o artista 2, os dados venham novos
    expect((appFacade as any).albumsCache.size).toBe(0);
  });
});
