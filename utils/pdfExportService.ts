// Detecta containers Recharts para garantir height fixo durante exportação PDF
// Detecta containers Recharts pelo wrapper real ou SVG interno
function isRechartsContainer(el: HTMLElement): boolean {
  return (
    el.querySelector('.recharts-wrapper') !== null ||
    el.querySelector('svg.recharts-surface') !== null
  );
}
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  selectedSections: string[];
  isDark: boolean;
  tabTitle: string;
  fileName: string;
  coverElementId?: string;
}

const CAPTURE_WIDTH = 900;
const FOOTER_RESERVE = 14;

/**
 * Detecta se um elemento é um grid/flex com filhos lado a lado.
 */
function getGridChildren(element: HTMLElement): HTMLElement[] | null {
  const style = window.getComputedStyle(element);
  const display = style.display;
  if (display !== 'grid' && display !== 'flex') return null;

  const children = Array.from(element.children).filter(
    (c) => c instanceof HTMLElement && window.getComputedStyle(c).display !== 'none'
  ) as HTMLElement[];

  if (children.length < 2) return null;

  const firstRect = children[0].getBoundingClientRect();
  const secondRect = children[1].getBoundingClientRect();
  if (secondRect.left > firstRect.left + firstRect.width * 0.3) {
    return children;
  }
  return null;
}

/**
 * Detecta se um elemento é um grid de KPI cards (4+ filhos pequenos).
 */
function isKpiGrid(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  if (style.display !== 'grid') return false;
  const children = Array.from(element.children).filter(
    (c) => c instanceof HTMLElement
  ) as HTMLElement[];
  return children.length >= 4;
}

interface StyleBackup {
  el: HTMLElement;
  prop: string;
  value: string;
  isAttr?: boolean;
  isClass?: boolean;
}

/**
 * Prepara o DOM de um elemento para captura em PDF:
 * - Remove overflow hidden, truncate, min-h-0
 * - Remove alturas fixas de containers de gráfico
 * - Força 3 colunas em grids de KPI
 * - Melhora legibilidade de textos SVG e legendas
 */
function prepareElementForPdf(root: HTMLElement, isDark: boolean): () => void {
  const backups: StyleBackup[] = [];

  function backupStyle(el: HTMLElement, prop: string) {
    backups.push({ el, prop, value: (el.style as any)[prop] || '' });
  }

  function backupClass(el: HTMLElement, cls: string) {
    if (el.classList.contains(cls)) {
      backups.push({ el, prop: cls, value: cls, isClass: true });
      el.classList.remove(cls);
    }
  }

  function backupAttr(el: HTMLElement, attr: string) {
    backups.push({ el, prop: attr, value: el.getAttribute(attr) || '', isAttr: true });
  }

  const allElements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];

  for (const el of allElements) {
    // Remove truncation and overflow clipping
    backupClass(el, 'truncate');
    backupClass(el, 'overflow-hidden');
    backupClass(el, 'overflow-x-auto');
    backupClass(el, 'min-h-0');

    const computed = window.getComputedStyle(el);

    if (computed.overflow === 'hidden' || computed.overflowX === 'hidden') {
      backupStyle(el, 'overflow');
      el.style.overflow = 'visible';
    }

    // Remove fixed heights em containers, mas para Recharts forçar height: 420px
    const className = el.className;
    if (typeof className === 'string' && /h-\[\d+px\]/.test(className)) {
      backupStyle(el, 'height');
      backupStyle(el, 'minHeight');
      if (isRechartsContainer(el)) {
        // Para containers Recharts, garantir height fixo para ResponsiveContainer
        el.style.height = '420px';
        el.style.minHeight = '420px';
      } else {
        // Para outros containers, usar height:auto e minHeight padrão
        el.style.height = 'auto';
        el.style.minHeight = '300px';
      }
    }

    // Fix SVG text legibility
    if (el instanceof SVGTextElement) {
      const size = parseFloat(computed.fontSize) || 12;
      if (size < 12) {
        backupStyle(el as any, 'fontSize');
        (el as any).style.fontSize = '12px';
      }
      const fill = el.getAttribute('fill');
      if (!fill || fill === '#666' || fill === '#999') {
        backupAttr(el as any, 'fill');
        el.setAttribute('fill', isDark ? '#d1d5db' : '#374151');
      }
    }
  }

  // Fix recharts legend text
  root.querySelectorAll<HTMLElement>('.recharts-legend-item-text').forEach((text) => {
    backupStyle(text, 'fontSize');
    backupStyle(text, 'fontWeight');
    text.style.fontSize = '12px';
    text.style.fontWeight = '600';
  });

  // Fix grid lines
  root.querySelectorAll<SVGLineElement>('.recharts-cartesian-grid line').forEach((line) => {
    const stroke = line.getAttribute('stroke');
    if (stroke === '#333' || stroke === '#444') {
      backupAttr(line as any, 'stroke');
      line.setAttribute('stroke', isDark ? '#4b5563' : '#d1d5db');
    }
  });

  // Force 3-column layout on KPI grids for better readability
  if (isKpiGrid(root)) {
    backupStyle(root, 'gridTemplateColumns');
    root.style.gridTemplateColumns = 'repeat(3, 1fr)';
  }
  root.querySelectorAll<HTMLElement>('[class*="grid-cols"]').forEach((grid) => {
    if (isKpiGrid(grid)) {
      backupStyle(grid, 'gridTemplateColumns');
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    }
  });

  return () => {
    for (const b of backups) {
      if (b.isClass) {
        b.el.classList.add(b.value);
      } else if (b.isAttr) {
        if (b.value) {
          b.el.setAttribute(b.prop, b.value);
        } else {
          b.el.removeAttribute(b.prop);
        }
      } else {
        (b.el.style as any)[b.prop] = b.value;
      }
    }
  };
}

