package com.seplag.artistalbum.domain.port;

import com.seplag.artistalbum.domain.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    List<Album> findByArtistaId(Long artistaId);

    Page<Album> findByArtistaId(Long artistaId, Pageable pageable);

    @Query("SELECT a FROM Album a WHERE a.artista.id = :artistaId ORDER BY a.titulo ASC")
    List<Album> findByArtistaIdOrderByTituloAsc(@Param("artistaId") Long artistaId);

    @Query("SELECT a FROM Album a WHERE a.artista.id = :artistaId ORDER BY a.titulo DESC")
    List<Album> findByArtistaIdOrderByTituloDesc(@Param("artistaId") Long artistaId);

    @Query("SELECT COUNT(a) FROM Album a WHERE a.artista.id = :artistaId")
    Long countByArtistaId(@Param("artistaId") Long artistaId);
}

