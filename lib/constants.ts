export const MAX_CLIENTES = 100;
export const MAX_POR_SLOT = 15;
export const MAX_CLASES_SEMANA = 7;
export const PRECIO_MEMBRESIA = 700;
// Mantenidos por compatibilidad con código antiguo (dietas/progreso/mensajes deshabilitados)
export const PRECIO_GRUPAL = 700;
export const PRECIO_INDIVIDUAL = 700;

// Horarios fijos del box (mismos cada día Lun-Vie)
export const HORARIOS_BOX = [
  { inicio: "06:00", fin: "07:00" },
  { inicio: "07:00", fin: "08:00" },
  { inicio: "08:00", fin: "09:00" },
  { inicio: "17:00", fin: "18:00" },
  { inicio: "18:00", fin: "19:00" },
  { inicio: "19:00", fin: "20:00" },
  { inicio: "20:00", fin: "21:00" },
] as const;

export const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];

export const DIAS_LABELS: Record<DiaSemana, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
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
