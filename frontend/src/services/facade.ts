import { BehaviorSubject, Observable } from 'rxjs';
import { Artist, Album, PaginatedResponse, CreateArtistRequest, CreateAlbumRequest } from '../types';
import { apiService } from './api';

/**
 * Facade Pattern para gerenciamento de estado e dados da aplicação.
 * Utiliza BehaviorSubject (RxJS) para manter o estado reativo conforme exigido pelo edital.
 */
class AppFacade {
  // Subjects para Artistas
  private artistsSubject = new BehaviorSubject<Artist[]>([]);
  private paginatedArtistsSubject = new BehaviorSubject<PaginatedResponse<Artist> | null>(null);
  private loadingArtistsSubject = new BehaviorSubject<boolean>(false);

  // Subjects para Álbuns
  private albumsSubject = new BehaviorSubject<Album[]>([]);
  private loadingAlbumsSubject = new BehaviorSubject<boolean>(false);

  // Cache de Álbuns por Artista e Ordenação
  // Chave: `${artistId}-${sort}`
  private albumsCache = new Map<string, { data: Album[], timestamp: number }>();
  private CACHE_TTL = 2 * 60 * 1000; // 2 minutos em milissegundos

  // Observables públicos
  public artists$: Observable<Artist[]> = this.artistsSubject.asObservable();
  public paginatedArtists$: Observable<PaginatedResponse<Artist> | null> = this.paginatedArtistsSubject.asObservable();
  public loadingArtists$: Observable<boolean> = this.loadingArtistsSubject.asObservable();
  public albums$: Observable<Album[]> = this.albumsSubject.asObservable();
  public loadingAlbums$: Observable<boolean> = this.loadingAlbumsSubject.asObservable();

  // Getters de valor atual
  get artistsValue() { return this.artistsSubject.value; }
  get albumsValue() { return this.albumsSubject.value; }

  // Métodos de Artista
  async loadArtists(page = 0, size = 10, sort = 'asc', search?: string) {
    this.loadingArtistsSubject.next(true);
    try {
      const data = await apiService.getArtists(page, size, sort, search);
      this.paginatedArtistsSubject.next(data);
      this.artistsSubject.next(data.content);
    } catch (error: any) {
      // Se for erro de Rate Limit, não loga como erro de carregamento para evitar confusão
      if (error.response?.status !== 429) {
        console.error('Erro ao carregar artistas:', error);
      }
      throw error;
    } finally {
      this.loadingArtistsSubject.next(false);
    }
  }

  async getArtistById(id: number): Promise<Artist> {
    // Tenta encontrar no cache do Subject primeiro
    const cached = this.artistsSubject.value.find(a => a.id === id);
    if (cached) return cached;
    
    return await apiService.getArtist(id);
  }

  async createArtist(artist: CreateArtistRequest) {
    const newArtist = await apiService.createArtist(artist);
    // Atualiza a lista local se necessário ou recarrega
    return newArtist;
  }

  async updateArtist(id: number, artist: CreateArtistRequest) {
    const updated = await apiService.updateArtist(id, artist);
    return updated;
  }

  async deleteArtist(id: number) {
    await apiService.deleteArtist(id);
  }

  async uploadArtistPhoto(artistId: number, file: File) {
    const updated = await apiService.uploadArtistPhoto(artistId, file);
    // Atualiza o cache do artista se ele estiver na lista
    const currentArtists = this.artistsSubject.value;
    const index = currentArtists.findIndex(a => a.id === artistId);
    if (index !== -1) {
      currentArtists[index] = updated;
      this.artistsSubject.next([...currentArtists]);
    }
    return updated;
  }

  // Métodos de Álbum
  async loadAlbumsByArtist(artistId: number, sort = 'asc') {
    const cacheKey = `${artistId}-${sort}`;
    const cached = this.albumsCache.get(cacheKey);
    const now = Date.now();

    // Se tiver no cache e não expirou, usa o cache
    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      this.albumsSubject.next(cached.data);
      return;
    }

    this.loadingAlbumsSubject.next(true);
    this.albumsSubject.next([]); // Limpa a lista anterior para evitar "ghost data"
    try {
      const data = await apiService.getAllAlbumsByArtist(artistId, sort);
      
      // Salva no cache
      this.albumsCache.set(cacheKey, { data, timestamp: now });
      
      this.albumsSubject.next(data);
    } catch (error) {
      console.error('Erro ao carregar álbuns:', error);
      throw error;
    } finally {
      this.loadingAlbumsSubject.next(false);
    }
  }

  /**
   * Limpa o cache de um artista específico (útil após criar/editar/deletar álbum)
   */
  private clearAlbumCache(artistId: number) {
    const keys = Array.from(this.albumsCache.keys());
    keys.forEach(key => {
      if (key.startsWith(`${artistId}-`)) {
        this.albumsCache.delete(key);
      }
    });
  }

  async createAlbum(album: CreateAlbumRequest) {
    const result = await apiService.createAlbum(album);
    this.clearAlbumCache(album.idArtista);
    // Força a atualização da lista de álbuns se estivermos na página do artista
    this.loadAlbumsByArtist(album.idArtista);
    return result;
  }

  async updateAlbum(id: number, album: CreateAlbumRequest) {
    const result = await apiService.updateAlbum(id, album);
    this.clearAlbumCache(album.idArtista);
    return result;
  }

  async deleteAlbum(id: number) {
    // Como o delete não recebe o artistaId, precisamos encontrar o álbum no cache para saber qual artista limpar
    // Ou simplesmente limpar todo o cache de álbuns para segurança
    await apiService.deleteAlbum(id);
    this.albumsCache.clear();
  }

  async uploadAlbumCover(albumId: number, file: File) {
    const result = await apiService.uploadAlbumCover(albumId, file);
    this.albumsCache.clear(); // Limpa para garantir que a nova capa seja carregada
    return result;
  }

  /**
   * Manipula a criação de um álbum via WebSocket para atualização em tempo real
   */
  handleWebSocketAlbumCreate(album: Album) {
    // 1. Limpa o cache do artista para que a próxima carga manual venha fresca
    this.clearAlbumCache(album.idArtista);

    // 2. Se a lista de álbuns atual for do artista do novo álbum, atualiza o Subject
    // Isso faz com que a tela de detalhes atualize instantaneamente sem F5
    const currentAlbums = this.albumsSubject.value;
    
    // Verifica se já não existe (para evitar duplicidade se o próprio usuário criou)
    if (!currentAlbums.find(a => a.id === album.id)) {
      // Só adicionamos se a lista atual for do artista correto
      // Como não guardamos o currentArtistId no Subject de álbuns, 
      // uma forma simples é verificar se a lista está vazia ou se o primeiro álbum é do mesmo artista
      const isSameArtist = currentAlbums.length === 0 || currentAlbums[0].idArtista === album.idArtista;
      
      if (isSameArtist) {
        this.albumsSubject.next([...currentAlbums, album]);
      }
    }
  }
}

export const appFacade = new AppFacade();

