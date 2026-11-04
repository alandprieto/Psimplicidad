import { TIMEZONE } from "./constants";

/**
 * Formatea una fecha ISO a formato local legible (ej: 24/10/2026 15:30)
 */
export function formatLocalDateTime(isoString: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function getTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function toDateKey(isoString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoString));
}

export function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export function formatMonthYear(year: number, month: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month, 1, 15, 0, 0)));
}

export function getInitialMonth(): { year: number; month: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value) - 1,
  };
}

export function getMonthGrid(year: number, month: number) {
  // base a mediodía local para evitar corrimientos por DST/timezone
  const baseUtc = Date.UTC(year, month, 1, 15, 0, 0);

  const firstWeekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(new Date(baseUtc));

  const weekdayIndex: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  const offset = weekdayIndex[firstWeekday] ?? 0;
  const start = baseUtc - offset * 86_400_000;

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start + i * 86_400_000);
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

    const [y, m, d] = key.split("-").map(Number);
    cells.push({
      key,
      day: d,
      inMonth: y === year && m - 1 === month,
      isToday: key === getTodayKey(),
    });
  }

  return cells;
}
