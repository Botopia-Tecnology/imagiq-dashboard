/**
 * Definiciones de tipos para Microsoft Clarity
 * @see https://learn.microsoft.com/en-us/clarity/
 */

interface Window {
  /**
   * Microsoft Clarity API
   * Esta función se inicializa cuando el script de Clarity se carga exitosamente
   */
  clarity?: {
    (method: string, ...args: string[]): void;
    q?: Array<[string, ...string[]]>;
  };
}
