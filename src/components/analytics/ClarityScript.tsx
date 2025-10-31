'use client';

import { useEffect, useState } from 'react';

/**
 * Componente que carga Microsoft Clarity para Dashboard de forma first-party
 *
 * Características:
 * - No requiere variables de entorno en el frontend con el Project ID
 * - El Project ID (tyhz2nqa8c) reside únicamente en el backend
 * - Soporta consentimiento a través del header x-analytics-consent
 * - Implementación first-party para evitar ad-blockers
 * - Previene múltiples inicializaciones
 *
 * @returns {null} Este componente no renderiza nada en el DOM
 *
 * @example
 * ```tsx
 * // En tu RootLayout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ClarityScript />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export default function ClarityScript(): null {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    if (window.clarity) {
      console.debug('[Clarity Dashboard] Already initialized');
      return;
    }

    const apiUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const clarityUrl: string = `${apiUrl}/api/custommer/analytics/clarity-dashboard.js`;

    const existingScript: Element | null = document.querySelector(
      `script[src="${clarityUrl}"]`
    );

    if (existingScript) {
      console.debug('[Clarity Dashboard] Script already exists in DOM');
      return;
    }

    const script: HTMLScriptElement = document.createElement('script');
    script.src = clarityUrl;
    script.async = true;
    script.id = 'clarity-dashboard-bootstrap';

    script.onload = (): void => {
      console.debug('[Clarity Dashboard] Script loaded successfully');
      if (window.clarity) {
        console.debug('[Clarity Dashboard] window.clarity is now available');
      }
    };

    script.onerror = (): void => {
      console.warn(
        '[Clarity Dashboard] Failed to load from backend. Ensure the API is running at:',
        apiUrl
      );
    };

    document.head.appendChild(script);

    return (): void => {
      const scriptToRemove: HTMLElement | null = document.getElementById('clarity-dashboard-bootstrap');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [mounted]);

  return null;
}
