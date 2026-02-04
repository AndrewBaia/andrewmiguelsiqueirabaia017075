package com.seplag.artistalbum.infrastructure.config;

import com.seplag.artistalbum.infrastructure.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ConfiguracaoSeguranca {

    private final JwtAuthenticationFilter filtroAutenticacaoJwt;

    public ConfiguracaoSeguranca(JwtAuthenticationFilter filtroAutenticacaoJwt) {
        this.filtroAutenticacaoJwt = filtroAutenticacaoJwt;
    }

    @Bean
    public SecurityFilterChain cadeiaFiltrosSeguranca(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(fonteConfiguracaoCors()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/v1/albuns/capa/**").permitAll()
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated()

            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(filtroAutenticacaoJwt, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder codificadorSenha() {
        return new DelegatingPasswordEncoder("bcrypt", Map.of(
            "bcrypt", new BCryptPasswordEncoder(),
            "noop", org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance()
        ));
    }

    @Bean
    public AuthenticationManager gerenciadorAutenticacao(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource fonteConfiguracaoCors() {
        CorsConfiguration configuracao = new CorsConfiguration();
        configuracao.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"));
        configuracao.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuracao.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuracao.setAllowCredentials(true);
        configuracao.setMaxAge(3600L);
        configuracao.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/**", configuracao);
        return fonte;
    }
}

