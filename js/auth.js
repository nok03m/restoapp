/**
 * @file auth.js
 * @description Módulo de autenticación usando Supabase Auth.
 * Gestiona el ciclo de vida de la sesión (sign-in, sign-out, verificación).
 *
 * Supabase gestiona la sesión internamente en localStorage de forma segura;
 * no almacenamos tokens manualmente.
 */

import { supabase } from './config.js';

/**
 * Intenta autenticar al usuario con email y contraseña via Supabase Auth.
 *
 * @param {string} email    - Correo electrónico del usuario.
 * @param {string} password - Contraseña.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function login(email, password) {
  const trimmedEmail = email.trim();
  const trimmedPass  = password.trim();

  if (!trimmedEmail || !trimmedPass) {
    return { success: false, message: 'Completa todos los campos.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email:    trimmedEmail,
    password: trimmedPass,
  });

  if (error) {
    // Mensaje amigable en español según el tipo de error
    const message = error.message.includes('Invalid login credentials')
      ? 'Email o contraseña incorrectos.'
      : `Error de autenticación: ${error.message}`;
    return { success: false, message };
  }

  return { success: true, message: 'Autenticación exitosa.' };
}

/**
 * Cierra la sesión actual en Supabase.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  await supabase.auth.signOut();
}

/**
 * Indica si hay una sesión activa en Supabase.
 *
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}

/**
 * Protege una página: si no hay sesión activa, redirige al login.
 * Llamar con await al inicio de cualquier página protegida.
 *
 * @param {string} [redirectTo='login.html'] - Ruta de redirección.
 * @returns {Promise<void>}
 */
export async function requireAuth(redirectTo = 'login.html') {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = redirectTo;
  }
}
