package com.seplag.artistalbum.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoWeb implements WebMvcConfigurer {

    private final InterceptadorLimiteTaxa interceptadorLimiteTaxa;

    public ConfiguracaoWeb(InterceptadorLimiteTaxa interceptadorLimiteTaxa) {
        this.interceptadorLimiteTaxa = interceptadorLimiteTaxa;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registro) {
        registro.addInterceptor(interceptadorLimiteTaxa)
                .addPathPatterns("/v1/**", "/api/v1/**")
                .excludePathPatterns(
                    "/api/auth/**", 
                    "/auth/**",
                    "/swagger-ui/**", 
                    "/v3/api-docs/**", 
                    "/actuator/**",
                    "/v1/albuns/capa/**",
                    "/api/v1/albuns/capa/**",
                    "/v1/artistas/foto/**",
                    "/api/v1/artistas/foto/**"
                );
    }
}




