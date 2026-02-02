import axios, { AxiosInstance } from 'axios';
import { LoginRequest, LoginResponse, Artist, Album, CreateArtistRequest, CreateAlbumRequest, PaginatedResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await this.api.post('/auth/refresh');
              const newToken = refreshResponse.data.token;
              localStorage.setItem('authToken', newToken);
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.api.request(error.config);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/refresh');
    return response.data;
  }

  // Artist methods
  async getArtists(page = 0, size = 10, sort = 'asc', search?: string): Promise<PaginatedResponse<Artist>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) {
      const response = await this.api.get<PaginatedResponse<Artist>>(`/v1/artistas/pesquisa?nome=${encodeURIComponent(search)}&${params}`);
      return response.data;
    }

    const response = await this.api.get<PaginatedResponse<Artist>>(`/v1/artistas?${params}`);
    return response.data;
  }

  async getArtist(id: number): Promise<Artist> {
    const response = await this.api.get<Artist>(`/v1/artistas/${id}`);
    return response.data;
  }

  async createArtist(artist: CreateArtistRequest): Promise<Artist> {
    const response = await this.api.post<Artist>('/v1/artistas', artist);
    return response.data;
  }

  async updateArtist(id: number, artist: CreateArtistRequest): Promise<Artist> {
    const response = await this.api.put<Artist>(`/v1/artistas/${id}`, artist);
    return response.data;
  }

  async deleteArtist(id: number): Promise<void> {
    await this.api.delete(`/v1/artistas/${id}`);
  }

  // Album methods
  async getAlbumsByArtist(artistId: number, page = 0, size = 10): Promise<PaginatedResponse<Album>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await this.api.get<PaginatedResponse<Album>>(`/v1/albums/artista/${artistId}?${params}`);
    return response.data;
  }

  async getAllAlbumsByArtist(artistId: number, sort = 'asc'): Promise<Album[]> {
    const response = await this.api.get<Album[]>(`/v1/albums/artista/${artistId}/todos?ordenacao=${sort}`);
    return response.data;
  }

  async getAlbum(id: number): Promise<Album> {
    const response = await this.api.get<Album>(`/v1/albums/${id}`);
    return response.data;
  }

  async createAlbum(album: CreateAlbumRequest): Promise<Album> {
    const response = await this.api.post<Album>('/v1/albums', album);
    return response.data;
  }

  async updateAlbum(id: number, album: CreateAlbumRequest): Promise<Album> {
    const response = await this.api.put<Album>(`/v1/albums/${id}`, album);
    return response.data;
  }

  async deleteAlbum(id: number): Promise<void> {
    await this.api.delete(`/v1/albums/${id}`);
  }

  async uploadAlbumCover(albumId: number, file: File): Promise<Album> {
    const formData = new FormData();
    formData.append('arquivo', file);

    const response = await this.api.post<Album>(`/v1/albums/${albumId}/capa`, formData);
    return response.data;
  }
}

export const apiService = new ApiService();
