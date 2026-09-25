package com.pedidos360.bff.controller;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PruebaController {

    @GetMapping("/api/prueba")
    public Map<String, Object> prueba(@AuthenticationPrincipal Jwt jwt) {

        return Map.of(
            "mensaje", "Access Token validado correctamente por el BFF",
            "usuario", jwt.getSubject()
        );
    }
}