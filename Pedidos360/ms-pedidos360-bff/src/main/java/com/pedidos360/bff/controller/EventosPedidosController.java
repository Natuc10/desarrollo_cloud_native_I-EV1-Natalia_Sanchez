package com.pedidos360.bff.controller;

import com.pedidos360.bff.messaging.OrderEventPublisher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Ruta protegida por JWT usando la configuración existente del BFF. */
@RestController
@RequestMapping("/api/orders")
public class EventosPedidosController {
    private final OrderEventPublisher publisher;
    public EventosPedidosController(OrderEventPublisher publisher) { this.publisher = publisher; }

    public record OrdenEvento(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{1,40}") String orderId,
        @NotBlank @Pattern(regexp = "[^|]{1,100}") String customerName,
        @Pattern(regexp = "OK|TEMPORAL|PERMANENTE") String failureMode
    ) {}

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public String publicar(@Valid @RequestBody OrdenEvento body) {
        String modo = body.failureMode() == null ? "OK" : body.failureMode();
        publisher.publicar(body.orderId(), body.customerName(), modo);
        return "Evento publicado a RabbitMQ: " + body.orderId();
    }
}
