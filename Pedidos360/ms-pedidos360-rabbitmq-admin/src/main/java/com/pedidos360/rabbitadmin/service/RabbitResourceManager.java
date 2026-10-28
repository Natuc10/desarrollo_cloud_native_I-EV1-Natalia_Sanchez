package com.pedidos360.rabbitadmin.service;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.stereotype.Service;

/** Sólo maneja recursos demo.*; no elimina topología de producción. */
@Service
public class RabbitResourceManager {
    private final RabbitAdmin admin;
    public RabbitResourceManager(RabbitAdmin admin) { this.admin = admin; }

    public void crearCola(String nombre) {
        validarNombre(nombre);
        admin.declareQueue(QueueBuilder.durable(nombre).build());
    }
    public void eliminarCola(String nombre) {
        validarNombre(nombre);
        admin.deleteQueue(nombre);
    }
    public void crearExchange(String nombre) {
        validarNombre(nombre);
        admin.declareExchange(new DirectExchange(nombre, true, false));
    }
    public void eliminarExchange(String nombre) {
        validarNombre(nombre);
        admin.deleteExchange(nombre);
    }
    public void crearBinding(String cola, String exchange, String clave) {
        validarNombre(cola);
        validarNombre(exchange);
        validarClave(clave);
        Binding binding = BindingBuilder.bind(new Queue(cola, true))
                .to(new DirectExchange(exchange, true, false)).with(clave);
        admin.declareBinding(binding);
    }
    public void eliminarBinding(String cola, String exchange, String clave) {
        validarNombre(cola);
        validarNombre(exchange);
        validarClave(clave);
        Binding binding = BindingBuilder.bind(new Queue(cola, true))
                .to(new DirectExchange(exchange, true, false)).with(clave);
        admin.removeBinding(binding);
    }
    private void validarNombre(String nombre) {
        if (nombre == null || !nombre.matches("demo\\.[a-zA-Z][a-zA-Z0-9._-]{1,63}"))
            throw new IllegalArgumentException("El nombre debe comenzar por demo. y ser válido (ej.: demo.alertas)");
    }
    private void validarClave(String clave) {
        if (clave == null || !clave.matches("[a-zA-Z0-9._-]{1,80}"))
            throw new IllegalArgumentException("Routing key inválida");
    }
}
