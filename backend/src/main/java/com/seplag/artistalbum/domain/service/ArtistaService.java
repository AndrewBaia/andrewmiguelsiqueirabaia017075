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

    public ArtistaService(ArtistaRepository artistaRepository, AlbumRepository albumRepository) {
        this.artistaRepository = artistaRepository;
        this.albumRepository = albumRepository;
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
        return converterParaDTO(artista);
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
        return converterParaDTO(artista);
    }

    /**
     * Exclui um artista pelo ID, lança exceção caso não exista.
     *
     * @param id ID do artista a ser excluído.
     */
    public void excluirArtista(Long id) {
        if (!artistaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Artista não encontrado com id: " + id);
        }
        artistaRepository.deleteById(id);
    }

    /**
     * Converte um objeto Artista para o respectivo DTO, incluindo a contagem de álbuns.
     *
     * @param artista Entidade artista.
     * @return DTO do artista.
     */
    private ArtistaDTO converterParaDTO(Artista artista) {
        Long quantidadeAlbuns = albumRepository.countByArtistaId(artista.getId());
        return new ArtistaDTO(artista.getId(), artista.getNome(), quantidadeAlbuns.intValue());
    }

    /**
     * Converte um objeto Artista para DTO, incluindo detalhes dos álbuns do artista.
     *
     * @param artista Entidade artista.
     * @return DTO detalhado do artista.
     */
    private ArtistaDTO converterParaDTOComAlbuns(Artista artista) {
        List<AlbumDTO> albunsDTO = artista.getAlbuns().stream()
                .map(album -> new AlbumDTO(album.getId(), album.getTitulo(),
                        album.getUrlImagemCapa(), null))
                .collect(Collectors.toList());

        return new ArtistaDTO(
                artista.getId(),
                artista.getNome(),
                albunsDTO,
                artista.getAlbuns().size(),
                artista.getDataCriacao(),
                artista.getDataAtualizacao()
        );
    }
}
