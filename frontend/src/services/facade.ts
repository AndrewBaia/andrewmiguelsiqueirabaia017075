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
  private currentArtistSubject = new BehaviorSubject<Artist | null>(null);

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
  public currentArtist$: Observable<Artist | null> = this.currentArtistSubject.asObservable();

  // Getters de valor atual
  get artistsValue() { return this.artistsSubject.value; }
  get albumsValue() { return this.albumsSubject.value; }
  get currentArtistValue() { return this.currentArtistSubject.value; }

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
    const artist = await apiService.getArtist(id);
    this.currentArtistSubject.next(artist);
    return artist;
  }

  async createArtist(artist: CreateArtistRequest) {
    const newArtist = await apiService.createArtist(artist);
    // Atualiza a lista local se necessário ou recarrega
    return newArtist;
  }

  async updateArtist(id: number, artist: CreateArtistRequest) {
    const updated = await apiService.updateArtist(id, artist);
    if (this.currentArtistSubject.value?.id === id) {
      this.currentArtistSubject.next(updated);
    }
    return updated;
  }

  async deleteArtist(id: number) {
    await apiService.deleteArtist(id);
    if (this.currentArtistSubject.value?.id === id) {
      this.currentArtistSubject.next(null);
    }
  }

  async uploadArtistPhoto(artistId: number, file: File) {
    const updated = await apiService.uploadArtistPhoto(artistId, file);
    
    // 1. Limpa o cache de artistas para que a próxima carga venha fresca
    this.paginatedArtistsSubject.next(null);

    const updatedArtist = { ...updated };
    // Adiciona timestamp para forçar o refresh da imagem no navegador
    if (updatedArtist.urlImagemPerfilAssinada) {
      updatedArtist.urlImagemPerfilAssinada = `${updatedArtist.urlImagemPerfilAssinada}?t=${Date.now()}`;
    }

    // 2. Atualiza o artista atual se for o mesmo
    if (this.currentArtistSubject.value?.id === artistId) {
      this.currentArtistSubject.next(updatedArtist);
    }

    // 3. Atualiza o cache do artista se ele estiver na lista reativa
    const currentArtists = [...this.artistsSubject.value];
    const index = currentArtists.findIndex(a => a.id === artistId);
    
    if (index !== -1) {
      currentArtists[index] = updatedArtist;
      this.artistsSubject.next(currentArtists);
    }
    
    return updatedArtist;
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
    
    // 1. Limpa o cache para garantir que a nova capa seja carregada do servidor
    this.albumsCache.clear(); 
    
    // 2. Atualiza o Subject de álbuns imediatamente para refletir a nova imagem
    const currentAlbums = [...this.albumsSubject.value];
    const index = currentAlbums.findIndex(a => a.id === albumId);
    
    if (index !== -1) {
      // Atualiza o objeto do álbum na lista reativa com o resultado da API (que já tem a nova URL)
      // Adicionamos um timestamp na URL para forçar o navegador a ignorar o cache da imagem antiga
      const updatedAlbum = { ...result };
      if (updatedAlbum.urlImagemCapaAssinada) {
        updatedAlbum.urlImagemCapaAssinada = `${updatedAlbum.urlImagemCapaAssinada}?t=${Date.now()}`;
      }
      
      currentAlbums[index] = updatedAlbum;
      this.albumsSubject.next(currentAlbums);
    }
    
    return result;
  }

  /**
   * Manipula a criação ou atualização de um artista via WebSocket
   */
  handleWebSocketArtistCreate(artist: Artist) {
    // 1. Limpa o cache de artistas paginados para forçar recarga na próxima navegação
    // Mas mantemos o objeto atual para não quebrar a tela de listagem
    const currentPaginated = this.paginatedArtistsSubject.value;
    if (currentPaginated) {
      const updatedContent = [...currentPaginated.content];
      const index = updatedContent.findIndex(a => a.id === artist.id);
      
      if (index !== -1) {
        updatedContent[index] = artist;
      } else {
        updatedContent.unshift(artist);
      }
      
      this.paginatedArtistsSubject.next({
        ...currentPaginated,
        content: updatedContent,
        totalElements: index === -1 ? currentPaginated.totalElements + 1 : currentPaginated.totalElements
      });
    } else {
      // Se não houver dados paginados (ex: primeira carga), apenas limpa para forçar refresh
      this.paginatedArtistsSubject.next(null);
    }
    
    // 2. Atualiza a lista reativa de artistas (usada em buscas simples)
    const currentArtists = [...this.artistsSubject.value];
    const index = currentArtists.findIndex(a => a.id === artist.id);
    
    const updatedArtist = { ...artist };
    // Adiciona timestamp se houver imagem para bypassar cache do navegador no websocket
    if (updatedArtist.urlImagemPerfilAssinada) {
      updatedArtist.urlImagemPerfilAssinada = `${updatedArtist.urlImagemPerfilAssinada}?t=${Date.now()}`;
    }

    if (index !== -1) {
      currentArtists[index] = updatedArtist;
      this.artistsSubject.next(currentArtists);
    } else {
      this.artistsSubject.next([updatedArtist, ...currentArtists]);
    }

    // 3. Se o usuário estiver vendo os detalhes desse artista, atualiza o artista atual
    if (this.currentArtistSubject.value?.id === artist.id) {
      this.currentArtistSubject.next(updatedArtist);
    }
  }

  /**
   * Manipula a exclusão de um artista via WebSocket
   */
  handleWebSocketArtistDelete(artistId: number) {
    // 1. Atualiza a paginação
    const currentPaginated = this.paginatedArtistsSubject.value;
    if (currentPaginated) {
      const updatedContent = currentPaginated.content.filter(a => a.id !== artistId);
      this.paginatedArtistsSubject.next({
        ...currentPaginated,
        content: updatedContent,
        totalElements: currentPaginated.totalElements > 0 ? currentPaginated.totalElements - 1 : 0
      });
    }

    // 2. Limpa caches
    this.albumsCache.clear();

    // 3. Remove da lista reativa simples
    const currentArtists = this.artistsSubject.value;
    this.artistsSubject.next(currentArtists.filter(a => a.id !== artistId));

    // 4. Se o usuário estiver vendo os detalhes desse artista, limpa o artista atual
    if (this.currentArtistSubject.value?.id === artistId) {
      this.currentArtistSubject.next(null);
    }
  }

  /**
   * Manipula a exclusão de um álbum via WebSocket
   */
  handleWebSocketAlbumDelete(albumId: number, artistId: number) {
    // Limpa o cache do artista
    this.clearAlbumCache(artistId);

    // Remove da lista de álbuns atual se for o artista que está sendo visualizado
    const currentAlbums = this.albumsSubject.value;
    this.albumsSubject.next(currentAlbums.filter(a => a.id !== albumId));
  }

  /**
   * Manipula a criação ou atualização de um álbum via WebSocket para atualização em tempo real
   */
  handleWebSocketAlbumCreate(album: Album) {
    // 1. Limpa o cache do artista para que a próxima carga manual venha fresca
    this.clearAlbumCache(album.idArtista);

    // 2. Se a lista de álbuns atual for do artista do novo álbum, atualiza o Subject
    const currentAlbums = [...this.albumsSubject.value];
    const index = currentAlbums.findIndex(a => a.id === album.id);
    
    const updatedAlbum = { ...album };
    // Adiciona timestamp para bypassar cache do navegador no websocket
    if (updatedAlbum.urlImagemCapaAssinada) {
      updatedAlbum.urlImagemCapaAssinada = `${updatedAlbum.urlImagemCapaAssinada}?t=${Date.now()}`;
    }

    // Verifica se a lista atual pertence ao artista do álbum recebido
    const isSameArtist = currentAlbums.length === 0 || currentAlbums[0].idArtista === album.idArtista;

    if (isSameArtist) {
      if (index !== -1) {
        // Atualiza álbum existente
        currentAlbums[index] = updatedAlbum;
        this.albumsSubject.next(currentAlbums);
      } else {
        // Adiciona novo álbum
        this.albumsSubject.next([...currentAlbums, updatedAlbum]);
      }
    }
  }
}

export const appFacade = new AppFacade();

