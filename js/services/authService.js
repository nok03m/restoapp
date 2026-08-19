/* =============================================
   authService.js - Servicio de autenticación
   Usa Firebase Authentication (email/password).
   Almacena sesión en sessionStorage para
   persistir entre recargas de página.
   ============================================= */

import { auth } from './firebaseConfig.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { get, ref } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { db } from './firebaseConfig.js';

const SESSION_KEY = 'restoapp_session';

/**
 * Inicia sesión con email y password usando Firebase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Buscar datos del perfil en RTDB (nodo usuarios/{uid})
    let perfil = { nombre: firebaseUser.email, rol: 'admin' };
    try {
      const snap = await get(ref(db, `usuarios/${firebaseUser.uid}`));
      if (snap.exists()) {
        perfil = snap.val();
      }
    } catch {
      // Si no existe nodo de perfil, usar datos de Firebase Auth
    }

    const session = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      nombre: perfil.nombre || firebaseUser.email,
      rol: perfil.rol || 'admin',
      loginAt: new Date().toISOString(),
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  } catch (error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/too-many-requests': 'Demasiados intentos. Espere un momento.',
      'auth/invalid-credential': 'Credenciales inválidas',
    };
    const msg = errorMessages[error.code] || 'Error al iniciar sesión';
    return { success: false, error: msg };
  }
}

/**
 * Cierra la sesión actual en Firebase y limpia sessionStorage.
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch {
    // Continuar aunque falle el signOut de Firebase
  }
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Obtiene la sesión activa desde sessionStorage.
 * @returns {object|null}
 */
export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Verifica si hay una sesión activa.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getSession() !== null;
}

/**
 * Verifica si el usuario actual tiene un rol específico.
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(role) {
  const session = getSession();
  return session && session.rol === role;
}

/**
 * Escucha cambios de estado de autenticación de Firebase.
 * Útil para mantener la sesión sincronizada.
 * @param {function} callback
 * @returns {function}.unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      sessionStorage.removeItem(SESSION_KEY);
    }
    callback(firebaseUser);
  });
}
