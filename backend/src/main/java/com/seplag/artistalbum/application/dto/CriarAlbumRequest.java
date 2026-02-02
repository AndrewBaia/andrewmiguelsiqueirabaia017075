package com.seplag.artistalbum.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CriarAlbumRequest {

    @NotBlank(message = "Título do álbum é obrigatório")
    @Size(max = 255, message = "Título do álbum não deve exceder 255 caracteres")
    private String titulo;

    @NotNull(message = "ID do artista é obrigatório")
    private Long idArtista;

    public CriarAlbumRequest() {}

    public CriarAlbumRequest(String titulo, Long idArtista) {
        this.titulo = titulo;
        this.idArtista = idArtista;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Long getIdArtista() {
        return idArtista;
    }

    public void setIdArtista(Long idArtista) {
        this.idArtista = idArtista;
    }
}




