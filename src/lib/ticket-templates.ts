/**
 * Módulo de Plantillas Coleccionables de Boletos - HALLOWEEN THERAVIT360 VOL. 4
 * Gestiona las 7 ilustraciones vintage de circo con selección aleatoria y
 * posicionamiento exacto del código QR en el área de escaneo.
 */

export interface TicketTemplateInfo {
  id: number;
  name: string;
  character: string;
  filename: string;
  path: string;
  aspectRatio: number; // width / height
  parchmentColor: string; // Tono de color pergamino medido para el fondo del QR
  centerXPercent: number; // Centro horizontal del recuadro de QR
  centerYPercent: number; // Centro vertical del recuadro de QR
  sizePercentWidth: number; // Ancho del QR respecto al ancho del boleto (sitúa el QR dentro de los corchetes)
  qrBox: {
    topPercent: number;
    leftPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
}

export const TICKET_TEMPLATES: Record<number, TicketTemplateInfo> = {
  1: {
    id: 1,
    name: "El Maestro de Ceremonias",
    character: "Payaso Diabólico",
    filename: "template-1.png",
    path: "/tickets/template-1.png",
    aspectRatio: 256 / 448,
    parchmentColor: "#d29e66",
    centerXPercent: 51.76,
    centerYPercent: 81.03,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 34.77,
      topPercent: 72.10,
      widthPercent: 33.98,
      heightPercent: 17.86,
    },
  },
  2: {
    id: 2,
    name: "La Arlequín Siniestra",
    character: "Arlequín Gótica",
    filename: "template-2.png",
    path: "/tickets/template-2.png",
    aspectRatio: 250 / 448,
    parchmentColor: "#d5a169",
    centerXPercent: 49.80,
    centerYPercent: 81.03,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 32.80,
      topPercent: 72.10,
      widthPercent: 34.00,
      heightPercent: 17.86,
    },
  },
  3: {
    id: 3,
    name: "El Bufón Macabro",
    character: "Bufón Carmesí",
    filename: "template-3.png",
    path: "/tickets/template-3.png",
    aspectRatio: 259 / 447,
    parchmentColor: "#d39f68",
    centerXPercent: 50.39,
    centerYPercent: 80.65,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 33.98,
      topPercent: 72.48,
      widthPercent: 32.82,
      heightPercent: 16.33,
    },
  },
  4: {
    id: 4,
    name: "La Bestia Imperial",
    character: "Elefante Espectral",
    filename: "template-4.png",
    path: "/tickets/template-4.png",
    aspectRatio: 261 / 449,
    parchmentColor: "#d8a56d",
    centerXPercent: 49.81,
    centerYPercent: 81.07,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 33.33,
      topPercent: 72.16,
      widthPercent: 32.95,
      heightPercent: 17.82,
    },
  },
  5: {
    id: 5,
    name: "La Trapecista del Abismo",
    character: "Acróbata Maldita",
    filename: "template-5.png",
    path: "/tickets/template-5.png",
    aspectRatio: 252 / 426,
    parchmentColor: "#d29f67",
    centerXPercent: 50.40,
    centerYPercent: 80.52,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 33.33,
      topPercent: 71.13,
      widthPercent: 34.13,
      heightPercent: 18.78,
    },
  },
  6: {
    id: 6,
    name: "El Corcel Fantasma",
    character: "Corcel de Sangre",
    filename: "template-6.png",
    path: "/tickets/template-6.png",
    aspectRatio: 253 / 423,
    parchmentColor: "#cf9c67",
    centerXPercent: 50.40,
    centerYPercent: 80.38,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 33.60,
      topPercent: 70.92,
      widthPercent: 33.60,
      heightPercent: 18.91,
    },
  },
  7: {
    id: 7,
    name: "La Gran Carpa de Medianoche",
    character: "Rueda & Carpa Espectral",
    filename: "template-7.png",
    path: "/tickets/template-7.png",
    aspectRatio: 245 / 416,
    parchmentColor: "#d2a06b",
    centerXPercent: 50.20,
    centerYPercent: 81.25,
    sizePercentWidth: 24.5,
    qrBox: {
      leftPercent: 33.06,
      topPercent: 72.60,
      widthPercent: 34.29,
      heightPercent: 17.31,
    },
  },
};

export const TOTAL_TEMPLATES = 7;

/**
 * Retorna un identificador de plantilla aleatorio entre 1 y 7.
 */
export function getRandomTemplateIndex(): number {
  return Math.floor(Math.random() * TOTAL_TEMPLATES) + 1;
}

/**
 * Resuelve la plantilla de un boleto.
 * Si ya tiene un `templateIndex` válido (1-7), lo usa.
 * Si no (ej. boletos antiguos o sin columna), calcula un índice determinista
 * usando un hash del `ticketNumber` o `secureToken` para que siempre sea consistente.
 */
export function resolveTicketTemplate(ticket: {
  templateIndex?: number | string | null;
  ticketNumber?: string;
  secureToken?: string;
  ticketId?: string;
  id?: string | number;
  name?: string;
}): TicketTemplateInfo {
  const parsedIndex = Number(ticket.templateIndex);
  if (!isNaN(parsedIndex) && parsedIndex >= 1 && parsedIndex <= TOTAL_TEMPLATES) {
    return TICKET_TEMPLATES[parsedIndex];
  }

  const seed = ticket.ticketNumber || ticket.secureToken || ticket.ticketId || "1";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % TOTAL_TEMPLATES;
  }
  const fallbackIndex = (Math.abs(hash) % TOTAL_TEMPLATES) + 1;
  return TICKET_TEMPLATES[fallbackIndex];
}
