/* =============================================
   firebaseConfig.js - Inicialización de Firebase
   Configuración del proyecto y exports de servicios.
   ============================================= */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

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

/** Instancia de Realtime Database */
export const db = getDatabase(app);

/** Instancia de Firebase Auth */
export const auth = getAuth(app);
