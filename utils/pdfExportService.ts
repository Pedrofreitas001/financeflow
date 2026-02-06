import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  selectedSections: string[];
  isDark: boolean;
  tabTitle: string;
  fileName: string;
  coverElementId?: string;
}

// Largura fixa de captura que mapeia bem para A4 (proporcional)
const CAPTURE_WIDTH = 900;
const FOOTER_RESERVE = 14; // mm reservados para footer

/**
 * Detecta se um elemento é um grid/flex com múltiplos filhos visíveis (2+ colunas).
 * Se sim, retornamos os filhos diretos para capturar individualmente.
 */
function getGridChildren(element: HTMLElement): HTMLElement[] | null {
  const style = window.getComputedStyle(element);
  const display = style.display;

  // Só separar grids/flex com mais de 1 filho visível
  if (display !== 'grid' && display !== 'flex') return null;

  const children = Array.from(element.children).filter(
    (c) => c instanceof HTMLElement && window.getComputedStyle(c).display !== 'none'
  ) as HTMLElement[];

  if (children.length < 2) return null;

  // Verificar se os filhos estão dispostos em colunas (lado a lado)
  if (children.length >= 2) {
    const firstRect = children[0].getBoundingClientRect();
    const secondRect = children[1].getBoundingClientRect();
    // Se o segundo filho começa à direita do primeiro = layout em colunas
    if (secondRect.left > firstRect.left + firstRect.width * 0.3) {
      return children;
    }
  }

  return null;
}

/**
 * Prepara um elemento para captura: ajusta legibilidade de textos SVG e legendas.
 */
function prepareForCapture(element: HTMLElement, isDark: boolean): () => void {
  const originals: { el: any; prop: string; value: string }[] = [];

  function store(el: any, prop: string, value: string) {
    originals.push({ el, prop, value });
  }

  // Textos SVG (eixos recharts)
  element.querySelectorAll<SVGTextElement>('svg text').forEach((text) => {
    const size = parseFloat(window.getComputedStyle(text).fontSize) || 12;
    if (size < 12) {
      store(text, '_fontSize', text.style.fontSize);
      text.style.fontSize = '12px';
    }
    const fill = text.getAttribute('fill');
    if (!fill || fill === '#666' || fill === '#999') {
      store(text, '_fill', fill || '');
      text.setAttribute('fill', isDark ? '#d1d5db' : '#374151');
    }
  });

  // Legendas recharts
  element.querySelectorAll<HTMLElement>('.recharts-legend-item-text').forEach((text) => {
    store(text, '_fontSize', text.style.fontSize);
    store(text, '_fontWeight', text.style.fontWeight);
    text.style.fontSize = '12px';
    text.style.fontWeight = '600';
  });

  // Linhas de grade
  element.querySelectorAll<SVGLineElement>('.recharts-cartesian-grid line').forEach((line) => {
    const stroke = line.getAttribute('stroke');
    if (stroke === '#333' || stroke === '#444') {
      store(line, '_stroke', stroke);
      line.setAttribute('stroke', isDark ? '#4b5563' : '#d1d5db');
    }
  });

  return () => {
    originals.forEach(({ el, prop, value }) => {
      if (prop === '_fill') el.setAttribute('fill', value);
      else if (prop === '_stroke') el.setAttribute('stroke', value);
      else if (prop === '_fontSize') el.style.fontSize = value;
      else if (prop === '_fontWeight') el.style.fontWeight = value;
    });
  };
}

/**
 * Captura um elemento HTML como imagem PNG via html2canvas.
 * Usa um wrapper temporário com largura fixa para garantir proporções consistentes.
 */
async function captureElement(
  element: HTMLElement,
  bgColor: string
): Promise<string> {
  // Salvar estilos originais
  const origWidth = element.style.width;
  const origMaxWidth = element.style.maxWidth;
  const origMinWidth = element.style.minWidth;
  const origPosition = element.style.position;
  const origLeft = element.style.left;
  const origBoxSizing = element.style.boxSizing;

  // Forçar largura fixa para captura consistente
  element.style.width = `${CAPTURE_WIDTH}px`;
  element.style.maxWidth = `${CAPTURE_WIDTH}px`;
  element.style.minWidth = `${CAPTURE_WIDTH}px`;
  element.style.boxSizing = 'border-box';

  // Aguardar relayout
  await new Promise((r) => setTimeout(r, 200));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: bgColor,
      useCORS: true,
      logging: false,
      width: CAPTURE_WIDTH,
      windowWidth: CAPTURE_WIDTH + 40,
    });
    return canvas.toDataURL('image/png');
  } finally {
    // Restaurar
    element.style.width = origWidth;
    element.style.maxWidth = origMaxWidth;
    element.style.minWidth = origMinWidth;
    element.style.position = origPosition;
    element.style.left = origLeft;
    element.style.boxSizing = origBoxSizing;
  }
}

