import { jsPDF } from "jspdf";
import { resolveTicketTemplate, type TicketTemplateInfo } from "@/lib/ticket-templates";

export interface TicketPdfData {
  ticketNumber: string;
  attendeeName?: string;
  ticketTypeName?: string;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  qrDataUrl?: string;
  templateIndex?: number;
}

/**
 * Carga una imagen de URL como Base64 Data URL en el navegador.
 */
async function loadImageDataUrl(src: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("No se pudo cargar la imagen del template para el PDF:", err);
    return null;
  }
}

/**
 * Genera y descarga un PDF estilizado de alta calidad con la plantilla de circo oficial
 * e integrando el código QR en armonía con el tono pergamino del boleto.
 */
export async function downloadTicketPdf(data: TicketPdfData) {
  const template = resolveTicketTemplate({
    templateIndex: data.templateIndex,
    ticketNumber: data.ticketNumber,
  });

  // Intentar cargar la ilustración del boleto de circo
  const templateImageData = await loadImageDataUrl(template.path);

  // Si se pudo cargar la imagen del template, generar PDF con el boleto original troquelado
  if (templateImageData) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [105, 194],
    });

    const primaryDark = [6, 4, 8];
    const colorCream = [244, 235, 208];
    const textMuted = [160, 160, 170];

    // Fondo escénico oscuro
    doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.rect(0, 0, 105, 194, "F");

    // Header superior discreto (usando guion y bullet estándar para evitar símbolos alterados)
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(colorCream[0], colorCream[1], colorCream[2]);
    doc.text("CIRCO DEL TERROR THERAVIT360  •  31 OCTUBRE 2026", 52.5, 5.5, { align: "center" });

    // Dimensiones y posición del boleto
    const ticketW = 96;
    const ticketH = ticketW / template.aspectRatio; // ~165-168mm
    const ticketX = (105 - ticketW) / 2; // 4.5mm
    const ticketY = 8;

    // Estampar la plantilla de circo
    doc.addImage(templateImageData, "PNG", ticketX, ticketY, ticketW, ticketH);

    // Estampar el código QR exactamente dentro de los corchetes con el tono pergamino del boleto
    if (data.qrDataUrl) {
      const boxCenterX = ticketX + ticketW * (template.centerXPercent / 100);
      const boxCenterY = ticketY + ticketH * (template.centerYPercent / 100);
      // Tamaño calibrado para descansar holgadamente dentro de los corchetes
      const qrSize = ticketW * (template.sizePercentWidth / 100); // ~23.5mm

      const qrX = boxCenterX - qrSize / 2;
      const qrY = boxCenterY - qrSize / 2;

      // Fondo a tono con el pergamino envejecido del boleto
      const hex = (template.parchmentColor || "#d29f68").replace("#", "");
      const pr = parseInt(hex.substring(0, 2), 16) || 210;
      const pg = parseInt(hex.substring(2, 4), 16) || 159;
      const pb = parseInt(hex.substring(4, 6), 16) || 104;

      doc.setFillColor(pr, pg, pb);
      doc.roundedRect(qrX, qrY, qrSize, qrSize, 0.6, 0.6, "F");
      doc.addImage(data.qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    }

    // Pie de acreditación inferior
    const footerY = ticketY + ticketH + 3.5;
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(colorCream[0], colorCream[1], colorCream[2]);
    doc.text(
      `BOLETO: ${data.ticketNumber}  •  ${(data.attendeeName || "INVITADO GENERAL").toUpperCase()}`,
      52.5,
      footerY,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `${data.eventLocation || "Theravit 360°"} • Presenta este pase digital o impreso en la entrada`,
      52.5,
      footerY + 4,
      { align: "center" }
    );

    doc.save(`Boleto_${data.ticketNumber || "pase"}.pdf`);
    return;
  }

  // Fallback: Si por alguna razón la imagen externa no carga, usar el diseño vectorial vintage
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [110, 175],
  });

  const primaryDark = [8, 6, 10];
  const cardDark = [20, 10, 14];
  const accentRed = [185, 28, 28];
  const accentCrimson = [220, 38, 38];
  const colorCream = [244, 235, 208];
  const textWhite = [255, 255, 255];
  const textMuted = [161, 161, 170];

  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 110, 175, "F");

  doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
  doc.roundedRect(6, 6, 98, 163, 4, 4, "F");

  doc.setDrawColor(accentRed[0], accentRed[1], accentRed[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(6, 6, 98, 163, 4, 4, "S");

  doc.setDrawColor(accentCrimson[0], accentCrimson[1], accentCrimson[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(7.5, 7.5, 95, 160, 3, 3, "S");

  doc.setFillColor(42, 14, 20);
  doc.rect(6, 6, 98, 22, "F");
  doc.setDrawColor(accentRed[0], accentRed[1], accentRed[2]);
  doc.line(6, 28, 104, 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colorCream[0], colorCream[1], colorCream[2]);
  doc.text("PASE DIGITAL OFICIAL", 55, 13, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text(data.eventName || "HALLOWEEN THERAVIT360 2026", 55, 20, { align: "center" });

  doc.setFillColor(colorCream[0], colorCream[1], colorCream[2]);
  doc.roundedRect(25, 32, 60, 8, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("courier", "bold");
  doc.setTextColor(accentRed[0], accentRed[1], accentRed[2]);
  doc.text(`BOLETO: ${data.ticketNumber}`, 55, 37.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(colorCream[0], colorCream[1], colorCream[2]);
  doc.text(data.attendeeName || "Invitado General", 55, 47, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(accentCrimson[0], accentCrimson[1], accentCrimson[2]);
  doc.text(data.ticketTypeName || "GENERAL PASS", 55, 52, { align: "center" });

  // Recuadro pergamino suave para el QR
  doc.setFillColor(210, 159, 104);
  doc.roundedRect(26, 56, 58, 58, 3, 3, "F");

  if (data.qrDataUrl) {
    try {
      doc.addImage(data.qrDataUrl, "PNG", 28, 58, 54, 54);
    } catch (err) {
      console.error("Error al renderizar QR en PDF:", err);
    }
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(colorCream[0], colorCream[1], colorCream[2]);
  doc.text("PRESENTA ESTE QR EN PUERTA", 55, 120, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(accentCrimson[0], accentCrimson[1], accentCrimson[2]);
  doc.text("FECHA & HORA", 55, 128, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text(`${data.eventDate || "31 Octubre 2026"} • ${data.eventTime || "20:00 hrs"}`, 55, 133, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(accentCrimson[0], accentCrimson[1], accentCrimson[2]);
  doc.text("LUGAR", 55, 140, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text(data.eventLocation || "Theravit 360°", 55, 145, { align: "center" });

  doc.setDrawColor(accentRed[0], accentRed[1], accentRed[2]);
  doc.line(16, 150, 94, 150);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Pase digital oficial e intransferible. Válido para 1 solo acceso.", 55, 155, {
    align: "center",
  });
  doc.text("Al escanearse se invalidará automáticamente en el sistema.", 55, 159, {
    align: "center",
  });

  const filename = `Boleto_${data.ticketNumber || "pase"}.pdf`;
  doc.save(filename);
}

/**
 * Genera y descarga el boleto como imagen PNG de alta definición con el QR integrado al pergamino.
 */
export async function downloadTicketImage(data: TicketPdfData): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const template = resolveTicketTemplate({
    templateIndex: data.templateIndex,
    ticketNumber: data.ticketNumber,
  });

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; // Alta resolución
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (data.qrDataUrl) {
        const qrImg = new Image();
        qrImg.onload = () => {
          const qrCenterX = canvas.width * (template.centerXPercent / 100);
          const qrCenterY = canvas.height * (template.centerYPercent / 100);
          const qrSize = canvas.width * (template.sizePercentWidth / 100);
          const finalX = qrCenterX - qrSize / 2;
          const finalY = qrCenterY - qrSize / 2;

          // Fondo a tono con el pergamino
          ctx.fillStyle = template.parchmentColor || "#d29f68";
          ctx.beginPath();
          ctx.roundRect(finalX, finalY, qrSize, qrSize, 4);
          ctx.fill();

          ctx.drawImage(qrImg, finalX, finalY, qrSize, qrSize);

          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(false);
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Boleto_${data.ticketNumber || "pase"}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve(true);
          }, "image/png");
        };
        qrImg.onerror = () => resolve(false);
        qrImg.src = data.qrDataUrl;
      } else {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = template.path;
  });
}
