package com.seplag.artistalbum.infrastructure.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Para fins de demonstração, estamos utilizando um usuário fixo (hardcoded) para avaliação.
        // Em uma aplicação real, deve-se buscar o usuário no banco de dados.
        if ("admin".equals(username)) {
            return User.builder()
                    .username("admin")
                    .password("{noop}admin321") // senha: admin321
                    .roles("ADMIN")
                    .build();
        }

        // Se o usuário não for encontrado, lança exceção adequada
        throw new UsernameNotFoundException("Usuário não encontrado: " + username);
    }
}

