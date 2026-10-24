import { CURRENCY } from './constants';

/**
 * Convierte un monto en centavos a formato de moneda local (ej: 4500000 -> $ 45.000,00)
 */
export function formatARS(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: CURRENCY,
  }).format(cents / 100);
}

/**
 * Convierte un valor ingresado en pesos (ej: 45000.50) a centavos enteros para la base de datos
 */
export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

/**
 * Convierte centavos a pesos decimales para mostrar en inputs de formularios
 */
export function centsToPesos(cents: number): number {
  return cents / 100;
}
