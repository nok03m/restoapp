/**
 * @file api.js
 * @description Capa de acceso a datos — abstrae toda comunicación
 * con Supabase (PostgreSQL). El resto de la aplicación nunca
 * conoce los detalles del cliente ni del esquema de la BD.
 */

import { supabase } from './config.js';

/**
 * Obtiene la lista de platos desde la tabla `menu` de Supabase.
 *
 * @returns {Promise<Object>} Mapa id → { name, price }.
 * @throws {Error} Si la consulta falla.
 */
export async function fetchMenu() {
  const { data, error } = await supabase
    .from('menu')
    .select('id, name, price')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener el menú: ${error.message}`);
  }

  return normalizeMenuData(data);
}

/**
 * Crea un nuevo producto en la tabla `menu` de Supabase.
 *
 * @param {{ name: string, price: number }} product - Datos del producto.
 * @returns {Promise<Object>} Fila insertada con su id generado.
 * @throws {Error} Si la inserción falla.
 */
export async function createProduct(product) {
  const { data, error } = await supabase
    .from('menu')
    .insert({ name: product.name, price: product.price })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear el producto: ${error.message}`);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Normaliza el array de filas de Supabase al mapa uniforme id → { name, price }
 * que usa el resto de la aplicación.
 *
 * @param {Array<{ id: number, name: string, price: number }>|null} rows
 * @returns {Object} Mapa id → { name, price }.
 */
function normalizeMenuData(rows) {
  if (!rows || rows.length === 0) return {};

  return rows.reduce((acc, row) => {
    acc[row.id] = {
      name:  row.name  ?? `Plato ${row.id}`,
      price: Number(row.price) ?? 0,
    };
    return acc;
  }, {});
}
