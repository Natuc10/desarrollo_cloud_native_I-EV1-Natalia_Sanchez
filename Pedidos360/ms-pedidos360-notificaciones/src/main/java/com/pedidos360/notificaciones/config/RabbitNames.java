package com.pedidos360.notificaciones.config;

/** Nombres centralizados y compartidos por los componentes de mensajería. */
public final class RabbitNames {
    private RabbitNames() {}
    public static final String ORDERS_EXCHANGE = "pedidos360.events";
    public static final String ORDERS_QUEUE = "pedidos360.orders";
    public static final String ORDERS_ROUTING_KEY = "order.created";
    public static final String DLX_EXCHANGE = "pedidos360.dlx";
    public static final String DLQ_QUEUE = "pedidos360.orders.dlq";
    public static final String DLQ_ROUTING_KEY = "order.failed";
}
