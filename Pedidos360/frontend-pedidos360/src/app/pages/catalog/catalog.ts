import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {

  // Productos de ejemplo para desarrollar la interfaz

  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Hamburguesa clásica',
      categoria: 'Hamburguesas',
      precio: 5990,
      stock: 20,
      descripcion: 'Hamburguesa de carne con queso, lechuga y tomate.'
    },
    {
      id: 2,
      nombre: 'Pizza pepperoni',
      categoria: 'Pizzas',
      precio: 9990,
      stock: 15,
      descripcion: 'Pizza familiar con queso mozzarella y pepperoni.'
    },
    {
      id: 3,
      nombre: 'Papas fritas',
      categoria: 'Acompañamientos',
      precio: 2990,
      stock: 25,
      descripcion: 'Porción de papas fritas.'
    },
    {
      id: 4,
      nombre: 'Bebida Coca-Cola',
      categoria: 'Bebidas',
      precio: 1990,
      stock: 30,
      descripcion: 'Bebida de 350 ml.'
    },
    {
      id: 5,
      nombre: 'Hamburguesa doble',
      categoria: 'Hamburguesas',
      precio: 7990,
      stock: 10,
      descripcion: 'Hamburguesa doble con queso y salsa especial.'
    },
    {
      id: 6,
      nombre: 'Pizza vegetariana',
      categoria: 'Pizzas',
      precio: 8990,
      stock: 0,
      descripcion: 'Pizza con verduras frescas y queso mozzarella.'
    }
  ];

  // Búsqueda y filtros

  busqueda: string = '';

  categoriaSeleccionada: string = '';

  categorias: string[] = [
    'Hamburguesas',
    'Pizzas',
    'Acompañamientos',
    'Bebidas'
  ];

  // Control del formulario

  mostrarFormulario: boolean = false;

  modoEdicion: boolean = false;

  productoActual: Producto = this.crearProductoVacio();


  // Obtener productos según los filtros

  get productosFiltrados(): Producto[] {

    return this.productos.filter(producto => {

      const coincideNombre = producto.nombre
        .toLowerCase()
        .includes(this.busqueda.toLowerCase());

      const coincideCategoria =
        this.categoriaSeleccionada === '' ||
        producto.categoria === this.categoriaSeleccionada;

      return coincideNombre && coincideCategoria;

    });

  }


  // Estadísticas

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosDisponibles(): number {
    return this.productos.filter(producto => producto.stock > 0).length;
  }

  get productosSinStock(): number {
    return this.productos.filter(producto => producto.stock === 0).length;
  }


  // Crear objeto vacío

  crearProductoVacio(): Producto {

    return {
      id: 0,
      nombre: '',
      categoria: '',
      precio: 0,
      stock: 0,
      descripcion: ''
    };

  }


  // Abrir formulario para agregar producto

  abrirFormulario(): void {

    this.modoEdicion = false;

    this.productoActual = this.crearProductoVacio();

    this.mostrarFormulario = true;

  }


  // Abrir formulario para editar producto

  editarProducto(producto: Producto): void {

    this.modoEdicion = true;

    this.productoActual = { ...producto };

    this.mostrarFormulario = true;

  }


  // Cerrar formulario

  cerrarFormulario(): void {

    this.mostrarFormulario = false;

  }


  // Guardar producto localmente

  guardarProducto(): void {

    if (
      !this.productoActual.nombre.trim() ||
      !this.productoActual.categoria ||
      !Number.isFinite(this.productoActual.precio) ||
      !Number.isFinite(this.productoActual.stock) ||
      this.productoActual.precio <= 0 ||
      this.productoActual.stock < 0 ||
      !Number.isInteger(this.productoActual.stock)
    ) {
      alert('Completa correctamente los datos del producto.');
      return;
    }

    if (this.modoEdicion) {

      const indice = this.productos.findIndex(
        producto => producto.id === this.productoActual.id
      );

      if (indice !== -1) {
        this.productos[indice] = { ...this.productoActual };
      }

    } else {

      const nuevoProducto: Producto = {
        ...this.productoActual,
        id: Math.max(0, ...this.productos.map(p => p.id)) + 1
      };

      this.productos.push(nuevoProducto);

    }

    this.cerrarFormulario();

  }


  // Eliminar producto localmente

  eliminarProducto(producto: Producto): void {

    const confirmar = confirm(
      `¿Estás segura de eliminar "${producto.nombre}"?`
    );

    if (confirmar) {

      this.productos = this.productos.filter(
        item => item.id !== producto.id
      );

    }

  }

}