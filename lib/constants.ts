export const MAX_CLIENTES = 40;
export const MAX_POR_SLOT = 4;
export const MAX_CLASES_SEMANA = 3;
export const PRECIO_GRUPAL = 1200;
export const PRECIO_INDIVIDUAL = 2500;

export const HORARIOS_DISPONIBLES: Record<string, { inicio: string; fin: string }[]> = {
  lunes:    [{ inicio: "11:30", fin: "17:00" }],
  martes:   [{ inicio: "09:30", fin: "17:00" }],
  miercoles:[{ inicio: "13:00", fin: "17:00" }],
  jueves:   [{ inicio: "13:00", fin: "17:00" }],
  viernes:  [{ inicio: "13:00", fin: "17:00" }],
  sabado:   [{ inicio: "09:00", fin: "15:00" }],
};

export const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];

export const DIAS_LABELS: Record<DiaSemana, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
};

export const TIPOS_COMIDA = ["desayuno", "colacion_m", "comida", "merienda", "cena"] as const;
export type TipoComida = typeof TIPOS_COMIDA[number];

export const TIPOS_COMIDA_LABELS: Record<TipoComida, string> = {
  desayuno: "Desayuno",
  colacion_m: "Colación",
  comida: "Comida",
  merienda: "Merienda",
  cena: "Cena",
};
