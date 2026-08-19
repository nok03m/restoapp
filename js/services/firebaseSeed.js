/* =============================================
   firebaseSeed.js - Script para sembrar datos
   iniciales en Firebase RTDB.

   Ejecutar una sola vez:
   node js/services/firebaseSeed.js

   Requiere: npm install firebase
   ============================================= */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyD4Ursyf0G0opw2U9DfkYN66ISmN2Mp4es",
  authDomain: "restoapp-b0fe0.firebaseapp.com",
  databaseURL: "https://restoapp-b0fe0-default-rtdb.firebaseio.com",
  projectId: "restoapp-b0fe0",
  storageBucket: "restoapp-b0fe0.firebasestorage.app",
  messagingSenderId: "778494703946",
  appId: "1:778494703946:web:3b5eaf7f1c846e4e2969b3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Datos iniciales ---

const PRODUCTOS = {
  "a1b2c3d4-0001-4000-8000-000000000001": {
    nombre: "Burger Clásica",
    descripcion: "Carne 200g, lechuga, tomate, salsa especial",
    precio: 12900,
    categoria: "burgers",
    imagen_url: null,
    disponible: true,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z"
  },
  "a1b2c3d4-0002-4000-8000-000000000002": {
    nombre: "Burger Doble Queso",
    descripcion: "Doble carne, doble queso cheddar, bacon crocante",
    precio: 17900,
    categoria: "burgers",
    imagen_url: null,
    disponible: true,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z"
  },
  "a1b2c3d4-0003-4000-8000-000000000003": {
    nombre: "Papas Fritas Deluxe",
    descripcion: "Con bacon, queso derretido y jalapeños",
    precio: 8500,
    categoria: "acompañamientos",
    imagen_url: null,
    disponible: true,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z"
  },
  "a1b2c3d4-0004-4000-8000-000000000004": {
    nombre: "Limonada Neon",
    descripcion: "Limonada natural con toque cyberpunk",
    precio: 4500,
    categoria: "bebidas",
    imagen_url: null,
    disponible: true,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z"
  },
  "a1b2c3d4-0005-4000-8000-000000000005": {
    nombre: "Helado de Vainilla",
    descripcion: "Helado artesanal de vainilla con topping de chocolate",
    precio: 5200,
    categoria: "postres",
    imagen_url: null,
    disponible: false,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z"
  },
  "a1b2c3d4-0006-4000-8000-000000000006": {
    nombre: "Pizza Margarita",
    descripcion: "Masa artesanal, mozzarella fresca, albahaca",
    precio: 22000,
    categoria: "pizzas",
    imagen_url: null,
    disponible: true,
    created_at: "2026-02-01T10:00:00.000Z",
    updated_at: "2026-02-01T10:00:00.000Z"
  }
};

const USUARIOS = {
  "admin-user-001": {
    nombre: "Admin Principal",
    email: "admin@restoapp.com",
    rol: "admin"
  },
  "mesero-user-001": {
    nombre: "Carlos Mesero",
    email: "mesero@restoapp.com",
    rol: "mesero"
  }
};

async function seed() {
  console.log("🌱 Sembrando datos en Firebase RTDB...\n");

  try {
    // Productos
    await set(ref(db, 'productos'), PRODUCTOS);
    const numProductos = Object.keys(PRODUCTOS).length;
    console.log(`  ✅ ${numProductos} productos creados`);

    // Usuarios (perfil - el auth se crea desde Firebase Console o desde la app)
    await set(ref(db, 'usuarios'), USUARIOS);
    const numUsuarios = Object.keys(USUARIOS).length;
    console.log(`  ✅ ${numUsuarios} perfiles de usuario creados`);

    // Estructura de nodos vacíos para pedidos y facturas
    await set(ref(db, 'pedidos'), null);
    await set(ref(db, 'detalles_pedido'), null);
    await set(ref(db, 'facturas'), null);
    console.log("  ✅ Nodos vacíos inicializados (pedidos, detalles, facturas)");

    console.log("\n🎉 ¡Base de datos sembrada exitosamente!");
    console.log("\n📋 Credenciales de prueba:");
    console.log("   admin@restoapp.com / admin123");
    console.log("   mesero@restoapp.com / mesero123");
    console.log("\n⚠️  Recuerda crear estos usuarios en Firebase Console > Authentication");

  } catch (error) {
    console.error("❌ Error sembrando datos:", error);
  }

  process.exit(0);
}

seed();
