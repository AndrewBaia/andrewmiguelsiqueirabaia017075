package com.seplag.artistalbum.domain.port;

import com.seplag.artistalbum.domain.model.Artista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistaRepository extends JpaRepository<Artista, Long> {

    Optional<Artista> findByNome(String nome);

    boolean existsByNome(String nome);

    @Query("SELECT a FROM Artista a WHERE LOWER(a.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    Page<Artista> findByNomeContainingIgnoreCase(@Param("nome") String nome, Pageable paginacao);
}

