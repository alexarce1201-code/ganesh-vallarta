/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of the current week.
 */
export function getSemanaInicio(): string {
  const d    = new Date();
  const day  = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // shift to Monday
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

/**
 * Returns the ISO date string for the Monday that is `weeksAhead` weeks from now.
 */
export function getSemanaInicioOffset(weeksAhead: number): string {
  const d    = new Date();
  const day  = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff + weeksAhead * 7);
  return monday.toISOString().split("T")[0];
}

const DIA_MAP: Record<string, string> = {
  lunes:     "Lun",
  martes:    "Mar",
  miercoles: "Mié",
  jueves:    "Jue",
  viernes:   "Vie",
  sabado:    "Sáb",
};

export function getDiaNombre(dia: string): string {
  return DIA_MAP[dia] ?? dia;
}

const DIA_ORDER: Record<string, number> = {
  lunes: 0, martes: 1, miercoles: 2, jueves: 3, viernes: 4, sabado: 5,
};

export function getDiaOrder(dia: string): number {
  return DIA_ORDER[dia] ?? 99;
}

/** All weekday keys in order */
export const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];
