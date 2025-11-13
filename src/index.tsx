// @ts-nocheck
/**
 * React Application Entry Point
 * Carga configuración de runtime ANTES de inicializar la app
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeConfig } from './config/runtime-config';
import { initGraphQLClient } from './data/repositories/graphql-client';
import App from './presentation/App';
import './styles/globals.css';

/**
 * Inicializar aplicación
 * Primero carga la configuración de runtime (Docker), luego renderiza la app
 */
async function bootstrap() {
  try {
    // Cargar configuración desde Docker o variables de build
    await initializeConfig();

    // Inicializar cliente GraphQL con la configuración cargada
    initGraphQLClient();

    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('❌ Error al inicializar aplicación:', error);

    // Mostrar error en la pantalla
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );

    root.render(
      <div style={{ color: 'red', padding: '20px' }}>
        <h1>Error al cargar configuración</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}

// Iniciar la app
bootstrap();
