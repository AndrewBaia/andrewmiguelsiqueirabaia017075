package com.seplag.artistalbum.application.controller;

import com.seplag.artistalbum.application.dto.LoginRequest;
import com.seplag.artistalbum.application.dto.LoginResponse;
import com.seplag.artistalbum.infrastructure.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "APIs de gerenciamento de autenticação")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário e obter token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        Long expiresIn = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();

        LoginResponse response = new LoginResponse(token, expiresIn);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token JWT")
    public ResponseEntity<LoginResponse> refresh(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7);

        if (jwtService.canTokenBeRefreshed(token)) {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                    username, "", java.util.Collections.emptyList());

            String newToken = jwtService.generateToken(userDetails);
            Long expiresIn = jwtService.extractExpiration(newToken).getTime() - System.currentTimeMillis();

            LoginResponse response = new LoginResponse(newToken, expiresIn);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().build();
    }
}

