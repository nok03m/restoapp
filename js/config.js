/**
 * @file config.js
 * @description Configuración centralizada de la aplicación.
 * Exporta el cliente Supabase singleton y constantes globales.
 *
 * Las credenciales de Supabase se leen de js/env.js (en .gitignore).
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env.js';

/**
 * Cliente Supabase singleton.
 * Usar este objeto en toda la aplicación — nunca crear instancias adicionales.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Tasa de IVA aplicada a los pedidos (19 %). */
export const TAX_RATE = 0.19;

/** Clave usada en sessionStorage para almacenar el estado de sesión. */
export const SESSION_KEY = 'restoapp_session';
