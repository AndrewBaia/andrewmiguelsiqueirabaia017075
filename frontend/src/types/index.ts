export interface Artist {
  id: number;
  nome: string;
  urlImagemPerfil?: string;
  urlImagemPerfilAssinada?: string;
  urlS3Presigned?: string;
  quantidadeAlbuns?: number;
  albuns?: Album[];
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface Album {
  id: number;
  titulo: string;
  idArtista: number;
  nomeArtista?: string;
  urlImagemCapa?: string;
  urlImagemCapaAssinada?: string;
  urlS3Presigned?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface CreateArtistRequest {
  nome: string;
}

export interface CreateAlbumRequest {
  titulo: string;
  idArtista: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}
