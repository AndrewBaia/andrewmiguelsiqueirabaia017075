package com.seplag.artistalbum.domain.service;

import com.seplag.artistalbum.application.dto.ArtistaDTO;
import com.seplag.artistalbum.application.dto.AlbumDTO;
import com.seplag.artistalbum.application.dto.CriarArtistaRequest;
import com.seplag.artistalbum.infrastructure.exception.ResourceNotFoundException;
import com.seplag.artistalbum.infrastructure.exception.DuplicateResourceException;
import com.seplag.artistalbum.domain.model.Artista;
import com.seplag.artistalbum.domain.port.ArtistaRepository;
import com.seplag.artistalbum.domain.port.AlbumRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pelas operações de negócio relacionadas ao artista.
 */
@Service
@Transactional
public class ArtistaService {

    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;
    private final MinioService minioService;
    private final SimpMessagingTemplate messagingTemplate;

    public ArtistaService(ArtistaRepository artistaRepository, AlbumRepository albumRepository, 
                          MinioService minioService, SimpMessagingTemplate messagingTemplate) {
        this.artistaRepository = artistaRepository;
        this.albumRepository = albumRepository;
        this.minioService = minioService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Obtém todos os artistas com paginação e ordenação por nome.
     *
     * @param paginacao Pageable para controle de página e tamanho.
     * @param direcaoOrdenacao String "asc" para crescente ou "desc" para decrescente.
     * @return Página de ArtistaDTO.
     */
    public Page<ArtistaDTO> obterTodosArtistas(Pageable paginacao, String direcaoOrdenacao) {
        // Criar um novo Pageable com a ordenação correta se não vier no objeto original
        Sort sort = "desc".equalsIgnoreCase(direcaoOrdenacao) 
                ? Sort.by("nome").descending() 
                : Sort.by("nome").ascending();
        
        Pageable paginacaoComOrdenacao = PageRequest.of(
                paginacao.getPageNumber(), 
                paginacao.getPageSize(), 
                sort
        );

        Page<Artista> artistas = artistaRepository.findAll(paginacaoComOrdenacao);
        return artistas.map(this::converterParaDTO);
    }

    /**
     * Pesquisa artistas pelo nome, ignorando maiúsculas/minúsculas.
     *
     * @param nome Nome do artista para pesquisar.
     * @param paginacao Dados de paginação.
     * @return Página de ArtistaDTO contendo os resultados encontrados.
     */
    public Page<ArtistaDTO> pesquisarArtistas(String nome, Pageable paginacao) {
        Page<Artista> artistas = artistaRepository.findByNomeContainingIgnoreCase(nome, paginacao);
        return artistas.map(this::converterParaDTO);
    }

    /**
     * Busca um artista pelo seu ID e retorna suas informações detalhadas junto com álbuns.
     *
     * @param id ID do artista.
     * @return DTO do artista encontrado.
     */
    public ArtistaDTO obterArtistaPorId(Long id) {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado com id: " + id));
        return converterParaDTOComAlbuns(artista);
    }

    /**
     * Registra um novo artista após validar unicidade do nome.
     *
     * @param requisicao Dados para criação do artista.
     * @return DTO do artista criado.
     */
    public ArtistaDTO criarArtista(CriarArtistaRequest requisicao) {
        if (artistaRepository.existsByNome(requisicao.getNome())) {
            throw new DuplicateResourceException("Artista já existe com nome: " + requisicao.getNome());
        }

        Artista artista = new Artista(requisicao.getNome());
        artista = artistaRepository.save(artista);
        
        ArtistaDTO dto = converterParaDTOComAlbuns(artista);
        // Notifica via WebSocket para atualização em tempo real no frontend
        messagingTemplate.convertAndSend("/topic/artists", dto);
        
        return dto;
    }

    /**
     * Atualiza um artista existente, verificando unicidade de nome no banco.
     *
     * @param id ID do artista a ser atualizado.
     * @param requisicao Dados para atualização.
     * @return DTO atualizado do artista.
     */
    public ArtistaDTO atualizarArtista(Long id, CriarArtistaRequest requisicao) {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado com id: " + id));

        // Verifica se já existe outro artista com o mesmo nome
        artistaRepository.findByNome(requisicao.getNome())
                .filter(artistaExistente -> !artistaExistente.getId().equals(id))
                .ifPresent(artistaExistente -> {
                    throw new DuplicateResourceException("Artista já existe com nome: " + requisicao.getNome());
                });

        artista.setNome(requisicao.getNome());
        artista = artistaRepository.save(artista);
        
        ArtistaDTO dto = converterParaDTOComAlbuns(artista);
        // Notifica via WebSocket para atualização em tempo real no frontend
        messagingTemplate.convertAndSend("/topic/artists", dto);
        
        return dto;
    }

    /**
     * Exclui um artista pelo ID, lança exceção caso não exista.
     *
     * @param id ID do artista a ser excluído.
     */
    public void excluirArtista(Long id) {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado com id: " + id));
        
        // Remove foto do MinIO se existir
        if (artista.getUrlImagemPerfil() != null) {
            try {
                minioService.deleteFile(artista.getUrlImagemPerfil());
            } catch (Exception e) {
                System.err.println("Falha ao excluir foto do artista: " + e.getMessage());
            }
        }

        artistaRepository.deleteById(id);
        // Notifica via WebSocket para remover da lista no frontend
        messagingTemplate.convertAndSend("/topic/artists/delete", id);
    }

    public ArtistaDTO fazerUploadFotoPerfil(Long id, byte[] bytes, String originalFilename, String tipoConteudo) {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado com id: " + id));

        try {
            // Remove foto antiga se existir
            if (artista.getUrlImagemPerfil() != null) {
                minioService.deleteFile(artista.getUrlImagemPerfil());
            }

            // Faz upload da nova foto
            String chaveObjeto = "artist-photos/" + id + "/" + originalFilename;
            minioService.uploadFile(chaveObjeto, bytes, tipoConteudo);

            artista.setUrlImagemPerfil(chaveObjeto);
            artista = artistaRepository.save(artista);

            ArtistaDTO dto = converterParaDTOComAlbuns(artista);
            // Notifica via WebSocket para atualização em tempo real no frontend
            messagingTemplate.convertAndSend("/topic/artists", dto);

            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Falha ao fazer upload da foto de perfil", e);
        }
    }

    public byte[] obterBytesFotoPerfil(String urlImagemPerfil) throws Exception {
        return minioService.downloadFile(urlImagemPerfil);
    }

    /**
     * Converte um objeto Artista para o respectivo DTO, incluindo a contagem de álbuns.
     *
     * @param artista Entidade artista.
     * @return DTO do artista.
     */
    private ArtistaDTO converterParaDTO(Artista artista) {
        Long quantidadeAlbuns = albumRepository.countByArtistaId(artista.getId());
        ArtistaDTO dto = new ArtistaDTO(artista.getId(), artista.getNome(), quantidadeAlbuns.intValue(), artista.getUrlImagemPerfil());
        
        if (artista.getUrlImagemPerfil() != null) {
            // URL estável via proxy para o frontend
            dto.setUrlImagemPerfilAssinada("/api/v1/artistas/foto/" + artista.getId());
            
            // Requisito do Edital: Recuperação por links pré-assinados (30 min)
            try {
                String urlS3Real = minioService.generatePresignedUrl(artista.getUrlImagemPerfil(), 30);
                dto.setUrlS3Presigned(urlS3Real);
                System.out.println("Link S3 (30min) para artista " + artista.getId() + ": " + urlS3Real);
            } catch (Exception e) {}
        }
        
        return dto;
    }

    /**
     * Converte um objeto Artista para DTO, incluindo detalhes dos álbuns do artista.
     *
     * @param artista Entidade artista.
     * @return DTO detalhado do artista.
     */
    private ArtistaDTO converterParaDTOComAlbuns(Artista artista) {
        List<AlbumDTO> albunsDTO = artista.getAlbuns().stream()
                .map(album -> {
                    AlbumDTO albumDto = new AlbumDTO(album.getId(), album.getTitulo(),
                            album.getArtista().getId(), album.getArtista().getNome(),
                            album.getUrlImagemCapa(), album.getDataCriacao(), album.getDataAtualizacao());
                    if (album.getUrlImagemCapa() != null) {
                        // URL estável via proxy
                        albumDto.setUrlImagemCapaAssinada("/api/v1/albuns/capa/" + album.getId());
                        
                        // Requisito do Edital: Links pré-assinados (30 min)
                        try {
                            String urlS3Real = minioService.generatePresignedUrl(album.getUrlImagemCapa(), 30);
                            albumDto.setUrlS3Presigned(urlS3Real);
                            System.out.println("Link S3 (30min) para álbum " + album.getId() + ": " + urlS3Real);
                        } catch (Exception e) {}
                    }
                    return albumDto;
                })
                .collect(Collectors.toList());

        ArtistaDTO dto = new ArtistaDTO(
                artista.getId(),
                artista.getNome(),
                albunsDTO,
                artista.getAlbuns().size(),
                artista.getUrlImagemPerfil(),
                artista.getDataCriacao(),
                artista.getDataAtualizacao()
        );

        if (artista.getUrlImagemPerfil() != null) {
            // URL estável via proxy
            dto.setUrlImagemPerfilAssinada("/api/v1/artistas/foto/" + artista.getId());
            
            // Requisito do Edital: Links pré-assinados (30 min)
            try {
                String urlS3Real = minioService.generatePresignedUrl(artista.getUrlImagemPerfil(), 30);
                dto.setUrlS3Presigned(urlS3Real);
                System.out.println("Link S3 (30min) para artista " + artista.getId() + ": " + urlS3Real);
            } catch (Exception e) {}
        }

        return dto;
    }
}
