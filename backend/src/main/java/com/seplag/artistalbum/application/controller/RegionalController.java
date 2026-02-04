package com.seplag.artistalbum.application.controller;

import com.seplag.artistalbum.domain.model.Regional;
import com.seplag.artistalbum.domain.service.RegionalSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/regionais")
@Tag(name = "Regionais", description = "APIs de gerenciamento das regionais da polícia")
public class RegionalController {

    private final RegionalSyncService regionalSyncService;

    public RegionalController(RegionalSyncService regionalSyncService) {
        this.regionalSyncService = regionalSyncService;
    }

    @GetMapping
    @Operation(summary = "Obter todas as regionais ativas")
    public ResponseEntity<List<Regional>> obterRegionaisAtivas() {
        List<Regional> regionais = regionalSyncService.obterRegionaisAtivas();
        return ResponseEntity.ok(regionais);
    }

    @PostMapping("/sincronizar")
    @Operation(summary = "Disparar sincronização manual das regionais")
    public ResponseEntity<String> sincronizarRegionais() {
        regionalSyncService.sincronizarRegionais();
        return ResponseEntity.ok("Sincronização das regionais concluída");
    }
}

