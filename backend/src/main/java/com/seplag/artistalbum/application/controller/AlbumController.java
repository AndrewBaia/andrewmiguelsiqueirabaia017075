package com.seplag.artistalbum.application.controller;

import com.seplag.artistalbum.application.dto.AlbumDTO;
import com.seplag.artistalbum.application.dto.CriarAlbumRequest;
import com.seplag.artistalbum.domain.service.AlbumService;
import com.seplag.artistalbum.domain.service.MinioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.util.List;

@RestController
@RequestMapping("/v1/albuns")
@Tag(name = "Álbuns", description = "APIs de gerenciamento de álbuns")
public class AlbumController {

    private final AlbumService albumService;
    private final MinioService minioService;

    public AlbumController(AlbumService albumService, MinioService minioService) {
        this.albumService = albumService;
        this.minioService = minioService;
    }

    @GetMapping("/artista/{idArtista}")
    @Operation(summary = "Obter álbuns por artista com paginação")
    public ResponseEntity<Page<AlbumDTO>> obterAlbunsPorArtista(
            @Parameter(description = "ID do artista") @PathVariable Long idArtista,
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<AlbumDTO> albuns = albumService.obterAlbunsPorArtista(idArtista, paginacao);
        return ResponseEntity.ok(albuns);
    }

    @GetMapping("/artista/{idArtista}/todos")
    @Operation(summary = "Obter todos os álbuns por artista sem paginação")
    public ResponseEntity<List<AlbumDTO>> obterTodosAlbunsPorArtista(
            @Parameter(description = "ID do artista") @PathVariable Long idArtista,
            @Parameter(description = "Direção da ordenação (asc ou desc)") @RequestParam(defaultValue = "asc") String ordenacao) {

        List<AlbumDTO> albuns = albumService.obterTodosAlbunsPorArtista(idArtista, ordenacao);
        return ResponseEntity.ok(albuns);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter álbum por ID")
    public ResponseEntity<AlbumDTO> obterAlbumPorId(@Parameter(description = "ID do álbum") @PathVariable Long id) {
        AlbumDTO album = albumService.obterAlbumPorId(id);
        return ResponseEntity.ok(album);
    }

    @PostMapping
    @Operation(summary = "Criar um novo álbum")
    public ResponseEntity<AlbumDTO> criarAlbum(@Valid @RequestBody CriarAlbumRequest requisicao) {
        AlbumDTO album = albumService.criarAlbum(requisicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(album);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um álbum existente")
    public ResponseEntity<AlbumDTO> atualizarAlbum(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Valid @RequestBody CriarAlbumRequest requisicao) {

        AlbumDTO album = albumService.atualizarAlbum(id, requisicao);
        return ResponseEntity.ok(album);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um álbum")
    public ResponseEntity<Void> excluirAlbum(@Parameter(description = "ID do álbum") @PathVariable Long id) {
        albumService.excluirAlbum(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/capa", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Fazer upload da imagem de capa do álbum")
    public ResponseEntity<AlbumDTO> fazerUploadImagemCapa(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Parameter(description = "Arquivo da imagem de capa") @RequestParam("arquivo") MultipartFile arquivo) {

        try {
            String tipoConteudo = arquivo.getContentType();
            if (tipoConteudo == null || !tipoConteudo.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            AlbumDTO album = albumService.fazerUploadImagemCapa(id, arquivo.getBytes(), arquivo.getOriginalFilename(), tipoConteudo);
            return ResponseEntity.ok(album);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/capa/{idAlbum}")
    @Operation(summary = "Obter imagem de capa do álbum")
    public ResponseEntity<Resource> obterImagemCapaAlbum(@Parameter(description = "ID do álbum") @PathVariable Long idAlbum) {
        try {
            AlbumDTO album = albumService.obterAlbumPorId(idAlbum);

            if (album.getUrlImagemCapa() == null) {
                return ResponseEntity.notFound().build();
            }

            // Download file from MinIO
            byte[] dadosImagem = minioService.downloadFile(album.getUrlImagemCapa());

            // Determine content type (default to JPEG if not available)
            String tipoConteudo = "image/jpeg";
            if (album.getUrlImagemCapa().toLowerCase().endsWith(".png")) {
                tipoConteudo = "image/png";
            } else if (album.getUrlImagemCapa().toLowerCase().endsWith(".gif")) {
                tipoConteudo = "image/gif";
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

