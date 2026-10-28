package com.pedidos360.rabbitadmin.controller;

import com.pedidos360.rabbitadmin.service.RabbitResourceManager;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rabbitmq")
public class AdminController {
    private final RabbitResourceManager manager;
    public AdminController(RabbitResourceManager manager) { this.manager = manager; }

    public record NombreRequest(@NotBlank String name) {}
    public record BindingRequest(@NotBlank String queue, @NotBlank String exchange,
                                 @NotBlank String routingKey) {}

    @PostMapping("/queues")
    @ResponseStatus(HttpStatus.CREATED)
    public String crearCola(@Valid @RequestBody NombreRequest body) {
        manager.crearCola(body.name()); return "Cola creada: " + body.name();
    }
    @DeleteMapping("/queues/{name}")
    public String eliminarCola(@PathVariable String name) {
        manager.eliminarCola(name); return "Cola eliminada: " + name;
    }
    @PostMapping("/exchanges")
    @ResponseStatus(HttpStatus.CREATED)
    public String crearExchange(@Valid @RequestBody NombreRequest body) {
        manager.crearExchange(body.name()); return "Exchange creado: " + body.name();
    }
    @DeleteMapping("/exchanges/{name}")
    public String eliminarExchange(@PathVariable String name) {
        manager.eliminarExchange(name); return "Exchange eliminado: " + name;
    }
    @PostMapping("/bindings")
    @ResponseStatus(HttpStatus.CREATED)
    public String crearBinding(@Valid @RequestBody BindingRequest body) {
        manager.crearBinding(body.queue(), body.exchange(), body.routingKey()); return "Binding creado";
    }
    @DeleteMapping("/bindings")
    public String eliminarBinding(@Valid @RequestBody BindingRequest body) {
        manager.eliminarBinding(body.queue(), body.exchange(), body.routingKey()); return "Binding eliminado";
    }
}
