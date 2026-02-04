package com.seplag.artistalbum.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("API de Galeria de Artistas e Álbuns - SEPLAG")
                        .version("1.0.0")
                        .description("Esta API permite o gerenciamento completo de artistas e seus álbuns musicais. " +
                                "Inclui funcionalidades de autenticação JWT, upload de capas para o MinIO, " +
                                "notificações via WebSocket e sincronização de dados regionais. " +
                                "\n\n**Políticas de Uso:**" +
                                "\n- **Rate Limit:** Máximo de 10 requisições por minuto por usuário." +
                                "\n- **Autenticação:** JWT com expiração de 5 minutos.")
                        .contact(new Contact()
                                .name("Andrew Miguel Siqueira Baía")
                                .email("andrewbaia@seplag.mt.gov.br")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api").description("Servidor Local")
                ));
    }
}

