package com.pedidos360.notificaciones.controller;

import com.pedidos360.notificaciones.config.RabbitNames;
import org.springframework.amqp.core.QueueInformation;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajeria")
public class EstadoController {
    private final RabbitAdmin rabbitAdmin;
    public EstadoController(RabbitAdmin rabbitAdmin) { this.rabbitAdmin = rabbitAdmin; }

    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> estado() {
        QueueInformation main = rabbitAdmin.getQueueInfo(RabbitNames.ORDERS_QUEUE);
        QueueInformation dlq = rabbitAdmin.getQueueInfo(RabbitNames.DLQ_QUEUE);
        if (main == null || dlq == null) return ResponseEntity.status(503).build();
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("colaPrincipal", main.getName());
        resultado.put("pendientes", main.getMessageCount());
        resultado.put("colaFallidos", dlq.getName());
        resultado.put("mensajesEnDlq", dlq.getMessageCount());
        return ResponseEntity.ok(resultado);
    }
}
