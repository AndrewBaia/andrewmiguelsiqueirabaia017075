package com.seplag.artistalbum.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CriarArtistaRequest {

    @NotBlank(message = "Nome do artista é obrigatório")
    @Size(max = 255, message = "Nome do artista não deve exceder 255 caracteres")
    private String nome;

    public CriarArtistaRequest() {}

    public CriarArtistaRequest(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}