/**
 * Captura um elemento HTML como imagem PNG.
 */
async function captureElement(
  element: HTMLElement,
  bgColor: string,
  isDark: boolean
): Promise<string> {
  // Refatorado: captura PDF sem tocar no DOM original
  // 1. Clonar o container
  const clone = element.cloneNode(true) as HTMLElement;

  // 2. Renderizar clone offscreen
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = `${CAPTURE_WIDTH}px`;
  wrapper.style.zIndex = '9999';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // 3. Garantir width/height fixos nos gráficos Recharts do clone
  // Aplica width/height em todos .recharts-wrapper e svg.recharts-surface
  clone.querySelectorAll('.recharts-wrapper').forEach((chart: HTMLElement) => {
    chart.style.width = `${CAPTURE_WIDTH}px`;
    chart.style.height = '420px';
  });
  clone.querySelectorAll('svg.recharts-surface').forEach((svg: SVGElement) => {
    svg.setAttribute('width', `${CAPTURE_WIDTH}`);
    svg.setAttribute('height', '420');
    svg.style.width = `${CAPTURE_WIDTH}px`;
    svg.style.height = '420px';
  });

  // 4. Disparar resize apenas no clone (simulado)
  // Não há como disparar resize só no clone, mas o clone está offscreen e não afeta a UI
  // 5. Duplo requestAnimationFrame + delay
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
  await new Promise((r) => setTimeout(r, 130));

  // 6. Capturar imagem do clone
  let imgData;
  try {
    imgData = await html2canvas(clone, {
      scale: 2,
      backgroundColor: bgColor,
      useCORS: true,
      logging: false,
      width: CAPTURE_WIDTH,
      windowWidth: CAPTURE_WIDTH + 40,
    });
    return imgData.toDataURL('image/png');
  } finally {
    // 7. Remover clone do DOM
    document.body.removeChild(wrapper);
  }
}

/**
 * Adiciona imagem ao PDF com paginação inteligente.
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
  const maxContentY = pageHeight - margin - FOOTER_RESERVE;

  if (currentY + imgHeight > maxContentY) {
    pdf.addPage();
    pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    currentY = margin;
  }

  const availableHeight = maxContentY - currentY;
  if (imgHeight > availableHeight && currentY === margin) {
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

  // ─── Capa ────────────────────────────────────────
  const coverElement = document.getElementById(coverElementId);
  if (coverElement) {
    const coverCanvas = await html2canvas(coverElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
    });
    pdf.addImage(coverCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);
  }

  // ─── Conteúdo ────────────────────────────────────
  pdf.addPage();
  pdf.setFillColor(fillColorRGB[0], fillColorRGB[1], fillColorRGB[2]);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

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

  for (const sectionId of selectedSections) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    const gridChildren = getGridChildren(element);

    if (gridChildren && gridChildren.length >= 2) {
      for (const child of gridChildren) {
        const imgData = await captureElement(child, bgColor, isDark);
        currentY = addImageToPdf(
          pdf, imgData, currentY, margin, innerWidth,
          pageHeight, fillColorRGB, pageWidth
        );
      }
    } else {
      const imgData = await captureElement(element, bgColor, isDark);
      currentY = addImageToPdf(
        pdf, imgData, currentY, margin, innerWidth,
        pageHeight, fillColorRGB, pageWidth
      );
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
