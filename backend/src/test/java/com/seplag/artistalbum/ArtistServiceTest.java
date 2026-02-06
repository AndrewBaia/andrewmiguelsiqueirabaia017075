package com.seplag.artistalbum;

import com.seplag.artistalbum.infrastructure.exception.ResourceNotFoundException;
import com.seplag.artistalbum.domain.model.Artista;
import com.seplag.artistalbum.domain.port.ArtistaRepository;
import com.seplag.artistalbum.domain.port.AlbumRepository;
import com.seplag.artistalbum.domain.service.ArtistaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArtistaServiceTest {

    @Mock
    private ArtistaRepository artistaRepository;

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ArtistaService artistaService;

    private Artista artista;

    @BeforeEach
    void setUp() {
        artista = new Artista("Artista de Teste");
        artista.setId(1L);
        artista.setAlbuns(new java.util.ArrayList<>()); // Inicializa a lista
    }

    @Test
    void obterTodosArtistas_DeveRetornarArtistasPaginados() {
        // Dado
        Pageable paginacao = PageRequest.of(0, 10);
        List<Artista> artistas = List.of(artista);
        Page<Artista> paginaArtista = new PageImpl<>(artistas, paginacao, 1);

        // O serviço agora chama findAll(Pageable) internamente, aplicando a ordenação
        when(artistaRepository.findAll(any(Pageable.class))).thenReturn(paginaArtista);
        when(albumRepository.countByArtistaId(1L)).thenReturn(5L);

        // Quando
        Page<com.seplag.artistalbum.application.dto.ArtistaDTO> resultado = artistaService.obterTodosArtistas(paginacao, "asc");

        // Então
        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).getNome()).isEqualTo("Artista de Teste");
        assertThat(resultado.getContent().get(0).getQuantidadeAlbuns()).isEqualTo(5);
        verify(artistaRepository).findAll(any(Pageable.class));
    }

    @Test
    void obterArtistaPorId_DeveRetornarArtista_QuandoExiste() {
        // Dado
        // Adicionamos álbuns fictícios à lista do artista para o size() retornar 3
        com.seplag.artistalbum.domain.model.Album album1 = new com.seplag.artistalbum.domain.model.Album();
        album1.setArtista(artista);
        com.seplag.artistalbum.domain.model.Album album2 = new com.seplag.artistalbum.domain.model.Album();
        album2.setArtista(artista);
        com.seplag.artistalbum.domain.model.Album album3 = new com.seplag.artistalbum.domain.model.Album();
        album3.setArtista(artista);

        artista.getAlbuns().add(album1);
        artista.getAlbuns().add(album2);
        artista.getAlbuns().add(album3);

        when(artistaRepository.findById(1L)).thenReturn(Optional.of(artista));

        // Quando
        com.seplag.artistalbum.application.dto.ArtistaDTO resultado = artistaService.obterArtistaPorId(1L);

        // Então
        assertThat(resultado.getNome()).isEqualTo("Artista de Teste");
        assertThat(resultado.getQuantidadeAlbuns()).isEqualTo(3);
    }

    @Test
    void obterArtistaPorId_DeveLancarExcecao_QuandoNaoExiste() {
        // Dado
        when(artistaRepository.findById(1L)).thenReturn(Optional.empty());

        // Quando & Então
        assertThatThrownBy(() -> artistaService.obterArtistaPorId(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Artista não encontrado com id: 1");
    }

    @Test
    void criarArtista_DeveRetornarArtistaCriado() {
        // Dado
        com.seplag.artistalbum.application.dto.CriarArtistaRequest requisicao = new com.seplag.artistalbum.application.dto.CriarArtistaRequest("Novo Artista");
        Artista novoArtista = new Artista("Novo Artista");
        novoArtista.setId(2L);

        when(artistaRepository.existsByNome("Novo Artista")).thenReturn(false);
        when(artistaRepository.save(any(Artista.class))).thenReturn(novoArtista);

        // Quando
        com.seplag.artistalbum.application.dto.ArtistaDTO resultado = artistaService.criarArtista(requisicao);

        // Então
        assertThat(resultado.getNome()).isEqualTo("Novo Artista");
        verify(artistaRepository).save(any(Artista.class));
    }

    @Test
    void excluirArtista_DeveExcluir_QuandoExiste() {
        // Dado
        when(artistaRepository.findById(1L)).thenReturn(Optional.of(artista));

        // Quando
        artistaService.excluirArtista(1L);

        // Então
        verify(artistaRepository).deleteById(1L);
        verify(messagingTemplate).convertAndSend(eq("/topic/artists/delete"), eq("1"));
    }

    @Test
    void excluirArtista_DeveLancarExcecao_QuandoNaoExiste() {
        // Dado
        when(artistaRepository.findById(1L)).thenReturn(Optional.empty());

        // Quando & Então
        assertThatThrownBy(() -> artistaService.excluirArtista(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Artista não encontrado com id: 1");
    }
}