/**
 * Adiciona uma imagem ao PDF com lógica de quebra de página.
 * Retorna a nova posição Y.
 */
function addImageToPdf(
  pdf: jsPDF,
  imgData: string,
  currentY: number,
  margin: number,
  innerWidth: number,
  pageHeight: number,
  fillColorRGB: [number, number, number],
  pageWidth: number
): number {
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * innerWidth) / imgProps.width;

  // Altura máxima disponível (descontando footer)
  const maxContentY = pageHeight - margin - FOOTER_RESERVE;

  // Se não cabe, nova página
  if (currentY + imgHeight > maxContentY) {
    pdf.addPage();
    pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    currentY = margin;
  }

  // Se a imagem sozinha é maior que uma página inteira, escalar para caber
  const availableHeight = maxContentY - currentY;
  if (imgHeight > availableHeight && currentY === margin) {
    // Escalar para caber na página
    const scale = availableHeight / imgHeight;
    const scaledWidth = innerWidth * scale;
    const scaledHeight = imgHeight * scale;
    const xOffset = margin + (innerWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, currentY, scaledWidth, scaledHeight);
    return currentY + scaledHeight + 6;
  }

  pdf.addImage(imgData, 'PNG', margin, currentY, innerWidth, imgHeight);
  return currentY + imgHeight + 6;
}

export async function generatePDF(options: ExportOptions): Promise<void> {
  const {
    selectedSections,
    isDark,
    tabTitle,
    fileName,
    coverElementId = 'pdf-cover',
  } = options;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const innerWidth = pageWidth - margin * 2;

  const bgColor = isDark ? '#111827' : '#f5f5f5';
  const fillColorRGB: [number, number, number] = isDark
    ? [17, 24, 39]
    : [245, 245, 245];

  // ─── Página 1: Capa ──────────────────────────────
  const coverElement = document.getElementById(coverElementId);
  if (coverElement) {
    const coverCanvas = await html2canvas(coverElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
    });
    const coverImg = coverCanvas.toDataURL('image/png');
    pdf.addImage(coverImg, 'PNG', 0, 0, pageWidth, pageHeight);
  }

  // ─── Página de conteúdo ──────────────────────────
  pdf.addPage();
  pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(isDark ? 255 : 30);
  pdf.text(tabTitle, margin, margin + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(isDark ? 160 : 100);
  pdf.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`,
    margin,
    margin + 12
  );

  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.8);
  pdf.line(margin, margin + 16, margin + 40, margin + 16);

  let currentY = margin + 22;

  // ─── Capturar cada seção ─────────────────────────
  for (const sectionId of selectedSections) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    // Verificar se é um grid com colunas lado a lado
    const gridChildren = getGridChildren(element);

    if (gridChildren && gridChildren.length >= 2) {
      // Capturar cada filho do grid individualmente (um por linha no PDF)
      for (const child of gridChildren) {
        const cleanup = prepareForCapture(child, isDark);
        await new Promise((r) => setTimeout(r, 50));

        try {
          const imgData = await captureElement(child, bgColor);
          currentY = addImageToPdf(
            pdf,
            imgData,
            currentY,
            margin,
            innerWidth,
            pageHeight,
            fillColorRGB,
            pageWidth
          );
        } finally {
          cleanup();
        }
      }
    } else {
      // Capturar o elemento inteiro
      const cleanup = prepareForCapture(element, isDark);
      await new Promise((r) => setTimeout(r, 50));

      try {
        const imgData = await captureElement(element, bgColor);
        currentY = addImageToPdf(
          pdf,
          imgData,
          currentY,
          margin,
          innerWidth,
          pageHeight,
          fillColorRGB,
          pageWidth
        );
      } finally {
        cleanup();
      }
    }
  }

  // ─── Footers ─────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(isDark ? 120 : 140);
    pdf.text(`FinanceFlow - ${tabTitle}`, margin, pageHeight - 6);
    pdf.text(
      `Página ${i - 1} de ${totalPages - 1}`,
      pageWidth - margin - 30,
      pageHeight - 6
    );
  }

  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`FinanceFlow_${fileName}_${timestamp}.pdf`);
}
