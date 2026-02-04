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
    } catch (error) {
      console.error('Erro ao carregar artistas:', error);
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

  // Métodos de Álbum
  async loadAlbumsByArtist(artistId: number, sort = 'asc') {
    this.loadingAlbumsSubject.next(true);
    this.albumsSubject.next([]); // Limpa a lista anterior para evitar "ghost data" ou confusão visual
    try {
      const data = await apiService.getAllAlbumsByArtist(artistId, sort);
      this.albumsSubject.next(data);
    } catch (error) {
      console.error('Erro ao carregar álbuns:', error);
      throw error;
    } finally {
      this.loadingAlbumsSubject.next(false);
    }
  }

  async createAlbum(album: CreateAlbumRequest) {
    return await apiService.createAlbum(album);
  }

  async updateAlbum(id: number, album: CreateAlbumRequest) {
    return await apiService.updateAlbum(id, album);
  }

  async deleteAlbum(id: number) {
    await apiService.deleteAlbum(id);
  }

  async uploadAlbumCover(albumId: number, file: File) {
    return await apiService.uploadAlbumCover(albumId, file);
  }
}

export const appFacade = new AppFacade();

