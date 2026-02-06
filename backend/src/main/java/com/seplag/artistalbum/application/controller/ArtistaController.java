package com.seplag.artistalbum.application.controller;

import com.seplag.artistalbum.application.dto.ArtistaDTO;
import com.seplag.artistalbum.application.dto.CriarArtistaRequest;
import com.seplag.artistalbum.domain.service.ArtistaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/v1/artistas")
@Tag(name = "Artistas", description = "APIs de gerenciamento de artistas")
public class ArtistaController {

    private final ArtistaService artistaService;

    public ArtistaController(ArtistaService artistaService) {
        this.artistaService = artistaService;
    }

    @GetMapping
    @Operation(summary = "Listar todos os artistas com paginação e ordenação")
    public ResponseEntity<Page<ArtistaDTO>> obterTodosArtistas(
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho,
            @Parameter(description = "Direção da ordenação (asc ou desc)") @RequestParam(defaultValue = "asc", name = "sort") String ordenacao) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<ArtistaDTO> artistas = artistaService.obterTodosArtistas(paginacao, ordenacao);
        return ResponseEntity.ok(artistas);
    }

    @GetMapping("/pesquisa")
    @Operation(summary = "Pesquisar artistas por nome")
    public ResponseEntity<Page<ArtistaDTO>> pesquisarArtistas(
            @Parameter(description = "Termo de pesquisa") @RequestParam String nome,
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<ArtistaDTO> artistas = artistaService.pesquisarArtistas(nome, paginacao);
        return ResponseEntity.ok(artistas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter artista por ID com álbuns")
    public ResponseEntity<ArtistaDTO> obterArtistaPorId(@Parameter(description = "ID do artista") @PathVariable Long id) {
        ArtistaDTO artista = artistaService.obterArtistaPorId(id);
        return ResponseEntity.ok(artista);
    }

    @PostMapping
    @Operation(summary = "Criar um novo artista")
    public ResponseEntity<ArtistaDTO> criarArtista(@Valid @RequestBody CriarArtistaRequest requisicao) {
        ArtistaDTO artista = artistaService.criarArtista(requisicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(artista);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um artista existente")
    public ResponseEntity<ArtistaDTO> atualizarArtista(
            @Parameter(description = "ID do artista") @PathVariable Long id,
            @Valid @RequestBody CriarArtistaRequest requisicao) {

        ArtistaDTO artista = artistaService.atualizarArtista(id, requisicao);
        return ResponseEntity.ok(artista);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um artista")
    public ResponseEntity<Void> excluirArtista(@Parameter(description = "ID do artista") @PathVariable Long id) {
        artistaService.excluirArtista(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Fazer upload da foto de perfil do artista")
    public ResponseEntity<ArtistaDTO> fazerUploadFotoPerfil(
            @Parameter(description = "ID do artista") @PathVariable Long id,
            @Parameter(description = "Arquivo da foto") @RequestParam("arquivo") MultipartFile arquivo) {

        try {
            String tipoConteudo = arquivo.getContentType();
            if (tipoConteudo == null || !tipoConteudo.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            ArtistaDTO artista = artistaService.fazerUploadFotoPerfil(id, arquivo.getBytes(), arquivo.getOriginalFilename(), tipoConteudo);
            return ResponseEntity.ok(artista);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}/foto")
    @Operation(summary = "Remover a foto de perfil do artista")
    public ResponseEntity<ArtistaDTO> removerFotoPerfil(@Parameter(description = "ID do artista") @PathVariable Long id) {
        ArtistaDTO artista = artistaService.removerFotoPerfil(id);
        return ResponseEntity.ok(artista);
    }

    @GetMapping("/foto/{idArtista}")
    @Operation(summary = "Obter foto de perfil do artista")
    public ResponseEntity<Resource> obterFotoPerfilArtista(@Parameter(description = "ID do artista") @PathVariable Long idArtista) {
        try {
            ArtistaDTO artista = artistaService.obterArtistaPorId(idArtista);

            if (artista.getUrlImagemPerfil() == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] dadosImagem = artistaService.obterBytesFotoPerfil(artista.getUrlImagemPerfil());

            String tipoConteudo = "image/jpeg";
            if (artista.getUrlImagemPerfil().toLowerCase().endsWith(".png")) {
                tipoConteudo = "image/png";
            }

            ByteArrayResource recurso = new ByteArrayResource(dadosImagem);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(tipoConteudo))
                    .contentLength(dadosImagem.length)
                    .body(recurso);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
