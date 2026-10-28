import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';

import {
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  InteractionStatus
} from '@azure/msal-browser';

import { filter, take } from 'rxjs/operators';

type EstadoPedido =
  | 'CREADO'
  | 'ACEPTADO'
  | 'EN_PREPARACIÓN'
  | 'DESPACHADO'
  | 'ENTREGADO'
  | 'CANCELADO';

interface ProductoPedido {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: number;
  cliente: string;

  // Identificador de la cuenta que creó el pedido.
  // Los pedidos de ejemplo no tienen propietario asignado.
  propietarioId?: string;

  fecha: string;
  productos: ProductoPedido[];
  total: number;
  estado: EstadoPedido;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  // Información del usuario autenticado

  rolUsuario: string = '';

  nombreUsuario: string = '';

  propietarioId: string = '';

  sesionCargada: boolean = false;


  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}


  ngOnInit(): void {

    this.msalBroadcastService.inProgress$
      .pipe(
        filter(status => status === InteractionStatus.None),
        take(1)
      )
      .subscribe(() => {

        this.cargarUsuario();

      });

  }


  // Obtener usuario y rol desde Microsoft Entra ID

  cargarUsuario(): void {

    const cuenta =
      this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (!cuenta) {
      return;
    }

    this.msalService.instance.setActiveAccount(cuenta);

    this.nombreUsuario = cuenta.name || cuenta.username;

    // Identificador de la cuenta autenticada
    this.propietarioId = cuenta.homeAccountId;

    const claims = cuenta.idTokenClaims as
      { roles?: string[] } | undefined;

    const roles = claims?.roles ?? [];

    if (roles.includes('ROLE_ADMINISTRADOR')) {

      this.rolUsuario = 'ADMINISTRADOR';

    } else if (roles.includes('ROLE_OPERADOR')) {

      this.rolUsuario = 'OPERADOR';

    } else if (roles.includes('ROLE_CLIENTE')) {

      this.rolUsuario = 'CLIENTE';

    }

    this.sesionCargada = true;

  }


  // Permisos según el rol

  get esCliente(): boolean {
    return this.rolUsuario === 'CLIENTE';
  }

  get puedeGestionarEstados(): boolean {

    return (
      this.rolUsuario === 'OPERADOR' ||
      this.rolUsuario === 'ADMINISTRADOR'
    );

  }


  // Pedidos de ejemplo

  pedidos: Pedido[] = [
    {
      id: 1001,
      cliente: 'María González',
      fecha: '2026-09-24',
      productos: [
        {
          nombre: 'Hamburguesa clásica',
          cantidad: 2,
          precio: 5990
        },
        {
          nombre: 'Papas fritas',
          cantidad: 1,
          precio: 2990
        }
      ],
      total: 14970,
      estado: 'CREADO'
    },
    {
      id: 1002,
      cliente: 'Carlos Pérez',
      fecha: '2026-09-24',
      productos: [
        {
          nombre: 'Pizza pepperoni',
          cantidad: 1,
          precio: 9990
        }
      ],
      total: 9990,
      estado: 'ACEPTADO'
    },
    {
      id: 1003,
      cliente: 'Ana Martínez',
      fecha: '2026-09-24',
      productos: [
        {
          nombre: 'Hamburguesa doble',
          cantidad: 1,
          precio: 7990
        }
      ],
      total: 7990,
      estado: 'EN_PREPARACIÓN'
    },
    {
      id: 1004,
      cliente: 'Pedro Ramírez',
      fecha: '2026-09-23',
      productos: [
        {
          nombre: 'Pizza vegetariana',
          cantidad: 2,
          precio: 8990
        }
      ],
      total: 17980,
      estado: 'DESPACHADO'
    },
    {
      id: 1005,
      cliente: 'Sofía Torres',
      fecha: '2026-09-23',
      productos: [
        {
          nombre: 'Hamburguesa clásica',
          cantidad: 1,
          precio: 5990
        }
      ],
      total: 5990,
      estado: 'ENTREGADO'
    }
  ];


  // Productos disponibles para crear pedidos

  productosDisponibles = [
    { nombre: 'Hamburguesa clásica', precio: 5990 },
    { nombre: 'Pizza pepperoni', precio: 9990 },
    { nombre: 'Papas fritas', precio: 2990 },
    { nombre: 'Bebida Coca-Cola', precio: 1990 },
    { nombre: 'Hamburguesa doble', precio: 7990 },
    { nombre: 'Pizza vegetariana', precio: 8990 }
  ];


  // Filtros

  busqueda: string = '';

  estadoSeleccionado: string = '';

  estados: EstadoPedido[] = [
    'CREADO',
    'ACEPTADO',
    'EN_PREPARACIÓN',
    'DESPACHADO',
    'ENTREGADO',
    'CANCELADO'
  ];


  // Ventanas emergentes

  mostrarFormulario: boolean = false;

  mostrarDetalle: boolean = false;

  pedidoSeleccionado: Pedido | null = null;


  // Datos para crear un pedido

  nuevoPedido = {
    cliente: '',
    producto: '',
    cantidad: 1
  };


  // Pedidos que puede consultar el usuario

  get pedidosVisibles(): Pedido[] {

    if (!this.sesionCargada) {
      return [];
    }

    if (this.esCliente) {

      return this.pedidos.filter(
        pedido => pedido.propietarioId === this.propietarioId
      );

    }

    if (this.puedeGestionarEstados) {
      return this.pedidos;
    }

    return [];

  }


  // Filtrar los pedidos visibles

  get pedidosFiltrados(): Pedido[] {

    return this.pedidosVisibles.filter(pedido => {

      const coincideBusqueda =
        pedido.id.toString().includes(this.busqueda) ||
        pedido.cliente
          .toLowerCase()
          .includes(this.busqueda.toLowerCase());

      const coincideEstado =
        this.estadoSeleccionado === '' ||
        pedido.estado === this.estadoSeleccionado;

      return coincideBusqueda && coincideEstado;

    });

  }


  // Estadísticas según los pedidos visibles

  get totalPedidos(): number {
    return this.pedidosVisibles.length;
  }

  get pedidosPendientes(): number {

    return this.pedidosVisibles.filter(
      pedido =>
        pedido.estado === 'CREADO' ||
        pedido.estado === 'ACEPTADO'
    ).length;

  }

  get pedidosPreparacion(): number {

    return this.pedidosVisibles.filter(
      pedido => pedido.estado === 'EN_PREPARACIÓN'
    ).length;

  }

  get pedidosEntregados(): number {

    return this.pedidosVisibles.filter(
      pedido => pedido.estado === 'ENTREGADO'
    ).length;

  }


  // Formato visual del estado

  obtenerNombreEstado(estado: EstadoPedido): string {
    return estado.replaceAll('_', ' ');
  }


  // Abrir formulario

  abrirFormulario(): void {

    if (!this.sesionCargada || !this.rolUsuario) {
      return;
    }

    this.nuevoPedido = {
      cliente: this.nombreUsuario,
      producto: '',
      cantidad: 1
    };

    this.mostrarFormulario = true;

  }


  // Cerrar formulario

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }


  // Obtener producto seleccionado

  obtenerProductoSeleccionado() {

    return this.productosDisponibles.find(
      producto => producto.nombre === this.nuevoPedido.producto
    );

  }


  // Calcular total del nuevo pedido

  get totalNuevoPedido(): number {

    const producto = this.obtenerProductoSeleccionado();

    if (!producto) {
      return 0;
    }

    return producto.precio * this.nuevoPedido.cantidad;

  }


  // Crear pedido localmente

  crearPedido(): void {

    if (!this.sesionCargada || !this.rolUsuario) {
      return;
    }

    const producto = this.obtenerProductoSeleccionado();

    if (
      !producto ||
      !Number.isInteger(this.nuevoPedido.cantidad) ||
      this.nuevoPedido.cantidad <= 0
    ) {

      alert('Completa correctamente los datos del pedido.');

      return;

    }

    const nuevo: Pedido = {

      id: Math.max(1000, ...this.pedidos.map(p => p.id)) + 1,

      // El cliente se obtiene de la cuenta autenticada
      cliente: this.nombreUsuario,

      propietarioId: this.propietarioId,

      fecha: new Date().toISOString().split('T')[0],

      productos: [
        {
          nombre: producto.nombre,
          cantidad: this.nuevoPedido.cantidad,
          precio: producto.precio
        }
      ],

      total: this.totalNuevoPedido,

      estado: 'CREADO'

    };

    this.pedidos.unshift(nuevo);

    this.cerrarFormulario();

  }


  // Visualizar detalle de un pedido

  verDetalle(pedido: Pedido): void {

    if (!this.pedidosVisibles.includes(pedido)) {
      return;
    }

    this.pedidoSeleccionado = pedido;

    this.mostrarDetalle = true;

  }


  // Cerrar detalle

  cerrarDetalle(): void {

    this.mostrarDetalle = false;

    this.pedidoSeleccionado = null;

  }


  // Cambiar estado del pedido

  cambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): void {

    if (
      !this.puedeGestionarEstados ||
      !this.pedidosVisibles.includes(pedido)
    ) {
      return;
    }

    const transiciones = this.obtenerEstadosDisponibles(pedido);

    if (!transiciones.includes(nuevoEstado)) {

      alert('No se permite realizar este cambio de estado.');

      return;

    }

    pedido.estado = nuevoEstado;

  }


  // Obtener estados disponibles

  obtenerEstadosDisponibles(pedido: Pedido): EstadoPedido[] {

    if (!this.puedeGestionarEstados) {
      return [];
    }

    const transiciones: Record<EstadoPedido, EstadoPedido[]> = {

      'CREADO': ['ACEPTADO', 'CANCELADO'],

      'ACEPTADO': ['EN_PREPARACIÓN', 'CANCELADO'],

      'EN_PREPARACIÓN': ['DESPACHADO', 'CANCELADO'],

      'DESPACHADO': ['ENTREGADO'],

      'ENTREGADO': [],

      'CANCELADO': []

    };

    return transiciones[pedido.estado];

  }

}