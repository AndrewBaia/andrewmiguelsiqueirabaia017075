package com.seplag.artistalbum.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class ArtistaDTO {

    private Long id;

    @NotBlank(message = "Nome do artista é obrigatório")
    @Size(max = 255, message = "Nome do artista não deve exceder 255 caracteres")
    private String nome;

    private List<AlbumDTO> albuns;

    private Integer quantidadeAlbuns;

    private LocalDateTime dataCriacao;

    private LocalDateTime dataAtualizacao;

    public ArtistaDTO() {}

    public ArtistaDTO(Long id, String nome, List<AlbumDTO> albuns, Integer quantidadeAlbuns,
                    LocalDateTime dataCriacao, LocalDateTime dataAtualizacao) {
        this.id = id;
        this.nome = nome;
        this.albuns = albuns;
        this.quantidadeAlbuns = quantidadeAlbuns;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
    }

    public ArtistaDTO(Long id, String nome, Integer quantidadeAlbuns) {
        this.id = id;
        this.nome = nome;
        this.quantidadeAlbuns = quantidadeAlbuns;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public List<AlbumDTO> getAlbuns() {
        return albuns;
    }

    public void setAlbuns(List<AlbumDTO> albuns) {
        this.albuns = albuns;
    }

    public Integer getQuantidadeAlbuns() {
        return quantidadeAlbuns;
    }

    public void setQuantidadeAlbuns(Integer quantidadeAlbuns) {
        this.quantidadeAlbuns = quantidadeAlbuns;
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




