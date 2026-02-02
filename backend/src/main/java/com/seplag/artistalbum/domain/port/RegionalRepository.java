package com.seplag.artistalbum.domain.port;

import com.seplag.artistalbum.domain.model.Regional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionalRepository extends JpaRepository<Regional, Long> {

    List<Regional> findByAtivoTrue();

    List<Regional> findByAtivoFalse();

    Optional<Regional> findByNomeAndAtivo(String nome, Boolean ativo);

    List<Regional> findByNome(String nome);

    @Modifying
    @Query("UPDATE Regional r SET r.ativo = false WHERE r.nome = :nome AND r.ativo = true")
    int deactivateByNome(@Param("nome") String nome);

    @Query("SELECT r FROM Regional r WHERE r.ativo = true ORDER BY r.nome")
    List<Regional> findActiveOrderByNome();
}




