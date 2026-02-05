package com.seplag.artistalbum.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AlbumDTO {

    private Long id;

    @NotBlank(message = "Título do álbum é obrigatório")
    @Size(max = 255, message = "Título do álbum não deve exceder 255 caracteres")
    private String titulo;

    @NotNull(message = "ID do artista é obrigatório")
    private Long idArtista;

    private String nomeArtista;

    private String urlImagemCapa;

    private String urlImagemCapaAssinada;

    private String urlS3Presigned;

    private LocalDateTime dataCriacao;

    private LocalDateTime dataAtualizacao;

    public AlbumDTO() {}

    public AlbumDTO(Long id, String titulo, Long idArtista, String nomeArtista,
                   String urlImagemCapa, LocalDateTime dataCriacao, LocalDateTime dataAtualizacao) {
        this.id = id;
        this.titulo = titulo;
        this.idArtista = idArtista;
        this.nomeArtista = nomeArtista;
        this.urlImagemCapa = urlImagemCapa;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
    }

    public AlbumDTO(Long id, String titulo, String urlImagemCapa, String urlImagemCapaAssinada) {
        this.id = id;
        this.titulo = titulo;
        this.urlImagemCapa = urlImagemCapa;
        this.urlImagemCapaAssinada = urlImagemCapaAssinada;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getNomeArtista() {
        return nomeArtista;
    }

    public void setNomeArtista(String nomeArtista) {
        this.nomeArtista = nomeArtista;
    }

    public String getUrlImagemCapa() {
        return urlImagemCapa;
    }

    public void setUrlImagemCapa(String urlImagemCapa) {
        this.urlImagemCapa = urlImagemCapa;
    }

    public String getUrlImagemCapaAssinada() {
        return urlImagemCapaAssinada;
    }

    public void setUrlImagemCapaAssinada(String urlImagemCapaAssinada) {
        this.urlImagemCapaAssinada = urlImagemCapaAssinada;
    }

    public String getUrlS3Presigned() {
        return urlS3Presigned;
    }

    public void setUrlS3Presigned(String urlS3Presigned) {
        this.urlS3Presigned = urlS3Presigned;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
}

