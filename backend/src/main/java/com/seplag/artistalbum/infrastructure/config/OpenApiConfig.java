package com.seplag.artistalbum.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Artistas e Álbuns")
                        .version("1.0")
                        .description("API para gerenciamento de artistas e álbuns")
                        .contact(new Contact()
                                .name("SEPLAG")
                                .email("seplag@contato.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api").description("Servidor Local"),
                        new Server().url("http://localhost:3001").description("Interface Web Local")
                ));
    }
}

