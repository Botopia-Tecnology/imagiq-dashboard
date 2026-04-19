/**
 * ISO 8583 Response Codes — the standard table that Visa, Mastercard,
 * Amex and most Colombian issuers (Bancolombia, Davivienda, BBVA, Itaú,
 * AV Villas, etc.) return when a card authorization is attempted.
 *
 * These codes travel through ePayco's gateway in `transaction.errorCode`
 * when the acquiring bank / network / issuer says no. Mapping them to
 * human-readable explanations — plus an operator hint — is a standard
 * practice adopted by payment analytics tools (Stripe's Radar, Adyen's
 * Dashboard, PayPal's IPN viewer) so first-line support can resolve a
 * rejection without decoding cryptic numbers.
 *
 * Sources cross-referenced when building this table:
 * - ISO 8583 Financial transaction card originated messages — Response codes table.
 * - ePayco public docs (status / errorCode conventions).
 * - Mastercard Authorization response codes reference.
 * - Visa Global Acquirer Services response codes.
 */

export interface Iso8583Entry {
  label: string;
  customerHint?: string;
  opsHint?: string;
  severity: 'info' | 'warning' | 'error';
}

export const ISO_8583_CODES: Record<string, Iso8583Entry> = {
  '00': {
    label: 'Aprobada',
    severity: 'info',
  },
  '01': {
    label: 'Contactar al banco emisor',
    customerHint:
      'El banco requiere que llames al teléfono del reverso de la tarjeta antes de aprobar la compra.',
    opsHint:
      'El banco quiere verificar manualmente con el tarjetahabiente — suele pasar en compras inusuales.',
    severity: 'warning',
  },
  '02': {
    label: 'Contactar al banco — condición especial',
    customerHint: 'El banco requiere una verificación adicional.',
    severity: 'warning',
  },
  '03': {
    label: 'Comercio inválido',
    opsHint:
      'El MID/merchant no está reconocido por el adquirente. Revisar configuración ePayco.',
    severity: 'error',
  },
  '04': {
    label: 'Retener tarjeta',
    opsHint:
      'El banco marcó la tarjeta para retención física (robo/fraude). Nunca reintentar.',
    severity: 'error',
  },
  '05': {
    label: 'Rechazo genérico',
    customerHint:
      'Tu banco rechazó la compra sin dar una razón específica. Contáctalos para saber por qué.',
    opsHint:
      'El más común. Causas frecuentes: riesgo antifraude, cupo, tarjeta no habilitada para e-commerce.',
    severity: 'error',
  },
  '06': {
    label: 'Error general',
    severity: 'error',
  },
  '07': {
    label: 'Retener tarjeta — condición especial',
    opsHint: 'Fraude confirmado por el emisor.',
    severity: 'error',
  },
  '12': {
    label: 'Transacción inválida',
    opsHint:
      'El banco considera la transacción mal formada. Revisar docType, amount, moneda.',
    severity: 'error',
  },
  '13': {
    label: 'Monto inválido',
    customerHint: 'El monto no es válido para tu tarjeta.',
    severity: 'error',
  },
  '14': {
    label: 'Número de tarjeta inválido',
    customerHint: 'Verifica el número, fecha y CVV.',
    severity: 'warning',
  },
  '15': {
    label: 'Emisor no existe',
    opsHint: 'El BIN no corresponde a ningún banco reconocido.',
    severity: 'error',
  },
  '30': {
    label: 'Error de formato',
    severity: 'error',
  },
  '41': {
    label: 'Tarjeta reportada como perdida',
    opsHint: 'Nunca reintentar. Cliente debe contactar al banco.',
    severity: 'error',
  },
  '43': {
    label: 'Tarjeta reportada como robada',
    opsHint: 'Nunca reintentar. Reportar como intento sospechoso.',
    severity: 'error',
  },
  '51': {
    label: 'Fondos insuficientes',
    customerHint:
      'Tu tarjeta no tiene cupo/saldo suficiente para cubrir la compra.',
    opsHint:
      'El cliente puede pagar con otra tarjeta, PSE, o dividir la compra.',
    severity: 'warning',
  },
  '54': {
    label: 'Tarjeta vencida',
    customerHint: 'La fecha de vencimiento de tu tarjeta ya pasó.',
    severity: 'warning',
  },
  '55': {
    label: 'PIN incorrecto',
    severity: 'warning',
  },
  '57': {
    label: 'Transacción no permitida al tarjetahabiente',
    customerHint:
      'Tu tarjeta no tiene habilitado este tipo de comercio (ej: compras en línea).',
    opsHint:
      'Muy común en Colombia: el cliente debe llamar al banco y habilitar "compras por internet" o "e-commerce".',
    severity: 'warning',
  },
  '58': {
    label: 'Transacción no permitida al terminal',
    severity: 'error',
  },
  '61': {
    label: 'Excede el límite de monto',
    customerHint:
      'El monto excede tu límite por transacción. Contacta a tu banco para subirlo o divide la compra.',
    severity: 'warning',
  },
  '62': {
    label: 'Tarjeta restringida',
    opsHint:
      'El banco emisor restringió uso (internacional/merchant específico).',
    severity: 'error',
  },
  '63': {
    label: 'Violación de seguridad',
    customerHint:
      'El banco detectó algo sospechoso o tu tarjeta no está autorizada para este comercio. Contacta al banco.',
    opsHint:
      'Frecuente cuando el banco emisor marca riesgo antifraude o cuando la tarjeta no tiene habilitado e-commerce. ePayco devuelve este código con el texto "ERROR NO PARAMETRIZADO".',
    severity: 'error',
  },
  '65': {
    label: 'Excede frecuencia de retiros',
    severity: 'warning',
  },
  '75': {
    label: 'Demasiados intentos de PIN',
    severity: 'warning',
  },
  '91': {
    label: 'Emisor o switch inoperativo',
    customerHint:
      'El banco emisor no está respondiendo en este momento. Intenta de nuevo más tarde.',
    opsHint:
      'Problema temporal del banco, no del cliente ni del comercio. Retry razonable después de algunos minutos.',
    severity: 'warning',
  },
  '92': {
    label: 'Institución financiera no encontrada',
    severity: 'error',
  },
  '94': {
    label: 'Transmisión duplicada',
    severity: 'warning',
  },
  '96': {
    label: 'Falla del sistema',
    severity: 'error',
  },
  N0: {
    label: 'Adquirente ocupado',
    severity: 'warning',
  },
};

/**
 * ePayco gateway-level status codes (before the bank even sees the request).
 * These come from `transaction.codeResponse` / `transaction.codTransactionState`.
 */
export const EPAYCO_RESPONSE_CODES: Record<number, string> = {
  1: 'Aceptada',
  2: 'Rechazada',
  3: 'Pendiente',
  4: 'Fallida',
  6: 'Revertida',
  7: 'Retenida',
  8: 'Iniciada',
  9: 'Expirada',
  10: 'Abandonada',
  11: 'Cancelada',
};

/**
 * Maps a bank ISO 8583 code (string like "63") to its explanation. Returns
 * `null` if we don't have a mapping yet — UI should still show the raw
 * code so ops can look it up externally.
 */
export function lookupIso8583(code: string | number | null | undefined): Iso8583Entry | null {
  if (code === null || code === undefined) return null;
  const key = String(code).trim().toUpperCase().padStart(2, '0');
  return ISO_8583_CODES[key] ?? null;
}
