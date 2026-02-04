package com.seplag.artistalbum.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
@Tag(name = "API Raiz", description = "Informações básicas da API")
public class RootController {

    @GetMapping
    @Operation(summary = "Informações da API")
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Artist Album API");
        info.put("version", "1.0.0");
        info.put("description", "API para gerenciamento de artistas e álbuns");
        info.put("documentation", "/swagger-ui/index.html");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("auth", "/auth");
        endpoints.put("artistas", "/v1/artistas");
        endpoints.put("albums", "/v1/albums");
        endpoints.put("regionais", "/v1/regionais");
        info.put("endpoints", endpoints);
        
        return ResponseEntity.ok(info);
    }
}
