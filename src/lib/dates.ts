import { TIMEZONE } from './constants';

/**
 * Formatea una fecha ISO a formato local legible (ej: 24/10/2026 15:30)
 */
export function formatLocalDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}
