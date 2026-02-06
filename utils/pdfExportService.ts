import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  selectedSections: string[];
  isDark: boolean;
  tabTitle: string;
  fileName: string;
  coverElementId?: string;
}

/**
 * Prepara elementos de gráfico para captura em PDF:
 * - Aumenta tamanho de fontes em eixos, legendas e tooltips
 * - Garante que as cores fiquem visíveis no PDF
 * Retorna uma função de cleanup para reverter as mudanças.
 */
function prepareChartsForCapture(element: HTMLElement, isDark: boolean): () => void {
  const originals: { el: HTMLElement; prop: string; value: string }[] = [];

  function setAndStore(el: HTMLElement, prop: string, value: string) {
    originals.push({ el, prop, value: (el.style as any)[prop] });
    (el.style as any)[prop] = value;
  }

  // Aumentar texto de eixos SVG (ticks)
  const svgTexts = element.querySelectorAll<SVGTextElement>('svg text');
  svgTexts.forEach(text => {
    const currentSize = parseFloat(window.getComputedStyle(text).fontSize) || 12;
    if (currentSize < 13) {
      setAndStore(text as any, 'fontSize', '13px');
    }
    // Garantir cor visível
    const fill = text.getAttribute('fill');
    if (!fill || fill === '#666' || fill === '#999' || fill === 'rgba(0,0,0,0)') {
      originals.push({ el: text as any, prop: '_fill', value: fill || '' });
      text.setAttribute('fill', isDark ? '#d1d5db' : '#374151');
    }
  });

  // Aumentar texto de legendas recharts
  const legendTexts = element.querySelectorAll<HTMLElement>('.recharts-legend-item-text');
  legendTexts.forEach(text => {
    setAndStore(text, 'fontSize', '13px');
    setAndStore(text, 'fontWeight', '600');
  });

  // Garantir linhas de grade visíveis
  const gridLines = element.querySelectorAll<SVGLineElement>('.recharts-cartesian-grid line');
  gridLines.forEach(line => {
    const stroke = line.getAttribute('stroke');
    if (stroke === '#333' || stroke === '#444') {
      originals.push({ el: line as any, prop: '_stroke', value: stroke });
      line.setAttribute('stroke', isDark ? '#4b5563' : '#d1d5db');
    }
  });

  return () => {
    originals.forEach(({ el, prop, value }) => {
      if (prop === '_fill') {
        (el as any).setAttribute('fill', value);
      } else if (prop === '_stroke') {
        (el as any).setAttribute('stroke', value);
      } else {
        (el.style as any)[prop] = value;
      }
    });
  };
}

export async function generatePDF(options: ExportOptions): Promise<void> {
  const { selectedSections, isDark, tabTitle, fileName, coverElementId = 'pdf-cover' } = options;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const innerWidth = pageWidth - margin * 2;

  const bgColor = isDark ? '#111827' : '#f5f5f5';
  const fillColorRGB: [number, number, number] = isDark ? [17, 24, 39] : [245, 245, 245];

  // Página 1: Capa
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

  // Páginas de conteúdo
  pdf.addPage();
  pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header da página de conteúdo
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(isDark ? 255 : 30);
  pdf.text(tabTitle, margin, margin + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(isDark ? 160 : 100);
  pdf.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    margin,
    margin + 12
  );

  // Linha decorativa
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.8);
  pdf.line(margin, margin + 16, margin + 40, margin + 16);

  let currentY = margin + 22;

  for (const sectionId of selectedSections) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    // Preparar gráficos para melhor legibilidade
    const cleanup = prepareChartsForCapture(element, isDark);

    // Aguardar repaint
    await new Promise(r => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: bgColor,
        useCORS: true,
        logging: false,
        // Garantir renderização completa
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * innerWidth) / imgProps.width;

      // Se não cabe na página atual, criar nova
      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        currentY = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, currentY, innerWidth, imgHeight);
      currentY += imgHeight + 8;
    } finally {
      cleanup();
    }
  }

  // Footer na última página
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(isDark ? 120 : 140);
    pdf.text(`FinanceFlow - ${tabTitle}`, margin, pageHeight - 6);
    pdf.text(`Página ${i - 1} de ${totalPages - 1}`, pageWidth - margin - 30, pageHeight - 6);
  }

  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`FinanceFlow_${fileName}_${timestamp}.pdf`);
}
