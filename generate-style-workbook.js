/**
 * Divemotor Design System - Style Workbook Generator
 * Run: node generate-style-workbook.js
 * Output: divemotor-style-workbook.pdf
 */
const { jsPDF } = require('./kaufmann-workspace/node_modules/jspdf');

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const W = 210, H = 297;
const ML = 18, MR = 18, MT = 20;
const CW = W - ML - MR;

// ── Color palette ──
const C = {
  navy:     [30, 58, 95],
  blue:     [46, 117, 182],
  blueLight:[239, 246, 255],
  slate50:  [248, 250, 252],
  slate100: [241, 245, 249],
  slate200: [226, 232, 240],
  slate300: [203, 213, 225],
  slate400: [148, 163, 184],
  slate500: [100, 116, 139],
  slate600: [71, 85, 105],
  slate700: [51, 65, 85],
  slate800: [30, 41, 59],
  slate900: [15, 23, 42],
  white:    [255, 255, 255],
  emerald:  [16, 185, 129],
  emeraldLt:[236, 253, 245],
  emeraldBd:[167, 243, 208],
  emerald600:[5,150,105],
  amber:    [245, 158, 11],
  amberLt:  [255, 251, 235],
  amberBd:  [253, 230, 138],
  red:      [239, 68, 68],
  redLt:    [254, 242, 242],
  redBd:    [254, 202, 202],
  slateTag: [100, 116, 139],
  slateLt:  [248, 250, 252],
  slateBd:  [226, 232, 240],
  blueTag:  [59, 130, 246],
  blueLt:   [239, 246, 255],
  blueBd:   [191, 219, 254],
  pending:  [148, 163, 184],
  pendLt:   [241, 245, 249],
  pendBd:   [226, 232, 240],
  violet:   [139, 92, 246],
  violetLt: [245, 243, 255],
  violetBd: [221, 214, 254],
  cyan:     [6, 182, 212],
  cyanLt:   [236, 254, 255],
  cyanBd:   [165, 243, 252],
  rose:     [244, 63, 94],
  roseLt:   [255, 241, 242],
  roseBd:   [254, 205, 211],
  orange:   [249, 115, 22],
  orangeLt: [255, 247, 237],
  orangeBd: [254, 215, 170],
};

let y = MT;

function setColor(rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
function setFill(rgb)  { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setDraw(rgb)  { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

function checkPage(need = 30) {
  if (y + need > H - 22) { doc.addPage(); y = MT; return true; }
  return false;
}

// Track section pages for TOC links
const sectionPages = {};

function sectionTitle(text, key) {
  checkPage(20);
  if (key) sectionPages[key] = doc.internal.getNumberOfPages();
  setFill(C.navy);
  doc.rect(ML, y, CW, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  setColor(C.white);
  doc.text(text, ML + 4, y + 6.5);
  y += 14;
}

function subSection(text) {
  checkPage(16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(C.slate800);
  doc.text(text, ML, y + 4);
  setDraw(C.slate200);
  doc.line(ML, y + 6, ML + CW, y + 6);
  y += 11;
}

function bodyText(text, indent = 0) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setColor(C.slate700);
  const lines = doc.splitTextToSize(text, CW - indent);
  lines.forEach(line => {
    checkPage(6);
    doc.text(line, ML + indent, y + 4);
    y += 5;
  });
}

function bulletPoint(text, indent = 4) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(C.slate700);
  const lines = doc.splitTextToSize(text, CW - indent - 6);
  checkPage(lines.length * 4.5 + 2);
  setFill(C.slate500);
  doc.circle(ML + indent + 1, y + 3.5, 0.8, 'F');
  lines.forEach((line, i) => {
    doc.text(line, ML + indent + 4, y + 4);
    y += 4.5;
  });
}

function codeBlock(text) {
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  const lines = text.split('\n');
  const lineH = 3.8;
  const blockH = lines.length * lineH + 5;
  checkPage(blockH + 4);
  setFill(C.slate50);
  setDraw(C.slate200);
  doc.roundedRect(ML + 2, y, CW - 4, blockH, 2, 2, 'FD');
  y += 3;
  setColor(C.slate700);
  lines.forEach(line => {
    doc.text(line, ML + 6, y + 3);
    y += lineH;
  });
  y += 3;
}

function colorSwatch(x, yy, rgb, label, hex) {
  setFill(rgb); setDraw(C.slate200);
  doc.roundedRect(x, yy, 14, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setColor(C.slate800);
  doc.text(label, x + 17, yy + 5);
  doc.setFont('courier', 'normal'); doc.setFontSize(7); setColor(C.slate500);
  doc.text(hex, x + 17, yy + 10);
}

function triSwatch(x, yy, main, light, border, label, hex) {
  setFill(main); setDraw(C.slate200);
  doc.roundedRect(x, yy, 10, 10, 2, 2, 'FD');
  setFill(light);
  doc.roundedRect(x + 12, yy, 10, 10, 2, 2, 'FD');
  setFill(border);
  doc.roundedRect(x + 24, yy, 10, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setColor(C.slate800);
  doc.text(label, x, yy + 16);
  doc.setFont('courier', 'normal'); doc.setFontSize(6.5); setColor(C.slate500);
  doc.text(hex, x, yy + 20);
}

function statusBadge(x, yy, bgRgb, textRgb, borderRgb, label) {
  setFill(bgRgb); setDraw(borderRgb);
  const tw = doc.getStringUnitWidth(label) * 7.5 * 0.35 + 14;
  doc.roundedRect(x, yy, tw, 7, 3, 3, 'FD');
  setFill(textRgb); doc.circle(x + 4, yy + 3.5, 1.2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setColor(textRgb);
  doc.text(label, x + 7, yy + 5);
  return tw + 3;
}

function tableHeader(cols) {
  checkPage(10);
  setFill(C.slate100);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); setColor(C.slate500);
  cols.forEach(([label, x]) => doc.text(label, ML + x, y + 5));
  y += 8;
}

function tableRow(cols, i) {
  checkPage(7);
  if (i % 2 === 0) { setFill(C.slate50); doc.rect(ML, y - 1, CW, 7, 'F'); }
  cols.forEach(([text, x, font, color, maxW]) => {
    doc.setFont(font || 'helvetica', font === 'courier' ? 'normal' : 'normal');
    doc.setFontSize(7);
    setColor(color || C.slate700);
    if (maxW) {
      const lines = doc.splitTextToSize(text, maxW);
      doc.text(lines[0], ML + x, y + 4);
    } else {
      doc.text(text, ML + x, y + 4);
    }
  });
  y += 7;
}

// ── MOCKUP drawing helpers ──
function mockBtn(x, yy, w, h, rgb, label, textRgb) {
  setFill(rgb); setDraw(rgb);
  doc.roundedRect(x, yy, w, h, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(textRgb || C.white);
  doc.text(label, x + w/2, yy + h/2 + 1.5, { align: 'center' });
}

function mockInput(x, yy, w) {
  setFill(C.slate50); setDraw(C.slate200);
  doc.roundedRect(x, yy, w, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate400);
  doc.text('Placeholder...', x + 3, yy + 5.5);
}

function mockCard(x, yy, w, h, content) {
  setFill(C.white); setDraw(C.slate200);
  doc.roundedRect(x, yy, w, h, 2, 2, 'FD');
  if (content) content(x, yy);
}

function mockBadge(x, yy, rgb, lightRgb, label) {
  setFill(lightRgb); setDraw(C.slate200);
  const tw = label.length * 2 + 10;
  doc.roundedRect(x, yy, tw, 5.5, 2.5, 2.5, 'FD');
  setFill(rgb); doc.circle(x + 3, yy + 2.8, 1, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(rgb);
  doc.text(label, x + 5.5, yy + 3.8);
  return tw + 2;
}

function mockDivider(x, yy, w) {
  setDraw(C.slate200);
  doc.line(x, yy, x + w, yy);
}

function drawMockup(drawFn, mw, mh) {
  checkPage(mh + 12);
  const mx = ML + CW/2 - mw/2;
  // solid frame with subtle background
  setFill([247, 249, 252]); setDraw(C.slate200);
  doc.roundedRect(mx - 3, y - 2, mw + 6, mh + 8, 3, 3, 'FD');
  // "Vista previa" label
  doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
  doc.text('VISTA PREVIA', mx, y + 2);
  y += 4;
  drawFn(mx, y);
  y += mh + 6;
}

function componentCard(title, desc, code, doList, dontList, mockupFn, mockupW, mockupH) {
  checkPage(50);
  // title bar
  setFill(C.blue);
  doc.roundedRect(ML, y, CW, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); setColor(C.white);
  doc.text(title, ML + 4, y + 5);
  y += 10;
  // desc
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(C.slate700);
  const descLines = doc.splitTextToSize(desc, CW - 4);
  descLines.forEach(line => { checkPage(5); doc.text(line, ML + 2, y + 3); y += 4.5; });
  y += 3;
  // mockup
  if (mockupFn) {
    drawMockup(mockupFn, mockupW || 130, mockupH || 30);
  }
  // code
  if (code) codeBlock(code);
  // do/dont columns
  if (doList && doList.length) {
    checkPage(doList.length * 5 + 6);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.emerald);
    // Draw checkmark manually (unicode not supported)
    setDraw(C.emerald);
    doc.setLineWidth(0.4);
    doc.line(ML + 4, y + 2.5, ML + 5, y + 3.5);
    doc.line(ML + 5, y + 3.5, ML + 7, y + 1.5);
    doc.setLineWidth(0.2);
    doc.text(' HACER', ML + 8, y + 3); y += 5;
    doList.forEach(item => {
      checkPage(5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); setColor(C.slate600);
      doc.text('  + ' + item, ML + 6, y + 3); y += 4;
    });
    y += 1;
  }
  if (dontList && dontList.length) {
    checkPage(dontList.length * 5 + 6);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.red);
    // Draw X mark manually (unicode not supported)
    setDraw(C.red);
    doc.setLineWidth(0.4);
    doc.line(ML + 4, y + 1.5, ML + 6.5, y + 3.5);
    doc.line(ML + 6.5, y + 1.5, ML + 4, y + 3.5);
    doc.setLineWidth(0.2);
    doc.text(' EVITAR', ML + 8, y + 3); y += 5;
    dontList.forEach(item => {
      checkPage(5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); setColor(C.slate600);
      doc.text('  - ' + item, ML + 6, y + 3); y += 4;
    });
  }
  y += 4;
  setDraw(C.slate200); doc.line(ML, y, ML + CW, y);
  y += 6;
}

// ════════════════════════════════════════════════════
// COVER PAGE
// ════════════════════════════════════════════════════
setFill(C.navy);
doc.rect(0, 0, W, H, 'F');

setFill(C.blue);
doc.rect(0, 95, W, 4, 'F');

// Logo
setFill(C.white);
doc.roundedRect(W/2 - 30, 55, 60, 22, 4, 4, 'F');
doc.setFont('helvetica', 'bold'); doc.setFontSize(20); setColor(C.navy);
doc.text('DIVEMOTOR', W / 2, 69, { align: 'center' });

doc.setFont('helvetica', 'bold'); doc.setFontSize(34); setColor(C.white);
doc.text('Style Workbook', W / 2, 125, { align: 'center' });

doc.setFont('helvetica', 'normal'); doc.setFontSize(15);
doc.text('Design System & Component Guide', W / 2, 137, { align: 'center' });

setFill(C.blue);
doc.roundedRect(W/2 - 40, 148, 80, 0.8, 0.4, 0.4, 'F');

doc.setFontSize(10);
setColor([191, 219, 254]);
doc.text('Angular  |  TailwindCSS  |  Standalone Components', W / 2, 160, { align: 'center' });
doc.text('Gu\u00eda de referencia para proyectos web', W / 2, 168, { align: 'center' });

doc.setFontSize(9); setColor(C.slate400);
doc.text('Versi\u00f3n 1.0  -  Marzo 2026', W / 2, 195, { align: 'center' });

setFill(C.blue);
doc.rect(0, H - 12, W, 12, 'F');
doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(C.white);
doc.text('Divemotor  |  Documento interno  |  Design System', W / 2, H - 5, { align: 'center' });

// ════════════════════════════════════════════════════
// TABLE OF CONTENTS (placeholder — we fill links later)
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;
const tocPage = doc.internal.getNumberOfPages();

doc.setFont('helvetica', 'bold'); doc.setFontSize(20); setColor(C.navy);
doc.text('Contenido', ML, y + 8);
y += 20;

const toc = [
  ['1', 'Paleta de Colores', 'colors'],
  ['2', 'Tipograf\u00eda', 'typo'],
  ['3', 'Status & Colores Sem\u00e1nticos', 'status'],
  ['4', 'Clases Globales CSS', 'global'],
  ['5', 'Botones', 'buttons'],
  ['6', 'Formularios & Inputs', 'forms'],
  ['7', 'Cards & Containers', 'cards'],
  ['8', 'Tablas', 'tables'],
  ['9', 'Navegaci\u00f3n', 'nav'],
  ['10', 'Badges & Tags', 'badges'],
  ['11', 'Alertas & Notificaciones', 'alerts'],
  ['12', 'Modales & Drawers', 'modals'],
  ['13', 'Tooltips & Popovers', 'tooltips'],
  ['14', 'Loaders & Skeletons', 'loaders'],
  ['15', 'Paginaci\u00f3n', 'pagination'],
  ['16', 'Charts & Data Viz', 'charts'],
  ['17', '\u00cdconos', 'icons'],
  ['18', 'Animaciones & Transiciones', 'anims'],
  ['19', 'Layout & Responsive', 'layout'],
  ['20', 'Spacing & Sizing', 'spacing'],
  ['21', 'Shadows & Borders', 'shadows'],
  ['22', 'Z-Index & Layering', 'zindex'],
  ['23', 'Scrollbar & Overflow', 'scroll'],
  ['24', 'Accesibilidad', 'a11y'],
  ['25', 'Gu\u00eda de Uso R\u00e1pido', 'quickref'],
];

// We'll store TOC entry positions to add links & page numbers later
const tocEntries = [];
toc.forEach(([num, title, key]) => {
  const entryY = y;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setColor(C.blue);
  doc.text(num + '.', ML + (num.length > 1 ? 0 : 2), y + 4);
  setColor(C.slate800);
  doc.text(title, ML + 10, y + 4);
  // dotted leader line (we leave space for page number at the right)
  setDraw(C.slate300);
  doc.setLineDashPattern([0.5, 1], 0);
  const tw = doc.getTextWidth(title);
  doc.line(ML + 10 + tw + 2, y + 4, ML + CW - 10, y + 4);
  doc.setLineDashPattern([], 0);
  // page number placeholder — will be updated in post-processing
  tocEntries.push({ key, y: entryY, page: tocPage, textY: y + 4 });
  y += 8;
});

// ════════════════════════════════════════════════════
// 1. COLOR PALETTE
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('1. Paleta de Colores', 'colors');

subSection('Brand Colors');
bodyText('Los colores de marca son la base de la identidad visual. Se usan en headers, CTAs y acentos.');
y += 2;
const brandColors = [
  [C.navy, 'Navy (Primary)', '#1E3A5F'],
  [C.blue, 'Blue (Secondary)', '#2E75B6'],
  [C.blueLight, 'Blue Light (BG)', '#EFF6FF'],
];
brandColors.forEach(([rgb, label, hex], i) => {
  colorSwatch(ML + i * 58, y, rgb, label, hex);
});
y += 20;

codeBlock(
`brand: {
  navy:  '#1E3A5F',   // Headers, sidebar, CTAs primarios
  blue:  '#2E75B6',   // Links, acciones secundarias, acentos
  light: '#EFF6FF',   // Fondos, hover states
}`
);

subSection('Paleta Neutral (Slate)');
bodyText('Escala completa para textos, bordes, fondos y estados. Base de toda la UI.');
y += 2;
const slateColors = [
  [C.slate50, '50', '#F8FAFC'],  [C.slate100, '100', '#F1F5F9'],
  [C.slate200, '200', '#E2E8F0'], [C.slate300, '300', '#CBD5E1'],
  [C.slate400, '400', '#94A3B8'], [C.slate500, '500', '#64748B'],
  [C.slate600, '600', '#475569'], [C.slate700, '700', '#334155'],
  [C.slate800, '800', '#1E293B'], [C.slate900, '900', '#0F172A'],
];
slateColors.forEach(([rgb, label, hex], i) => {
  const col = i % 5;
  const row = Math.floor(i / 5);
  colorSwatch(ML + col * 35, y + row * 18, rgb, 'Slate ' + label, hex);
});
y += 18 * 2 + 6;

subSection('Colores Sem\u00e1nticos (Status)');
bodyText('Cada estado tiene 3 variantes: DEFAULT (\u00edconos, texto), LIGHT (fondo), BORDER (borde).');
y += 2;
doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate400);
doc.text('DEFAULT    LIGHT    BORDER', ML, y + 3);
doc.text('DEFAULT    LIGHT    BORDER', ML + 60, y + 3);
doc.text('DEFAULT    LIGHT    BORDER', ML + 120, y + 3);
y += 5;

const semanticColors = [
  [C.emerald, C.emeraldLt, C.emeraldBd, 'Success', '#10B981'],
  [C.amber, C.amberLt, C.amberBd, 'Warning', '#F59E0B'],
  [C.red, C.redLt, C.redBd, 'Error', '#EF4444'],
  [C.blueTag, C.blueLt, C.blueBd, 'Info', '#3B82F6'],
  [C.slateTag, C.slateLt, C.slateBd, 'Neutral', '#64748B'],
  [C.pending, C.pendLt, C.pendBd, 'Disabled', '#94A3B8'],
];
semanticColors.forEach(([main, light, border, label, hex], i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  triSwatch(ML + col * 60, y + row * 24, main, light, border, label, hex);
});
y += 24 * 2 + 4;

subSection('Paleta Extendida');
bodyText('Colores adicionales para gr\u00e1ficos, tags y diferenciaci\u00f3n de categor\u00edas.');
y += 2;
const extColors = [
  [C.violet, 'Violet', '#8B5CF6'],
  [C.cyan, 'Cyan', '#06B6D4'],
  [C.rose, 'Rose', '#F43F5E'],
  [C.orange, 'Orange', '#F97316'],
];
extColors.forEach(([rgb, label, hex], i) => {
  colorSwatch(ML + i * 44, y, rgb, label, hex);
});
y += 20;

codeBlock(
`// tailwind.config.js -> theme.extend.colors
'st-success':  { DEFAULT: '#10b981', light: '#ecfdf5', border: '#a7f3d0' }
'st-warning':  { DEFAULT: '#f59e0b', light: '#fffbeb', border: '#fde68a' }
'st-error':    { DEFAULT: '#ef4444', light: '#fef2f2', border: '#fecaca' }
'st-info':     { DEFAULT: '#3b82f6', light: '#eff6ff', border: '#bfdbfe' }
'st-neutral':  { DEFAULT: '#64748b', light: '#f8fafc', border: '#e2e8f0' }
'st-disabled': { DEFAULT: '#94a3b8', light: '#f1f5f9', border: '#e2e8f0' }`
);

// ════════════════════════════════════════════════════
// 2. TYPOGRAPHY
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('2. Tipograf\u00eda', 'typo');

subSection('Font Stack');
codeBlock(
`fontFamily: {
  sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
// CDN: fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800`
);

// Mockup: type scale visual
drawMockup((mx, my) => {
  doc.setFont('helvetica', 'bold'); setColor(C.slate800);
  doc.setFontSize(16); doc.text('Heading 2XL (24px)', mx + 3, my + 7);
  doc.setFontSize(12); doc.text('Heading XL (20px)', mx + 3, my + 14);
  doc.setFontSize(10); doc.text('Heading LG (18px)', mx + 3, my + 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(C.slate600);
  doc.text('Body text SM (14px) - texto est\u00e1ndar para contenido', mx + 3, my + 26);
  doc.setFontSize(6.5); setColor(C.slate500);
  doc.text('Caption XS (12px) - badges, metadata', mx + 3, my + 31);
}, 140, 34);

subSection('Escala Tipogr\u00e1fica');
tableHeader([['CLASE', 3], ['TAMA\u00d1O', 30], ['PESO', 48], ['USO RECOMENDADO', 75]]);
[
  ['text-3xl', '30px', 'font-bold', 'Hero headings, landing page'],
  ['text-2xl', '24px', 'font-bold', 'KPI values, contadores grandes'],
  ['text-xl',  '20px', 'font-bold', 'T\u00edtulos de p\u00e1gina (desktop)'],
  ['text-lg',  '18px', 'font-bold', 'T\u00edtulos de p\u00e1gina (mobile), section headers'],
  ['text-base','16px', 'font-normal','Body text default'],
  ['text-sm',  '14px', 'font-medium','Labels, formularios, contenido secundario'],
  ['text-xs',  '12px', 'font-semibold','Badges, headers de tabla, metadata'],
  ['text-[11px]','11px','font-normal','Listas compactas, hover cards'],
  ['text-[10px]','10px','font-semibold','Micro labels, timestamps'],
].forEach(([cls, size, weight, usage], i) => {
  tableRow([
    [cls, 3, 'courier', C.blue],
    [size, 30, 'helvetica', C.slate600],
    [weight, 48, 'courier', C.slate500],
    [usage, 75, 'helvetica', C.slate700, 90],
  ], i);
});
y += 6;

subSection('Roles de Color de Texto');
tableHeader([['CLASE', 3], ['HEX', 35], ['ROL', 60]]);
[
  ['text-slate-900', '#0F172A', 'T\u00edtulos principales, headings cr\u00edticos'],
  ['text-slate-800', '#1E293B', 'T\u00edtulos, valores, texto destacado'],
  ['text-slate-700', '#334155', 'Body text, descripciones'],
  ['text-slate-600', '#475569', 'Texto secundario, labels'],
  ['text-slate-500', '#64748B', 'Subt\u00edtulos, metadata, hints'],
  ['text-slate-400', '#94A3B8', 'Placeholders, texto deshabilitado'],
  ['text-brand-navy','#1E3A5F', 'Links, acciones, branding'],
  ['text-brand-blue','#2E75B6', 'Links hover, acentos'],
].forEach(([cls, hex, usage], i) => {
  tableRow([
    [cls, 3, 'courier', C.blue],
    [hex, 35, 'courier', C.slate500],
    [usage, 60, 'helvetica', C.slate700, 108],
  ], i);
});
y += 6;

subSection('Gu\u00eda de Font Weight');
tableHeader([['PESO', 3], ['CLASE', 25], ['USO', 55]]);
[
  ['400', 'font-normal', 'Body text, descripciones, inputs'],
  ['500', 'font-medium', 'Labels, links, nav items, subt\u00edtulos'],
  ['600', 'font-semibold', 'Badges, table headers, \u00e9nfasis peque\u00f1o'],
  ['700', 'font-bold', 'T\u00edtulos, KPI values, section headers'],
  ['800', 'font-extrabold', 'Hero text, landing pages (uso limitado)'],
].forEach(([w, cls, uso], i) => {
  tableRow([
    [w, 3, 'courier', C.navy],
    [cls, 25, 'courier', C.blue],
    [uso, 55, 'helvetica', C.slate700, 114],
  ], i);
});
y += 6;

subSection('Espaciado de Letras');
bodyText('tracking-wide + uppercase: headers de tabla, section labels');
bodyText('tracking-wider: micro labels (10px), tags de categor\u00eda');
bodyText('tracking-tight: headings grandes (2xl+) para compacidad');

// ════════════════════════════════════════════════════
// 3. STATUS & SEMANTIC COLORS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('3. Status & Colores Sem\u00e1nticos', 'status');

subSection('Patr\u00f3n de Badge de Estado');
bodyText('Patr\u00f3n universal para mostrar estados. Dot animado (opcional) + label en pill con border.');
y += 3;

// Visual mockup of all status badges
drawMockup((mx, my) => {
  let bx = mx + 5;
  [
    [C.emeraldLt, C.emerald, 'EXITOSO'],
    [C.amberLt, C.amber, 'ADVERTENCIA'],
    [C.redLt, C.red, 'ERROR'],
  ].forEach(([bg, text, label]) => {
    setFill(bg); setDraw(C.slate200);
    const tw = label.length * 2.2 + 10;
    doc.roundedRect(bx, my + 3, tw, 6, 3, 3, 'FD');
    setFill(text); doc.circle(bx + 3.5, my + 6, 1, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(text);
    doc.text(label, bx + 6.5, my + 7.2);
    bx += tw + 4;
  });
  bx = mx + 5;
  [
    [C.blueLt, C.blueTag, 'INFO'],
    [C.slateLt, C.slateTag, 'COMPLETADO'],
    [C.pendLt, C.pending, 'PENDIENTE'],
  ].forEach(([bg, text, label]) => {
    setFill(bg); setDraw(C.slate200);
    const tw = label.length * 2.2 + 10;
    doc.roundedRect(bx, my + 12, tw, 6, 3, 3, 'FD');
    setFill(text); doc.circle(bx + 3.5, my + 15, 1, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(text);
    doc.text(label, bx + 6.5, my + 16.2);
    bx += tw + 4;
  });
}, 140, 21);

codeBlock(
`<!-- Estructura del Badge -->
<span class="inline-flex items-center px-2 py-0.5
             rounded-full text-xs font-semibold border
             bg-st-success-light text-st-success border-st-success-border">
  <span class="w-1.5 h-1.5 rounded-full bg-st-success mr-1.5"></span>
  Exitoso
</span>

<!-- Con animaci\u00f3n pulse para estados activos -->
<span class="w-1.5 h-1.5 rounded-full bg-st-warning animate-pulse"></span>`
);

subSection('Gu\u00eda de Uso de Colores Sem\u00e1nticos');
tableHeader([['STATUS', 3], ['DEFAULT', 25], ['LIGHT (BG)', 48], ['BORDER', 75], ['CASO DE USO', 100]]);
[
  ['Success', 'text/icon', 'card bg', 'badge border', 'Completado, aprobado'],
  ['Warning', 'text/icon', 'alert bg', 'alert border', 'Atenci\u00f3n, en riesgo'],
  ['Error',   'text/icon', 'card bg', 'badge border', 'Fallido, rechazado'],
  ['Info',    'text/icon', 'tooltip bg','badge border', 'Informativo, en progreso'],
  ['Neutral', 'text/icon', 'chip bg', 'dividers', 'Inactivo, hist\u00f3rico'],
  ['Disabled','text/icon', 'field bg', 'input border', 'Deshabilitado, read-only'],
].forEach(([status, def, light, border, uso], i) => {
  tableRow([
    [status, 3, 'helvetica', C.navy],
    [def, 25, 'helvetica', C.slate600],
    [light, 48, 'helvetica', C.slate600],
    [border, 75, 'helvetica', C.slate600],
    [uso, 100, 'helvetica', C.slate700, 72],
  ], i);
});
y += 6;

subSection('Colores para Progreso y Niveles');
bodyText('Para barras de progreso, niveles, gauges y sem\u00e1foros:');
y += 2;

// Mockup: progress bars
drawMockup((mx, my) => {
  const bw = 100;
  // success
  setFill(C.slate200); doc.roundedRect(mx + 5, my + 3, bw, 4, 2, 2, 'F');
  setFill(C.emerald); doc.roundedRect(mx + 5, my + 3, bw * 0.85, 4, 2, 2, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate600);
  doc.text('85% - On track', mx + bw + 8, my + 6);
  // warning
  setFill(C.slate200); doc.roundedRect(mx + 5, my + 10, bw, 4, 2, 2, 'F');
  setFill(C.amber); doc.roundedRect(mx + 5, my + 10, bw * 0.55, 4, 2, 2, 'F');
  doc.text('55% - En riesgo', mx + bw + 8, my + 13);
  // error
  setFill(C.slate200); doc.roundedRect(mx + 5, my + 17, bw, 4, 2, 2, 'F');
  setFill(C.red); doc.roundedRect(mx + 5, my + 17, bw * 0.20, 4, 2, 2, 'F');
  doc.text('20% - Cr\u00edtico', mx + bw + 8, my + 20);
}, 145, 24);

codeBlock(
`// Fill de barra de progreso
bg-st-success   // Completado, on-track
bg-st-warning   // En riesgo, medio
bg-st-error     // Cr\u00edtico, vencido
bg-st-info      // Activo, en progreso
bg-st-disabled  // No iniciado, vac\u00edo

// Track de fondo
bg-slate-200    // Color default del track`
);

// ════════════════════════════════════════════════════
// 4. GLOBAL CSS CLASSES
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('4. Clases Globales CSS (styles.scss)', 'global');

bodyText('Clases reutilizables definidas en styles.scss con @apply de Tailwind. Prefijo: dm-');
y += 4;

const globalClasses = [
  ['.dm-card', 'Container principal',
   '@apply bg-white rounded-lg border border-slate-200 shadow-sm;'],
  ['.dm-filters-bar', 'Barra de filtros',
   '@apply bg-white rounded-lg border border-slate-200\n       shadow-sm p-3 sm:p-4 mb-4;'],
  ['.dm-select', 'Select/dropdown',
   '@apply text-sm rounded-lg border border-slate-200\n       bg-slate-50 px-3 py-2 text-slate-700\n       focus:outline-none focus:ring-2 focus:ring-blue-500;'],
  ['.dm-page-title', 'T\u00edtulo de p\u00e1gina',
   '@apply text-lg sm:text-xl font-bold text-slate-800;'],
  ['.dm-subtitle', 'Subt\u00edtulo',
   '@apply text-sm text-slate-500 mt-0.5;'],
  ['.dm-btn-primary', 'Bot\u00f3n primario',
   '@apply flex items-center gap-1.5 px-4 py-2\n       bg-emerald-600 text-white text-sm font-medium\n       rounded-lg hover:bg-emerald-700 transition-colors;'],
  ['.dm-btn-ghost', 'Bot\u00f3n ghost',
   '@apply flex items-center gap-1 px-3 py-2 text-sm\n       text-slate-500 hover:text-slate-700\n       hover:bg-slate-100 rounded-lg transition-colors;'],
  ['.dm-btn-brand', 'Bot\u00f3n brand',
   '@apply bg-brand-navy text-white text-sm font-medium\n       rounded-lg hover:opacity-90 transition-colors;'],
  ['.dm-stat-badge', 'Stat badge',
   '@apply px-2 py-0.5 text-xs font-semibold rounded-full;'],
  ['.dm-table-header', 'Header de tabla',
   '@apply text-xs font-semibold text-slate-500\n       uppercase tracking-wide;'],
  ['.dm-tooltip', 'Tooltip',
   '@apply absolute z-50 bg-white border border-slate-200\n       rounded-lg shadow-md p-3 text-xs text-slate-700;\n       pointer-events: none;'],
  ['.dm-divider', 'Divisor',
   '@apply border-t border-slate-200 my-4;'],
  ['.dm-label', 'Label de formulario',
   '@apply block text-sm font-medium text-slate-700 mb-1;'],
  ['.dm-chip', 'Chip/tag',
   '@apply inline-flex items-center px-2.5 py-1\n       text-xs font-medium rounded-full\n       bg-slate-100 text-slate-600;'],
];

globalClasses.forEach(([name, desc, code]) => {
  const codeLines = code.split('\n').length;
  const blockH = codeLines * 3.8 + 5 + 16;
  checkPage(blockH);
  // Name on its own line, large and clear
  doc.setFont('courier', 'bold'); doc.setFontSize(9); setColor(C.blue);
  doc.text(name, ML, y + 4);
  y += 6;
  // Description on its own line below
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); setColor(C.slate500);
  doc.text(desc, ML + 2, y + 3);
  y += 6;
  codeBlock(code);
  y += 3;
});

// ════════════════════════════════════════════════════
// 5. BUTTONS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('5. Botones', 'buttons');

componentCard(
  'Bot\u00f3n Primario',
  'Acci\u00f3n principal de la p\u00e1gina. M\u00e1ximo 1-2 por vista. Color emerald para acciones positivas.',
  `<button class="dm-btn-primary">
  <icon name="download" size="16" />
  Exportar CSV
</button>

// Variante danger:
bg-red-600 hover:bg-red-700  // Eliminar, cancelar`,
  ['Usar para la acci\u00f3n principal de cada vista', 'Incluir \u00edcono a la izquierda cuando sea posible', 'Texto corto y descriptivo (2-3 palabras)'],
  ['M\u00e1s de 2 primary buttons en la misma vista', 'Texto gen\u00e9rico como "Click aqu\u00ed"'],
  // mockup
  (mx, my) => {
    mockBtn(mx + 5, my + 4, 45, 10, C.emerald600, 'Exportar CSV', C.white);
    mockBtn(mx + 55, my + 4, 35, 10, C.red, 'Eliminar', C.white);
    mockBtn(mx + 95, my + 4, 40, 10, [200,210,220], 'Disabled', C.slate400);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('primary', mx + 16, my + 17); doc.text('danger', mx + 63, my + 17); doc.text('disabled', mx + 105, my + 17);
  }, 140, 18
);

componentCard(
  'Bot\u00f3n Ghost',
  'Acciones secundarias, limpiar filtros, acciones de bajo impacto.',
  `<button class="dm-btn-ghost">
  <icon name="x" size="14" />
  Limpiar filtros
</button>`,
  ['Usar junto a botones primarios como acci\u00f3n secundaria'],
  ['Usar para acciones destructivas'],
  (mx, my) => {
    setFill(C.white); setDraw(C.slate200);
    doc.roundedRect(mx + 5, my + 3, 48, 10, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate500);
    doc.text('Limpiar filtros', mx + 14, my + 9.5);
    // hover state
    setFill(C.slate100);
    doc.roundedRect(mx + 60, my + 3, 48, 10, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal'); setColor(C.slate700);
    doc.text('Limpiar filtros', mx + 69, my + 9.5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('normal', mx + 20, my + 16); doc.text(':hover', mx + 76, my + 16);
  }, 120, 18
);

componentCard(
  'Bot\u00f3n Brand',
  'Acciones de marca, toggles de vista, descargas. Usa el navy corporativo.',
  `<button class="dm-btn-brand px-4 py-2">
  Descargar PDF
</button>

// Toggle group:
<div class="flex rounded-lg overflow-hidden border border-brand-navy">
  <button class="dm-btn-brand px-3 py-1.5">Opci\u00f3n A</button>
  <button class="px-3 py-1.5 text-brand-navy">Opci\u00f3n B</button>
</div>`,
  ['Usar para acciones corporativas o branding', 'Toggle groups con 2-3 opciones'],
  ['Usar como bot\u00f3n primario de formularios'],
  (mx, my) => {
    // Single
    mockBtn(mx + 5, my + 3, 45, 10, C.navy, 'Descargar PDF', C.white);
    // Toggle group
    setDraw(C.navy);
    doc.roundedRect(mx + 60, my + 3, 60, 10, 2, 2, 'D');
    setFill(C.navy); doc.rect(mx + 60, my + 3, 30, 10, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.white);
    doc.text('Opci\u00f3n A', mx + 68, my + 9.5);
    setColor(C.navy);
    doc.text('Opci\u00f3n B', mx + 97, my + 9.5);
  }, 130, 16
);

checkPage(30);
subSection('Tama\u00f1os de Bot\u00f3n');

drawMockup((mx, my) => {
  // small
  setFill(C.emerald600); doc.roundedRect(mx + 5, my + 3, 28, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5); setColor(C.white);
  doc.text('Peque\u00f1o', mx + 12, my + 7.5);
  // medium
  setFill(C.emerald600); doc.roundedRect(mx + 38, my + 2, 35, 9, 2, 2, 'F');
  doc.setFontSize(6); doc.text('Mediano', mx + 47, my + 8);
  // large
  setFill(C.emerald600); doc.roundedRect(mx + 78, my + 1, 42, 11, 2, 2, 'F');
  doc.setFontSize(7); doc.text('Grande', mx + 91, my + 8);
  // icon-only
  setFill(C.emerald600); doc.roundedRect(mx + 126, my + 2.5, 9, 9, 2, 2, 'F');
  doc.setFontSize(7); doc.text('+', mx + 129, my + 8.5);
}, 140, 14);

codeBlock(
`// Peque\u00f1o (acciones inline, tablas)
px-2.5 py-1.5 text-xs rounded

// Mediano (default)
px-4 py-2 text-sm rounded-lg

// Grande (hero, standalone)
px-6 py-3 text-base rounded-lg

// Solo \u00edcono
w-8 h-8 / w-10 h-10 rounded-lg flex items-center justify-center`
);

subSection('Estados de Bot\u00f3n');
codeBlock(
`// Hover
hover:bg-emerald-700          // primary
hover:bg-slate-100            // ghost
hover:opacity-90              // brand

// Focus
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

// Disabled
disabled:opacity-50 disabled:cursor-not-allowed

// Loading
<button class="dm-btn-primary" disabled>
  <svg class="animate-spin w-4 h-4 mr-2">...</svg>
  Procesando...
</button>`
);

// ════════════════════════════════════════════════════
// 6. FORMS & INPUTS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('6. Formularios & Inputs', 'forms');

componentCard(
  'Text Input',
  'Input b\u00e1sico de texto. Fondo slate-50, borde slate-200, focus ring azul.',
  `<label class="dm-label">Nombre</label>
<input type="text"
  class="w-full px-3 py-2 text-sm rounded-lg
         border border-slate-200 bg-slate-50
         text-slate-700 placeholder-slate-400
         focus:outline-none focus:ring-2
         focus:ring-blue-500 focus:border-transparent"
  placeholder="Ingrese nombre..." />`,
  ['Label siempre visible arriba del input', 'Placeholder como hint, no como label'],
  ['Placeholder como \u00fanico indicador del campo', 'Bordes rojos sin mensaje de error'],
  (mx, my) => {
    // Label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.slate700);
    doc.text('Nombre', mx + 5, my + 5);
    // Input normal
    mockInput(mx + 5, my + 7, 55);
    // Input focused
    setFill(C.white); setDraw(C.blueTag);
    doc.roundedRect(mx + 65, my + 7, 55, 8, 2, 2, 'FD');
    // ring
    setDraw([147,197,253]); doc.roundedRect(mx + 64, my + 6, 57, 10, 3, 3, 'D');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate800);
    doc.text('John Doe', mx + 68, my + 12.5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('normal', mx + 25, my + 18); doc.text(':focus', mx + 85, my + 18);
  }, 130, 20
);

componentCard(
  'Select / Dropdown',
  'Dropdown nativo estilizado. Misma base visual que text input.',
  `<select class="dm-select">
  <option value="">Seleccionar...</option>
  <option value="1">Opci\u00f3n 1</option>
</select>`,
  ['Opci\u00f3n vac\u00eda como placeholder', 'Ancho completo en forms, auto en filtros'],
  ['Selects con m\u00e1s de 15 opciones (usar autocomplete)'],
  (mx, my) => {
    // Select input
    setFill(C.slate50); setDraw(C.slate200);
    doc.roundedRect(mx + 5, my + 3, 80, 9, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate700);
    doc.text('Seleccionar...', mx + 9, my + 9);
    // Chevron down (drawn with lines)
    doc.setLineWidth(0.5); setDraw(C.slate400);
    doc.line(mx + 76, my + 6.5, mx + 79, my + 9.5);
    doc.line(mx + 79, my + 9.5, mx + 82, my + 6.5);
    doc.setLineWidth(0.2);
    // Dropdown expanded below
    setFill(C.white); setDraw(C.slate200);
    doc.roundedRect(mx + 5, my + 13, 80, 24, 2, 2, 'FD');
    // shadow sim
    setFill([235,238,245]);
    doc.roundedRect(mx + 6, my + 14, 80, 24, 2, 2, 'F');
    setFill(C.white); setDraw(C.slate200);
    doc.roundedRect(mx + 5, my + 13, 80, 24, 2, 2, 'FD');
    // options
    const opts = ['Opci\u00f3n 1', 'Opci\u00f3n 2', 'Opci\u00f3n 3'];
    opts.forEach((opt, i) => {
      const oy = my + 16 + i * 7;
      if (i === 1) { setFill(C.slate50); doc.rect(mx + 6, oy - 1, 78, 7, 'F'); } // hover
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6);
      setColor(i === 1 ? C.slate800 : C.slate600);
      doc.text(opt, mx + 10, oy + 3.5);
    });
    // labels
    doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate400);
    doc.text(':hover', mx + 65, my + 23.5);
  }, 90, 40
);

componentCard(
  'Search Input',
  'Input con \u00edcono de b\u00fasqueda izquierdo y bot\u00f3n clear derecho.',
  `<div class="relative">
  <input class="w-full pl-8 pr-8 py-2 text-sm rounded-lg
               border border-slate-200 bg-slate-50
               focus:outline-none focus:ring-2 focus:ring-blue-500
               placeholder-slate-400"
    placeholder="Buscar..." />
  <svg class="absolute left-2.5 top-1/2 -translate-y-1/2
              w-4 h-4 text-slate-400"><!-- search icon --></svg>
  <button class="absolute right-2 top-1/2 -translate-y-1/2
                 w-5 h-5 rounded-full bg-slate-200
                 hover:bg-slate-300 text-slate-500">X</button>
</div>`,
  ['Debounce de 300ms para b\u00fasquedas server-side', 'Icono de b\u00fasqueda siempre visible'],
  ['B\u00fasqueda sin debounce'],
  (mx, my) => {
    setFill(C.slate50); setDraw(C.slate200);
    doc.roundedRect(mx + 5, my + 3, 80, 8, 2, 2, 'FD');
    // search icon
    setDraw(C.slate400);
    doc.circle(mx + 11, my + 7, 2, 'D');
    doc.line(mx + 12.5, my + 8.5, mx + 14, my + 10);
    // text
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate400);
    doc.text('Buscar...', mx + 16, my + 8.5);
    // clear btn
    setFill(C.slate200);
    doc.circle(mx + 80, my + 7, 2.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5); setColor(C.slate500);
    doc.text('x', mx + 79.2, my + 8);
  }, 90, 14
);

componentCard(
  'Toggle / Switch',
  'Switch on/off para configuraciones. Animaci\u00f3n de transici\u00f3n.',
  `<button [class]="enabled ? 'bg-brand-blue' : 'bg-slate-300'"
  class="relative w-10 h-6 rounded-full transition-colors">
  <span [class]="enabled ? 'translate-x-4' : 'translate-x-0'"
    class="absolute top-1 left-1 w-4 h-4 bg-white
           rounded-full shadow transition-transform"></span>
</button>`,
  ['Label a la izquierda del toggle', 'Transici\u00f3n suave (200ms)'],
  ['Toggle sin label'],
  (mx, my) => {
    // OFF state
    setFill(C.slate300);
    doc.roundedRect(mx + 5, my + 3, 14, 8, 4, 4, 'F');
    setFill(C.white);
    doc.circle(mx + 10, my + 7, 3, 'F');
    // ON state
    setFill(C.blue);
    doc.roundedRect(mx + 30, my + 3, 14, 8, 4, 4, 'F');
    setFill(C.white);
    doc.circle(mx + 39, my + 7, 3, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('OFF', mx + 8, my + 14); doc.text('ON', mx + 34, my + 14);
  }, 50, 16
);

checkPage(25);
subSection('Estados de Validaci\u00f3n');

drawMockup((mx, my) => {
  // Error
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
  doc.text('Email', mx + 5, my + 5);
  setFill([254,242,242]); setDraw([252,165,165]);
  doc.roundedRect(mx + 5, my + 7, 55, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.red);
  doc.text('Campo requerido', mx + 5, my + 19);
  // Success
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
  doc.text('Email', mx + 70, my + 5);
  setFill(C.white); setDraw(C.emeraldBd);
  doc.roundedRect(mx + 70, my + 7, 55, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate800);
  doc.text('user@mail.com', mx + 73, my + 12.5);
  doc.setFontSize(5.5); setColor(C.emerald);
  doc.text('V\u00e1lido', mx + 70, my + 19);
}, 135, 22);

codeBlock(
`// Error state
border-red-300 focus:ring-red-500 bg-red-50
<p class="mt-1 text-xs text-red-600">Campo requerido</p>

// Success state
border-emerald-300 focus:ring-emerald-500

// Disabled
bg-slate-100 text-slate-400 cursor-not-allowed opacity-60`
);

// ════════════════════════════════════════════════════
// 7. CARDS & CONTAINERS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('7. Cards & Containers', 'cards');

componentCard(
  'Card B\u00e1sica',
  'Container principal para agrupar contenido. Fondo blanco, borde sutil, sombra m\u00ednima.',
  `<div class="dm-card p-4 sm:p-6">
  <h2 class="text-lg font-bold text-slate-800">T\u00edtulo</h2>
  <p class="text-sm text-slate-600 mt-2">Contenido...</p>
</div>`,
  ['Padding responsive (p-4 mobile, p-6 desktop)'],
  ['Cards dentro de cards (nesting)', 'Sombras fuertes (shadow-lg)'],
  (mx, my) => {
    mockCard(mx + 5, my + 2, 90, 22, (cx, cy) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.slate800);
      doc.text('T\u00edtulo de la Secci\u00f3n', cx + 5, cy + 8);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate600);
      doc.text('Contenido de la card con texto descriptivo', cx + 5, cy + 14);
      doc.text('y una segunda l\u00ednea de ejemplo.', cx + 5, cy + 19);
    });
  }, 100, 26
);

componentCard(
  'KPI / Stat Card',
  'Card con acento lateral de color, valor grande y trend opcional.',
  `<div class="dm-card p-5 flex items-start gap-4"
     style="border-left: 4px solid #2E75B6">
  <div class="flex-1">
    <p class="text-sm text-slate-500 font-medium">Total Ventas</p>
    <span class="text-2xl font-bold text-slate-800">1,245</span>
    <span class="text-xs text-emerald-600">+12%</span>
  </div>
</div>`,
  ['Border-left con color sem\u00e1ntico', 'Trend con flecha y color'],
  ['M\u00e1s de 4 KPI cards por fila'],
  (mx, my) => {
    const kw = 44, kh = 28;
    // Card 1 - Total Ventas
    mockCard(mx, my, kw, kh, (cx, cy) => {
      setFill(C.blue); doc.roundedRect(cx, cy, 2, kh, 1, 0, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate500);
      doc.text('Total Ventas', cx + 5, cy + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); setColor(C.slate800);
      doc.text('1,245', cx + 5, cy + 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate500);
      doc.text('unidades', cx + 28, cy + 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.emerald);
      // Draw up arrow manually
      setDraw(C.emerald); doc.setLineWidth(0.3);
      doc.line(cx + 6, cy + 23, cx + 7, cy + 21.5);
      doc.line(cx + 8, cy + 23, cx + 7, cy + 21.5);
      doc.line(cx + 7, cy + 21.5, cx + 7, cy + 24);
      doc.setLineWidth(0.2);
      doc.text('+12% vs mes anterior', cx + 9.5, cy + 24);
      // icon bg
      setFill(C.blueLt);
      doc.roundedRect(cx + 34, cy + 3, 8, 8, 2, 2, 'F');
    });
    // Card 2 - Pendientes
    mockCard(mx + kw + 4, my, kw, kh, (cx, cy) => {
      setFill(C.amber); doc.roundedRect(cx, cy, 2, kh, 1, 0, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate500);
      doc.text('Pendientes', cx + 5, cy + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); setColor(C.slate800);
      doc.text('38', cx + 5, cy + 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.red);
      // Draw down arrow manually
      setDraw(C.red); doc.setLineWidth(0.3);
      doc.line(cx + 6, cy + 22, cx + 7, cy + 24);
      doc.line(cx + 8, cy + 22, cx + 7, cy + 24);
      doc.line(cx + 7, cy + 24, cx + 7, cy + 21.5);
      doc.setLineWidth(0.2);
      doc.text('-5% vs mes anterior', cx + 9.5, cy + 24);
      setFill(C.amberLt);
      doc.roundedRect(cx + 34, cy + 3, 8, 8, 2, 2, 'F');
    });
    // Card 3 - Completados
    mockCard(mx + (kw + 4) * 2, my, kw, kh, (cx, cy) => {
      setFill(C.emerald); doc.roundedRect(cx, cy, 2, kh, 1, 0, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate500);
      doc.text('Completados', cx + 5, cy + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); setColor(C.slate800);
      doc.text('892', cx + 5, cy + 18);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate500);
      // Draw right arrow manually
      setDraw(C.slate500); doc.setLineWidth(0.3);
      doc.line(cx + 5.5, cy + 23, cx + 8, cy + 23);
      doc.line(cx + 7, cy + 22, cx + 8, cy + 23);
      doc.line(cx + 7, cy + 24, cx + 8, cy + 23);
      doc.setLineWidth(0.2);
      doc.text('0% sin cambios', cx + 9.5, cy + 24);
      setFill(C.emeraldLt);
      doc.roundedRect(cx + 34, cy + 3, 8, 8, 2, 2, 'F');
    });
  }, 140, 30
);

componentCard(
  'Filters Bar',
  'Barra superior de filtros con layout responsive.',
  `<div class="dm-filters-bar">
  <div class="flex flex-col sm:flex-row sm:items-center gap-3">
    <h1 class="dm-page-title">T\u00edtulo</h1>
    <div class="flex-1"></div>
    <search-bar />
    <select class="dm-select">...</select>
    <button class="dm-btn-primary">Exportar</button>
  </div>
</div>`,
  ['T\u00edtulo a la izquierda, acciones a la derecha'],
  ['M\u00e1s de 5 filtros visibles (usar collapsible)'],
  (mx, my) => {
    mockCard(mx + 2, my + 2, 136, 16, (cx, cy) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.slate800);
      doc.text('T\u00edtulo de P\u00e1gina', cx + 5, cy + 10);
      // search
      setFill(C.slate50); setDraw(C.slate200);
      doc.roundedRect(cx + 55, cy + 5, 35, 7, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
      doc.text('Buscar...', cx + 59, cy + 9.5);
      // select
      doc.roundedRect(cx + 93, cy + 5, 20, 7, 2, 2, 'FD');
      doc.text('Estado', cx + 95, cy + 9.5);
      // btn
      mockBtn(cx + 116, cy + 5, 18, 7, C.emerald600, 'Export', C.white);
    });
  }, 140, 20
);

componentCard(
  'Secci\u00f3n Collapsible',
  'Secci\u00f3n con header clickeable que expande/contrae contenido.',
  `<div class="dm-card">
  <button class="w-full flex items-center justify-between p-4
                 hover:bg-slate-50 transition-colors">
    <span class="font-semibold text-slate-800">Secci\u00f3n</span>
    <svg class="w-5 h-5 text-slate-400
                transition-transform duration-200"
      [class.rotate-180]="expanded"><!-- chevron --></svg>
  </button>
  @if (expanded) {
    <div class="px-4 pb-4 border-t border-slate-100">...</div>
  }
</div>`,
  ['Transici\u00f3n en el \u00edcono chevron', 'Border-t para separar header de contenido'],
  ['Animar con height (mejor usar @if)'],
  (mx, my) => {
    // collapsed
    mockCard(mx + 2, my + 2, 55, 12, (cx, cy) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.slate800);
      doc.text('Secci\u00f3n A', cx + 4, cy + 8);
      // Draw right-pointing triangle (collapsed chevron)
      setFill(C.slate400);
      doc.triangle(cx + 48, cy + 5.5, cx + 48, cy + 8.5, cx + 50.5, cy + 7, 'F');
    });
    // expanded
    mockCard(mx + 62, my + 2, 55, 22, (cx, cy) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.slate800);
      doc.text('Secci\u00f3n B', cx + 4, cy + 8);
      // Draw down-pointing triangle (expanded chevron)
      setFill(C.slate400);
      doc.triangle(cx + 47, cy + 6, cx + 50.5, cy + 6, cx + 48.75, cy + 8.5, 'F');
      setDraw(C.slate100); doc.line(cx + 3, cy + 11, cx + 52, cy + 11);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate600);
      doc.text('Contenido expandido...', cx + 4, cy + 17);
    });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('colapsado', mx + 16, my + 28); doc.text('expandido', mx + 80, my + 28);
  }, 120, 30
);

// ════════════════════════════════════════════════════
// 8. TABLES
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('8. Tablas', 'tables');

componentCard(
  'Tabla Est\u00e1ndar',
  'Tabla con headers uppercase, filas zebra, hover state y texto compacto.',
  `<div class="dm-card overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr class="border-b border-slate-200">
        <th class="dm-table-header text-left px-4 py-3">COL</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100
                 hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 text-sm text-slate-700">Valor</td>
      </tr>
    </tbody>
  </table>
</div>`,
  ['overflow-x-auto para tablas anchas', 'Zebra stripes o hover:bg-slate-50', 'Header sticky si la tabla es larga'],
  ['Tablas sin card wrapper', 'Bordes internos gruesos'],
  (mx, my) => {
    const tw = 140, rh = 8;
    mockCard(mx, my, tw, 50, (cx, cy) => {
      // Header row
      setFill(C.slate100); doc.rect(cx + 1, cy + 1, tw - 2, rh, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate500);
      doc.text('NOMBRE', cx + 5, cy + 6);
      doc.text('CATEGOR\u00cdA', cx + 42, cy + 6);
      doc.text('ESTADO', cx + 72, cy + 6);
      doc.text('FECHA', cx + 100, cy + 6);
      doc.text('ACCI\u00d3N', cx + 122, cy + 6);
      setDraw(C.slate200); doc.line(cx + 1, cy + rh + 1, cx + tw - 1, cy + rh + 1);

      // Data rows
      const rows = [
        ['Acme Corp.', 'Empresa', C.emeraldLt, C.emerald, C.emeraldBd, 'Activo', '15/03/2026'],
        ['Mar\u00eda Garc\u00eda', 'Usuario', C.amberLt, C.amber, C.amberBd, 'Pendiente', '14/03/2026'],
        ['Orden #4521', 'Pedido', C.redLt, C.red, C.redBd, 'Error', '13/03/2026'],
        ['Reporte Q1', 'Documento', C.slateLt, C.slateTag, C.slateBd, 'Cerrado', '10/03/2026'],
        ['Proveedor X', 'Empresa', C.blueLt, C.blueTag, C.blueBd, 'En proceso', '09/03/2026'],
      ];
      rows.forEach(([name, cat, badgeBg, badgeC, badgeBd, status, date], ri) => {
        const ry = cy + rh + 2 + ri * rh;
        // zebra
        if (ri % 2 === 1) { setFill(C.slate50); doc.rect(cx + 1, ry, tw - 2, rh, 'F'); }
        // name (bold)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate800);
        doc.text(name, cx + 5, ry + 5.5);
        // category (chip)
        setFill(C.slate100);
        doc.roundedRect(cx + 42, ry + 1.5, cat.length * 2.2 + 4, 5, 2, 2, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate600);
        doc.text(cat, cx + 44, ry + 5);
        // status badge (fixed width for alignment)
        const bw = 22;
        setFill(badgeBg); setDraw(badgeBd);
        doc.roundedRect(cx + 72, ry + 1.5, bw, 5, 2.5, 2.5, 'FD');
        setFill(badgeC); doc.circle(cx + 75, ry + 4, 0.8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5); setColor(badgeC);
        doc.text(status, cx + 77.5, ry + 5);
        // date
        doc.setFont('courier', 'normal'); doc.setFontSize(5); setColor(C.slate500);
        doc.text(date, cx + 100, ry + 5.5);
        // action link
        doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.blue);
        doc.text('Ver', cx + 124, ry + 5.5);
        doc.text('\u00b7', cx + 131, ry + 5.5);
        setColor(C.red);
        doc.text('Del', cx + 134, ry + 5.5);
        // row divider
        setDraw(C.slate100); doc.line(cx + 1, ry + rh, cx + tw - 1, ry + rh);
      });
    });
  }, 142, 52
);

componentCard(
  'Tabla Agrupada',
  'Filas agrupadas con header de grupo colapsable.',
  `<!-- Group header -->
<tr class="bg-slate-50 cursor-pointer">
  <td colspan="5" class="px-4 py-2">
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-slate-400
                  transition-transform"
        [class.rotate-90]="expanded"><!-- chevron --></svg>
      <span class="text-sm font-semibold">Grupo A</span>
      <span class="text-xs text-slate-400">(12 items)</span>
    </div>
  </td>
</tr>
<!-- Group rows (indented) -->
<tr><td class="pl-10">...</td></tr>`,
  ['Chevron con transici\u00f3n rotate', 'Count de items en el grupo header'],
  ['M\u00e1s de 3 niveles de anidamiento'],
  (mx, my) => {
    mockCard(mx + 2, my + 2, 100, 30, (cx, cy) => {
      // group header
      setFill(C.slate50); doc.rect(cx + 1, cy + 1, 98, 8, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
      // Draw down-pointing triangle (group chevron)
      setFill(C.slate400);
      doc.triangle(cx + 4, cy + 4, cx + 7, cy + 4, cx + 5.5, cy + 6.5, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate800);
      doc.text('Grupo A', cx + 10, cy + 6);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
      doc.text('(3 items)', cx + 30, cy + 6);
      // indented rows
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate600);
      doc.text('Item A-1', cx + 14, cy + 14);
      doc.text('Item A-2', cx + 14, cy + 20);
      doc.text('Item A-3', cx + 14, cy + 26);
      setDraw(C.slate100);
      doc.line(cx + 12, cy + 16, cx + 96, cy + 16);
      doc.line(cx + 12, cy + 22, cx + 96, cy + 22);
    });
  }, 106, 34
);

// ════════════════════════════════════════════════════
// 9. NAVIGATION
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('9. Navegaci\u00f3n', 'nav');

componentCard(
  'Top Navbar',
  'Header fijo con logo, nav items y acciones. Fondo navy.',
  `<nav class="fixed top-0 inset-x-0 z-40 h-14
            bg-brand-navy flex items-center px-4 sm:px-6">
  <span class="text-white font-bold text-lg">Logo</span>
  <div class="flex-1"></div>
  <div class="flex items-center gap-3">
    <button class="text-white/70 hover:text-white p-2">
      ...
    </button>
    <div class="w-8 h-8 rounded-full bg-white/20 text-white
                flex items-center justify-center text-sm
                font-semibold">JD</div>
  </div>
</nav>`,
  ['z-40 para estar sobre el contenido', '\u00cdconos con opacity 70% -> 100% on hover'],
  ['Navbar sin posici\u00f3n fija en apps con scroll'],
  (mx, my) => {
    setFill(C.navy);
    doc.roundedRect(mx, my + 2, 140, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.white);
    doc.text('DIVEMOTOR', mx + 5, my + 9.5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5);
    setColor([180,200,220]);
    doc.text('Dashboard', mx + 45, my + 9.5);
    doc.text('Reportes', mx + 68, my + 9.5);
    doc.text('Config', mx + 88, my + 9.5);
    // avatar
    setFill([60,90,130]);
    doc.circle(mx + 132, my + 8, 4, 'F');
    setColor(C.white); doc.setFontSize(5);
    doc.text('JD', mx + 130.5, my + 9.2);
  }, 140, 16
);

componentCard(
  'Sidebar',
  'Panel lateral con nav items, \u00edconos y secci\u00f3n activa destacada.',
  `<aside class="w-60 bg-white border-r border-slate-200
              h-screen flex flex-col">
  <nav class="flex-1 p-3 space-y-1">
    <a class="flex items-center gap-3 px-3 py-2 rounded-lg
              text-sm font-medium bg-brand-light
              text-brand-navy">Dashboard <!-- active --></a>
    <a class="flex items-center gap-3 px-3 py-2 rounded-lg
              text-sm text-slate-600
              hover:bg-slate-100">Reportes</a>
  </nav>
</aside>`,
  ['Active: bg-brand-light + text-brand-navy', 'Hover: bg-slate-100'],
  ['Sidebar sin estado activo visible'],
  (mx, my) => {
    mockCard(mx + 2, my + 2, 40, 38, (cx, cy) => {
      // active item
      setFill(C.blueLight);
      doc.roundedRect(cx + 3, cy + 4, 34, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.navy);
      doc.text('Dashboard', cx + 6, cy + 8.5);
      // items
      doc.setFont('helvetica', 'normal'); setColor(C.slate600);
      doc.text('Reportes', cx + 6, cy + 17);
      doc.text('Usuarios', cx + 6, cy + 24);
      doc.text('Config', cx + 6, cy + 31);
    });
  }, 46, 42
);

componentCard(
  'Tabs',
  'Navegaci\u00f3n horizontal con tabs. Border-bottom como indicador activo.',
  `<div class="flex border-b border-slate-200">
  <button class="px-4 py-2.5 text-sm font-medium -mb-px
                 border-b-2 border-brand-blue text-brand-blue">
    Tab Activo</button>
  <button class="px-4 py-2.5 text-sm text-slate-500 -mb-px
                 border-b-2 border-transparent
                 hover:text-slate-700
                 hover:border-slate-300">Tab Inactivo</button>
</div>`,
  ['-mb-px para solapar el border del container'],
  ['Tabs como navegaci\u00f3n de p\u00e1gina (usar routing)'],
  (mx, my) => {
    setDraw(C.slate200); doc.line(mx + 2, my + 12, mx + 130, my + 12);
    // active tab
    setDraw(C.blue); doc.setLineWidth(0.8);
    doc.line(mx + 5, my + 12, mx + 35, my + 12);
    doc.setLineWidth(0.2);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.blue);
    doc.text('General', mx + 12, my + 9);
    // inactive tabs
    doc.setFont('helvetica', 'normal'); setColor(C.slate500);
    doc.text('Detalles', mx + 43, my + 9);
    doc.text('Historial', mx + 70, my + 9);
    doc.text('Config', mx + 100, my + 9);
  }, 135, 15
);

componentCard(
  'Breadcrumbs',
  'Trail de navegaci\u00f3n con separadores chevron.',
  `<nav class="flex items-center gap-1.5 text-sm">
  <a class="text-slate-500 hover:text-brand-blue">Inicio</a>
  <svg class="w-4 h-4 text-slate-400"><!-- > --></svg>
  <span class="text-slate-800 font-medium">P\u00e1gina Actual</span>
</nav>`,
  ['\u00daltimo item sin link, font-medium'],
  ['M\u00e1s de 4 niveles sin truncar'],
  (mx, my) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate500);
    doc.text('Inicio', mx + 5, my + 8);
    // Draw breadcrumb chevron (small ">")
    setDraw(C.slate400); doc.setLineWidth(0.3);
    doc.line(mx + 20, my + 6.5, mx + 21.5, my + 8);
    doc.line(mx + 21.5, my + 8, mx + 20, my + 9.5);
    doc.setLineWidth(0.2);
    setColor(C.slate500); doc.text('Secci\u00f3n', mx + 25, my + 8);
    // Draw breadcrumb chevron
    setDraw(C.slate400); doc.setLineWidth(0.3);
    doc.line(mx + 42, my + 6.5, mx + 43.5, my + 8);
    doc.line(mx + 43.5, my + 8, mx + 42, my + 9.5);
    doc.setLineWidth(0.2);
    doc.setFont('helvetica', 'bold'); setColor(C.slate800);
    doc.text('P\u00e1gina Actual', mx + 47, my + 8);
  }, 90, 12
);

// ════════════════════════════════════════════════════
// 10. BADGES & TAGS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('10. Badges & Tags', 'badges');

componentCard(
  'Status Badge (con dot)',
  'Pill con dot de color + label. Para estados del sistema.',
  `<span class="inline-flex items-center px-2 py-0.5
             rounded-full text-xs font-semibold border
             bg-st-success-light text-st-success
             border-st-success-border">
  <span class="w-1.5 h-1.5 rounded-full bg-st-success mr-1.5"></span>
  Activo
</span>

<!-- Animated (live states) -->
<span class="... animate-pulse mr-1.5"></span>`,
  ['animate-pulse solo en estados que requieren atenci\u00f3n'],
  ['Animar dots de estados finales'],
  (mx, my) => {
    let bx = mx + 5;
    bx += mockBadge(bx, my + 4, C.emerald, C.emeraldLt, 'Activo') + 3;
    bx += mockBadge(bx, my + 4, C.amber, C.amberLt, 'Pendiente') + 3;
    bx += mockBadge(bx, my + 4, C.red, C.redLt, 'Error') + 3;
    mockBadge(bx, my + 4, C.slateTag, C.slateLt, 'Cerrado');
  }, 120, 12
);

componentCard(
  'Counter Badge',
  'N\u00famero en pill peque\u00f1a. Para notificaciones y conteos.',
  `<!-- Notification -->
<span class="inline-flex items-center justify-center w-5 h-5
             rounded-full bg-red-500 text-white text-[10px]
             font-bold">3</span>

<!-- Inline stat -->
<span class="dm-stat-badge bg-slate-100 text-slate-700">245</span>`,
  ['Tama\u00f1o m\u00ednimo w-5 h-5 para legibilidad'],
  ['Counters mayores a 99 sin truncar (usar "99+")'],
  (mx, my) => {
    // notification
    setFill(C.red); doc.circle(mx + 10, my + 7, 3.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.white);
    doc.text('3', mx + 9, my + 8.5);
    // stat badge
    setFill(C.slate100); doc.roundedRect(mx + 22, my + 3.5, 14, 6, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
    doc.text('245', mx + 25.5, my + 7.8);
    // 99+
    setFill(C.red); doc.circle(mx + 48, my + 7, 3.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5); setColor(C.white);
    doc.text('99+', mx + 45.5, my + 8.2);
  }, 60, 14
);

componentCard(
  'Tag / Chip',
  'Etiqueta removible para categor\u00edas, filtros activos.',
  `<!-- Static tag -->
<span class="dm-chip">Categor\u00eda A</span>

<!-- Removable -->
<span class="inline-flex items-center gap-1 px-2.5 py-1
             text-xs font-medium rounded-full
             bg-blue-50 text-blue-700">
  Filtro activo
  <button class="w-3.5 h-3.5 rounded-full hover:bg-blue-200
                 flex items-center justify-center">
    <svg class="w-3 h-3"><!-- x --></svg>
  </button>
</span>`,
  ['bg tenue + texto fuerte del mismo color', 'L\u00edmite visual: max 3 tags visibles + "+N m\u00e1s"'],
  ['Tags con colores sin significado'],
  (mx, my) => {
    // static chip
    setFill(C.slate100); setDraw(C.slate200);
    doc.roundedRect(mx + 5, my + 4, 28, 6, 3, 3, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate600);
    doc.text('Categor\u00eda A', mx + 8, my + 8.2);
    // removable
    setFill(C.blueLt); setDraw(C.blueBd);
    doc.roundedRect(mx + 38, my + 4, 32, 6, 3, 3, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor([29,78,216]);
    doc.text('Filtro activo', mx + 40, my + 8.2);
    setFill([191,219,254]);
    doc.circle(mx + 66, my + 7, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5); setColor([29,78,216]);
    doc.text('x', mx + 65.3, my + 8);
  }, 80, 14
);

// ════════════════════════════════════════════════════
// 11. ALERTS & NOTIFICATIONS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('11. Alertas & Notificaciones', 'alerts');

componentCard(
  'Alerta Inline',
  'Mensaje contextual dentro del flujo de la p\u00e1gina.',
  `<div class="flex items-start gap-3 p-4 rounded-lg
            bg-st-warning-light border border-st-warning-border">
  <svg class="w-5 h-5 text-st-warning shrink-0 mt-0.5">
    <!-- alert-triangle --></svg>
  <div>
    <p class="text-sm font-semibold text-amber-800">Atenci\u00f3n</p>
    <p class="text-sm text-amber-700 mt-1">Mensaje...</p>
  </div>
  <button class="ml-auto text-amber-500 hover:text-amber-700">X</button>
</div>`,
  ['\u00cdcono alineado al inicio', 'Bot\u00f3n dismiss opcional'],
  ['Alertas sin \u00edcono', 'M\u00e1s de 2 alertas visibles a la vez'],
  (mx, my) => {
    const aw = 130; // alert width
    // ── Warning alert (full width, stacked) ──
    setFill(C.amberLt); setDraw(C.amberBd);
    doc.roundedRect(mx + 5, my + 1, aw, 18, 3, 3, 'FD');
    // icon container
    setFill(C.amber);
    doc.roundedRect(mx + 10, my + 5, 8, 8, 2, 2, 'F');
    // triangle icon
    setFill(C.white);
    doc.triangle(mx + 14, my + 7.5, mx + 11.5, my + 11.5, mx + 16.5, my + 11.5, 'F');
    // text
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor([146,64,14]);
    doc.text('Atenci\u00f3n', mx + 22, my + 9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor([180,83,9]);
    doc.text('Este proceso puede tardar varios minutos. No cierre la ventana.', mx + 22, my + 14.5);
    // close button
    setFill(C.amberLt); setDraw(C.amberBd);
    doc.roundedRect(mx + aw - 3, my + 4, 6, 6, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor([180,83,9]);
    doc.text('x', mx + aw - 0.8, my + 8.2);

    // ── Error alert ──
    setFill(C.redLt); setDraw(C.redBd);
    doc.roundedRect(mx + 5, my + 22, aw, 18, 3, 3, 'FD');
    // icon container
    setFill(C.red);
    doc.roundedRect(mx + 10, my + 26, 8, 8, 2, 2, 'F');
    setFill(C.white);
    doc.circle(mx + 14, my + 30, 3.2, 'F');
    setFill(C.red);
    doc.circle(mx + 14, my + 30, 2.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.white);
    doc.text('!', mx + 13.5, my + 31.5);
    // text
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor([153,27,27]);
    doc.text('Error al procesar', mx + 22, my + 30);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor([185,28,28]);
    doc.text('No se pudo completar la operaci\u00f3n. Intente nuevamente.', mx + 22, my + 35.5);
    // close
    setFill(C.redLt); setDraw(C.redBd);
    doc.roundedRect(mx + aw - 3, my + 25, 6, 6, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor([185,28,28]);
    doc.text('x', mx + aw - 0.8, my + 29.2);

    // ── Success alert ──
    setFill(C.emeraldLt); setDraw(C.emeraldBd);
    doc.roundedRect(mx + 5, my + 43, aw, 18, 3, 3, 'FD');
    setFill(C.emerald);
    doc.roundedRect(mx + 10, my + 47, 8, 8, 2, 2, 'F');
    // checkmark
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setColor(C.white);
    // Draw checkmark manually (unicode not supported)
    setDraw(C.white); doc.setLineWidth(0.5);
    doc.line(mx + 12, my + 52, mx + 13.2, my + 53.5);
    doc.line(mx + 13.2, my + 53.5, mx + 16, my + 50);
    doc.setLineWidth(0.2);
    // text
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor([6,95,70]);
    doc.text('\u00c9xito', mx + 22, my + 51);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor([22,101,52]);
    doc.text('Los datos se guardaron correctamente.', mx + 22, my + 56.5);
    // close
    setFill(C.emeraldLt); setDraw(C.emeraldBd);
    doc.roundedRect(mx + aw - 3, my + 46, 6, 6, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor([22,101,52]);
    doc.text('x', mx + aw - 0.8, my + 50.2);
  }, 140, 64
);

componentCard(
  'Toast Notification',
  'Notificaci\u00f3n flotante temporal. Aparece arriba a la derecha.',
  `<div class="fixed top-4 right-4 z-50 flex items-center gap-3
            p-4 rounded-lg bg-white border border-slate-200
            shadow-lg max-w-sm animate-slideIn">
  <span class="w-2 h-8 rounded-full bg-st-success shrink-0"></span>
  <div class="flex-1">
    <p class="text-sm font-semibold text-slate-800">\u00c9xito</p>
    <p class="text-xs text-slate-500">Operaci\u00f3n completada</p>
  </div>
  <button class="text-slate-400 hover:text-slate-600">X</button>
</div>`,
  ['Auto-dismiss despu\u00e9s de 4-5 segundos', 'Accent bar lateral con color sem\u00e1ntico'],
  ['Toast que bloquea interacci\u00f3n'],
  (mx, my) => {
    // Shadow simulation (offset rectangle)
    setFill([220,225,235]);
    doc.roundedRect(mx + 27, my + 5, 90, 22, 3, 3, 'F');
    // Main toast card
    mockCard(mx + 25, my + 3, 90, 22, (cx, cy) => {
      // Green accent bar on the left
      setFill(C.emerald);
      doc.roundedRect(cx + 2, cy + 4, 2.5, 14, 1.2, 1.2, 'F');
      // Checkmark icon in circle
      setFill(C.emeraldLt);
      doc.circle(cx + 12, cy + 11, 4.5, 'F');
      setFill(C.emerald);
      doc.circle(cx + 12, cy + 11, 3.5, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.white);
      // Draw checkmark manually (unicode not supported)
      setDraw(C.white); doc.setLineWidth(0.4);
      doc.line(cx + 10.5, cy + 12, cx + 11.5, cy + 13);
      doc.line(cx + 11.5, cy + 13, cx + 13.5, cy + 10.5);
      doc.setLineWidth(0.2);
      // Text content
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.slate800);
      doc.text('Guardado exitosamente', cx + 20, cy + 9);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate500);
      doc.text('Los cambios se aplicaron correctamente.', cx + 20, cy + 14);
      // Close button
      setFill(C.slate100);
      doc.roundedRect(cx + 78, cy + 5, 6, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); setColor(C.slate400);
      doc.text('x', cx + 80, cy + 9.5);
    });
  }, 140, 28
);

componentCard(
  'Empty State',
  'Vista cuando no hay datos. \u00cdcono grande, mensaje, CTA opcional.',
  `<div class="flex flex-col items-center justify-center
              py-16 text-center">
  <div class="w-16 h-16 rounded-full bg-slate-100
              flex items-center justify-center mb-4">
    <svg class="w-8 h-8 text-slate-400"><!-- inbox --></svg>
  </div>
  <p class="text-lg font-semibold text-slate-800">Sin resultados</p>
  <p class="text-sm text-slate-500 mt-1 max-w-sm">
    No se encontraron registros.</p>
  <button class="dm-btn-ghost mt-4">Limpiar filtros</button>
</div>`,
  ['\u00cdcono en c\u00edrculo bg-slate-100', 'CTA para resolver el estado vac\u00edo'],
  ['Solo texto "No hay datos" sin contexto'],
  (mx, my) => {
    const cx = mx + 65;
    // Large circle background
    setFill(C.slate100);
    doc.circle(cx, my + 12, 10, 'F');
    // Inbox icon (simplified)
    setDraw(C.slate400); setFill(C.white);
    doc.setLineWidth(0.5);
    doc.roundedRect(cx - 5, my + 8, 10, 7, 1, 1, 'FD');
    doc.line(cx - 5, my + 11, cx - 2, my + 13);
    doc.line(cx + 5, my + 11, cx + 2, my + 13);
    doc.setLineWidth(0.2);
    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setColor(C.slate800);
    doc.text('Sin resultados', cx, my + 28, { align: 'center' });
    // Description
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate500);
    doc.text('No se encontraron registros con los filtros actuales.', cx, my + 34, { align: 'center' });
    doc.text('Intente modificar los criterios de b\u00fasqueda.', cx, my + 39, { align: 'center' });
    // CTA button
    setFill(C.white); setDraw(C.slate200);
    doc.roundedRect(cx - 20, my + 43, 40, 8, 2.5, 2.5, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.slate600);
    doc.text('Limpiar filtros', cx, my + 48, { align: 'center' });
  }, 130, 54
);

// ════════════════════════════════════════════════════
// 12. MODALS & DRAWERS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('12. Modales & Drawers', 'modals');

componentCard(
  'Modal Est\u00e1ndar',
  'Di\u00e1logo centrado para formularios o informaci\u00f3n detallada.',
  `<div class="fixed inset-0 z-50 bg-black/50
            flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-lg
              max-h-[90vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4
                border-b border-slate-200">
      <h2 class="text-lg font-bold text-slate-800">T\u00edtulo</h2>
      <button class="w-8 h-8 rounded-lg hover:bg-slate-100
                     flex items-center justify-center
                     text-slate-400">X</button>
    </div>
    <!-- Body (scrollable) -->
    <div class="flex-1 overflow-y-auto px-6 py-4">...</div>
    <!-- Footer -->
    <div class="flex justify-end gap-3 px-6 py-4
                border-t border-slate-200">
      <button class="dm-btn-ghost">Cancelar</button>
      <button class="dm-btn-primary">Guardar</button>
    </div>
  </div>
</div>`,
  ['max-h-[90vh] + overflow-y-auto', 'Close con X + click backdrop + Escape'],
  ['Modal dentro de modal'],
  (mx, my) => {
    // backdrop (dark overlay simulation)
    setFill([180,185,195]); doc.roundedRect(mx, my, 140, 58, 2, 2, 'F');
    // Faint page content behind backdrop
    setFill([195,200,210]);
    doc.roundedRect(mx + 5, my + 3, 55, 5, 1, 1, 'F');
    doc.roundedRect(mx + 5, my + 10, 130, 4, 1, 1, 'F');

    // Modal card (centered, with shadow sim)
    setFill([210,215,225]);
    doc.roundedRect(mx + 23, my + 7, 96, 48, 4, 4, 'F');
    setFill(C.white); setDraw(C.slate200);
    doc.roundedRect(mx + 21, my + 5, 96, 48, 4, 4, 'FD');

    // Header
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setColor(C.slate800);
    doc.text('Nuevo Registro', mx + 27, my + 13);
    // Close button
    setFill(C.slate100);
    doc.roundedRect(mx + 105, my + 8, 7, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(C.slate400);
    doc.text('x', mx + 107, my + 13.5);
    // header divider
    setDraw(C.slate200); doc.line(mx + 23, my + 17, mx + 115, my + 17);

    // Body - form fields
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
    doc.text('Nombre', mx + 27, my + 22);
    setFill(C.slate50); setDraw(C.slate200);
    doc.roundedRect(mx + 27, my + 23.5, 82, 7, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate400);
    doc.text('Ingrese nombre completo...', mx + 30, my + 28);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
    doc.text('Email', mx + 27, my + 34);
    setFill(C.slate50); setDraw(C.slate200);
    doc.roundedRect(mx + 27, my + 35.5, 82, 7, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate400);
    doc.text('correo@ejemplo.com', mx + 30, my + 40);

    // Footer divider
    setDraw(C.slate200); doc.line(mx + 23, my + 45, mx + 115, my + 45);
    // Footer buttons
    setFill(C.white); setDraw(C.slate200);
    doc.roundedRect(mx + 82, my + 47, 18, 5, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate500);
    doc.text('Cancelar', mx + 84.5, my + 50.5);
    mockBtn(mx + 102, my + 47, 13, 5, C.emerald600, 'Guardar', C.white);
  }, 140, 58
);

componentCard(
  'Drawer (Panel Lateral)',
  'Panel que se desliza desde el borde. Ideal para detalles.',
  `<!-- Desktop: right slide. Mobile: bottom slide -->
<div class="fixed inset-0 z-50">
  <div class="absolute inset-0 bg-black/50"></div>
  <div class="absolute right-0 top-0 h-full w-full sm:w-96
              bg-white shadow-xl transition-transform duration-300
              dm-drawer-visible">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3
                border-b border-slate-200">
      <h2 class="font-bold text-slate-800">Detalle</h2>
      <button>X</button>
    </div>
    <!-- Tabs + Content -->
    <div class="overflow-y-auto p-4"
         style="max-height:calc(100vh-120px)">...</div>
  </div>
</div>`,
  ['Mobile: full-width desde abajo. Desktop: w-96 desde derecha'],
  ['Drawer sin backdrop clickeable'],
  (mx, my) => {
    // Page behind (with faded content)
    setFill([200,210,225]); doc.roundedRect(mx, my, 130, 52, 2, 2, 'F');
    // Faint table-like content on the left
    setFill([210,218,230]);
    doc.roundedRect(mx + 3, my + 3, 52, 4, 1, 1, 'F');
    doc.roundedRect(mx + 3, my + 9, 52, 3, 1, 1, 'F');
    doc.roundedRect(mx + 3, my + 14, 52, 3, 1, 1, 'F');
    doc.roundedRect(mx + 3, my + 19, 52, 3, 1, 1, 'F');

    // Drawer panel (right side, with shadow)
    setFill([210,215,225]);
    doc.rect(mx + 64, my + 1, 67, 51, 'F'); // shadow
    setFill(C.white); setDraw(C.slate200);
    doc.rect(mx + 62, my, 68, 52, 'FD');

    // Drawer header
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.slate800);
    doc.text('Detalle del Registro', mx + 66, my + 8);
    setFill(C.slate100);
    doc.roundedRect(mx + 120, my + 3, 6, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); setColor(C.slate400);
    doc.text('x', mx + 122, my + 7.5);
    setDraw(C.slate200); doc.line(mx + 63, my + 12, mx + 129, my + 12);

    // Tabs inside drawer
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.blue);
    doc.text('General', mx + 66, my + 17);
    doc.setFont('helvetica', 'normal'); setColor(C.slate400);
    doc.text('Historial', mx + 84, my + 17);
    doc.text('Archivos', mx + 102, my + 17);
    setDraw(C.blue); doc.setLineWidth(0.6);
    doc.line(mx + 65, my + 19, mx + 80, my + 19);
    doc.setLineWidth(0.2);
    setDraw(C.slate100); doc.line(mx + 63, my + 19, mx + 129, my + 19);

    // Content - key/value pairs
    const pairs = [
      ['C\u00f3digo', 'REG-001234'],
      ['Estado', null], // badge
      ['Fecha', '27/03/2026'],
      ['Responsable', 'Juan Delgado'],
    ];
    pairs.forEach(([k, v], i) => {
      const py = my + 24 + i * 7;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate400);
      doc.text(k, mx + 66, py);
      if (v) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate800);
        doc.text(v, mx + 95, py);
      } else {
        // inline badge for "Estado"
        setFill(C.emeraldLt); setDraw(C.emeraldBd);
        doc.roundedRect(mx + 95, py - 3, 18, 5, 2.5, 2.5, 'FD');
        setFill(C.emerald); doc.circle(mx + 98, py - 0.5, 0.8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5); setColor(C.emerald);
        doc.text('Activo', mx + 100.5, py);
      }
    });
  }, 130, 54
);

// ════════════════════════════════════════════════════
// 13. TOOLTIPS & POPOVERS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('13. Tooltips & Popovers', 'tooltips');

componentCard(
  'Tooltip Simple',
  'Texto flotante al hacer hover. Para hints cortos (m\u00e1x 1 l\u00ednea).',
  `<div class="relative group">
  <button>Hover me</button>
  <div class="absolute bottom-full left-1/2 -translate-x-1/2
              mb-2 hidden group-hover:block z-20
              bg-slate-800 text-white text-xs rounded-lg
              px-3 py-1.5 whitespace-nowrap pointer-events-none">
    Texto del tooltip
  </div>
</div>`,
  ['Fondo oscuro (slate-800) + texto blanco', 'pointer-events-none para evitar flicker'],
  ['Tooltips con contenido interactivo (usar popover)', 'Tooltips en mobile (no hay hover)'],
  (mx, my) => {
    // Tooltip (dark, above)
    setFill(C.slate800);
    doc.roundedRect(mx + 25, my + 1, 55, 8, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); setColor(C.white);
    doc.text('Exportar datos a formato CSV', mx + 29, my + 6.5);
    // Arrow/caret pointing down
    setFill(C.slate800);
    doc.triangle(mx + 50, my + 9, mx + 53, my + 12, mx + 56, my + 9, 'F');

    // Button trigger below
    setFill(C.emerald600); setDraw(C.emerald600);
    doc.roundedRect(mx + 38, my + 14, 30, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.white);
    doc.text('Exportar CSV', mx + 42, my + 19);

    // Label
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('hover', mx + 48, my + 26);
  }, 105, 28
);

componentCard(
  'Hover Card / Popover',
  'Card flotante con contenido enriquecido al hacer hover o click.',
  `<div class="fixed z-[100] bg-white border border-slate-200
            rounded-lg shadow-xl p-3 min-w-56 max-w-72
            pointer-events-none"
     [style.left.px]="posX" [style.top.px]="posY">
  <div class="flex items-center justify-between gap-2 mb-2">
    <span class="text-xs font-bold text-slate-800">T\u00edtulo</span>
    <span class="px-1.5 py-0.5 text-[10px] font-semibold
                 rounded-full bg-st-success-light
                 text-st-success">Estado</span>
  </div>
  <div class="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">...</div>
</div>`,
  ['position: fixed + coordenadas calculadas', 'shadow-xl para floating effect'],
  ['Hover cards en items muy peque\u00f1os (< 24px)'],
  (mx, my) => {
    mockCard(mx + 20, my + 2, 70, 30, (cx, cy) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6); setColor(C.slate800);
      doc.text('Detalle Item', cx + 4, cy + 7);
      mockBadge(cx + 42, cy + 3.5, C.emerald, C.emeraldLt, 'Activo');
      setDraw(C.slate100); doc.line(cx + 3, cy + 11, cx + 67, cy + 11);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate600);
      doc.text('Sub-item A', cx + 6, cy + 16);
      doc.text('Sub-item B', cx + 6, cy + 21);
      doc.text('Sub-item C', cx + 6, cy + 26);
      setFill(C.emerald); doc.circle(cx + 4, cy + 15, 0.8, 'F');
      setFill(C.amber); doc.circle(cx + 4, cy + 20, 0.8, 'F');
      setFill(C.slate300); doc.circle(cx + 4, cy + 25, 0.8, 'F');
      doc.setFont('courier', 'normal'); doc.setFontSize(5); setColor(C.slate500);
      doc.text('15/03', cx + 52, cy + 16);
      doc.text('14/03', cx + 52, cy + 21);
      doc.text('-', cx + 55, cy + 26);
    });
  }, 110, 34
);

componentCard(
  'Dropdown Menu',
  'Men\u00fa desplegable de acciones al hacer click.',
  `<div class="absolute right-0 top-full mt-1 z-30
            bg-white border border-slate-200 rounded-lg
            shadow-lg py-1 min-w-[160px]">
  <button class="w-full text-left px-4 py-2 text-sm
                 text-slate-700 hover:bg-slate-50">Editar</button>
  <div class="border-t border-slate-100 my-1"></div>
  <button class="w-full text-left px-4 py-2 text-sm
                 text-red-600 hover:bg-red-50">Eliminar</button>
</div>`,
  ['Divider entre grupos de acciones', 'Acci\u00f3n destructiva en rojo al final'],
  ['Sin close-on-click-outside'],
  (mx, my) => {
    // trigger
    setFill(C.slate100); setDraw(C.slate200);
    doc.roundedRect(mx + 40, my + 2, 8, 6, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.slate500);
    doc.text('...', mx + 42, my + 6.5);
    // dropdown
    mockCard(mx + 30, my + 10, 40, 22, (cx, cy) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate700);
      doc.text('Editar', cx + 5, cy + 6);
      doc.text('Duplicar', cx + 5, cy + 12);
      setDraw(C.slate100); doc.line(cx + 3, cy + 14, cx + 37, cy + 14);
      setColor(C.red); doc.text('Eliminar', cx + 5, cy + 19);
    });
  }, 80, 34
);

// ════════════════════════════════════════════════════
// 14. LOADERS & SKELETONS
// ════════════════════════════════════════════════════
sectionTitle('14. Loaders & Skeletons', 'loaders');

componentCard(
  'Spinner',
  'Loader circular animado para acciones async.',
  `<svg class="animate-spin w-5 h-5 text-brand-blue" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="currentColor"
          stroke-width="4" class="opacity-25" />
  <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        fill="currentColor" class="opacity-75" />
</svg>

// Sizes: w-4 h-4 (inline), w-5 h-5 (button), w-8 h-8 (page)`,
  ['Tama\u00f1o proporcional al contexto', 'Color brand-blue o white (en botones)'],
  ['Spinner gigante sin texto'],
  (mx, my) => {
    // small - circle track + partial fill
    setDraw(C.slate200); doc.circle(mx + 15, my + 8, 3, 'D');
    // Draw spinners as circle track + partial filled wedge
    const spinners = [
      [15, 3, 'sm (16px)', 0.6],
      [40, 4.5, 'md (20px)', 0.8],
      [70, 6, 'lg (32px)', 1],
    ];
    spinners.forEach(([cx, r, label, lw]) => {
      const x = mx + cx, yy = my + 9;
      // Full circle track (light)
      setDraw(C.slate200); doc.setLineWidth(lw);
      doc.circle(x, yy, r, 'D');
      // Partial arc (blue) - simulate with 3 line segments forming quarter arc
      setDraw(C.blue); doc.setLineWidth(lw + 0.3);
      const steps = 6;
      for (let i = 0; i < steps; i++) {
        const a1 = (Math.PI * 2 * i) / (steps * 3) - Math.PI / 2;
        const a2 = (Math.PI * 2 * (i + 1)) / (steps * 3) - Math.PI / 2;
        doc.line(x + Math.cos(a1) * r, yy + Math.sin(a1) * r,
                 x + Math.cos(a2) * r, yy + Math.sin(a2) * r);
      }
      doc.setLineWidth(0.2);
      // label
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate500);
      doc.text(label, x, yy + r + 5, { align: 'center' });
    });
    // Loading text example
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate400);
    doc.text('animate-spin', mx + 105, my + 10, { align: 'center' });
  }, 120, 22
);

componentCard(
  'Skeleton Loader',
  'Placeholder animado mientras carga el contenido real.',
  `<!-- Card skeleton -->
<div class="dm-card p-4 animate-pulse">
  <div class="h-6 w-32 bg-slate-200 rounded mb-3"></div>
  <div class="h-10 w-20 bg-slate-200 rounded mb-2"></div>
  <div class="h-3 w-24 bg-slate-200 rounded"></div>
</div>`,
  ['animate-pulse con bg-slate-200', 'Matching la estructura del contenido real'],
  ['Skeleton que no matchea el layout final'],
  (mx, my) => {
    // ── Skeleton (loading state) ──
    mockCard(mx + 2, my, 60, 28, (cx, cy) => {
      // Simulate animate-pulse with lighter color
      setFill(C.slate200);
      doc.roundedRect(cx + 4, cy + 5, 28, 3.5, 1.5, 1.5, 'F');  // title
      doc.roundedRect(cx + 4, cy + 12, 18, 6, 1.5, 1.5, 'F');    // big number
      doc.roundedRect(cx + 4, cy + 21, 32, 2.5, 1, 1, 'F');       // trend
      // icon placeholder
      setFill(C.slate100);
      doc.roundedRect(cx + 46, cy + 4, 10, 10, 2, 2, 'F');
      // pulse label
      doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate400);
      doc.text('animate-pulse', cx + 10, cy + 27);
    });

    // Arrow transition
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setColor(C.slate300);
    // Draw right arrow manually (skeleton transition)
    setDraw(C.slate300); doc.setLineWidth(0.5);
    doc.line(mx + 64, my + 15.5, mx + 69, my + 15.5);
    doc.line(mx + 67.5, my + 13.5, mx + 69, my + 15.5);
    doc.line(mx + 67.5, my + 17.5, mx + 69, my + 15.5);
    doc.setLineWidth(0.2);

    // ── Real content (loaded state) ──
    mockCard(mx + 74, my, 60, 28, (cx, cy) => {
      setFill(C.blue); doc.roundedRect(cx, cy, 2, 28, 1, 0, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); setColor(C.slate500);
      doc.text('Total Ventas', cx + 5, cy + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); setColor(C.slate800);
      doc.text('1,245', cx + 5, cy + 17);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.emerald);
      // Draw up arrow manually
      setDraw(C.emerald); doc.setLineWidth(0.3);
      doc.line(cx + 6, cy + 22, cx + 7, cy + 20.5);
      doc.line(cx + 8, cy + 22, cx + 7, cy + 20.5);
      doc.line(cx + 7, cy + 20.5, cx + 7, cy + 23);
      doc.setLineWidth(0.2);
      doc.text('+12% vs mes anterior', cx + 9.5, cy + 23);
      // icon
      setFill(C.blueLt);
      doc.roundedRect(cx + 46, cy + 4, 10, 10, 2, 2, 'F');
      setColor(C.blue); doc.setFontSize(8);
      // Draw star manually (5-point star using lines)
      setDraw(C.blue); setFill(C.blue); doc.setLineWidth(0.2);
      const sx = cx + 52, sy = cy + 8;
      doc.triangle(sx - 2.5, sy + 1.5, sx + 2.5, sy + 1.5, sx, sy - 2.5, 'F');
      doc.triangle(sx - 2.5, sy - 0.5, sx + 2.5, sy - 0.5, sx, sy + 3, 'F');
    });
  }, 136, 30
);

componentCard(
  'Progress Bar',
  'Barra horizontal de progreso con color sem\u00e1ntico.',
  `<div class="w-full bg-slate-200 rounded-full h-2">
  <div class="h-2 rounded-full bg-st-success
              transition-all duration-500"
       [style.width.%]="progress"></div>
</div>

// With label
<div class="flex items-center gap-3">
  <div class="flex-1 bg-slate-200 rounded-full h-2">...</div>
  <span class="text-xs font-medium text-slate-600 w-10">65%</span>
</div>`,
  ['h-2 para barras normales, h-1 para compactas', 'Color sem\u00e1ntico seg\u00fan el nivel'],
  ['Barras sin track (bg-slate-200)'],
  null
);

// ════════════════════════════════════════════════════
// 15. PAGINATION
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('15. Paginaci\u00f3n', 'pagination');

componentCard(
  'Paginador Est\u00e1ndar',
  'Info de paginaci\u00f3n + selector de tama\u00f1o de p\u00e1gina + botones prev/next.',
  `<div class="flex flex-col sm:flex-row items-start sm:items-center
            justify-between gap-2 px-4 py-3 dm-card">
  <div class="flex items-center gap-3">
    <span class="text-xs text-slate-500">
      P\u00e1gina 1 de 25 \u00b7 1,245 registros</span>
    <select class="text-xs rounded border border-slate-200
                   bg-white px-2 py-1 text-slate-600">
      <option>50 por p\u00e1gina</option>
    </select>
  </div>
  <div class="flex gap-2">
    <button class="px-3 py-1.5 text-xs rounded border
                   border-slate-200 bg-white text-slate-600
                   hover:bg-slate-100">\u2190 Anterior</button>
    <button class="...">Siguiente \u2192</button>
  </div>
</div>`,
  ['Ocultar "Anterior" en p\u00e1gina 1', 'Info: p\u00e1gina + total p\u00e1ginas + registros'],
  ['Paginaci\u00f3n sin info de total'],
  (mx, my) => {
    mockCard(mx + 2, my + 2, 136, 14, (cx, cy) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate500);
      doc.text('P\u00e1gina 1 de 25 \u00b7 1,245 registros', cx + 5, cy + 9);
      // select
      setFill(C.white); setDraw(C.slate200);
      doc.roundedRect(cx + 60, cy + 4.5, 22, 6, 1.5, 1.5, 'FD');
      doc.setFontSize(4.5); doc.text('50 por p\u00e1g', cx + 62, cy + 8.5);
      // buttons
      doc.roundedRect(cx + 95, cy + 4.5, 16, 6, 1.5, 1.5, 'FD');
      doc.roundedRect(cx + 113, cy + 4.5, 18, 6, 1.5, 1.5, 'FD');
      doc.setFontSize(5); setColor(C.slate600);
      doc.text('< Ant', cx + 97, cy + 8.5);
      doc.text('Sig >', cx + 116, cy + 8.5);
    });
  }, 140, 18
);

// ════════════════════════════════════════════════════
// 16. CHARTS & DATA VIZ
// ════════════════════════════════════════════════════
sectionTitle('16. Charts & Data Visualization', 'charts');

subSection('Paleta de Colores para Gr\u00e1ficos');
codeBlock(
`const chartColors = [
  '#2E75B6',  // brand blue (serie primaria)
  '#10B981',  // emerald (secundaria)
  '#F59E0B',  // amber
  '#EF4444',  // red
  '#8B5CF6',  // violet
  '#06B6D4',  // cyan
  '#F97316',  // orange
  '#F43F5E',  // rose
];`
);

subSection('Patr\u00f3n de Gantt');

drawMockup((mx, my) => {
  // labels
  doc.setFont('helvetica', 'normal'); doc.setFontSize(5); setColor(C.slate600);
  doc.text('Fase A', mx + 3, my + 6);
  doc.text('Fase B', mx + 3, my + 14);
  doc.text('Fase C', mx + 3, my + 22);
  // plan bars (ghost)
  setFill(C.slate200);
  doc.roundedRect(mx + 25, my + 3, 50, 4, 1, 1, 'F');
  doc.roundedRect(mx + 40, my + 11, 45, 4, 1, 1, 'F');
  doc.roundedRect(mx + 60, my + 19, 50, 4, 1, 1, 'F');
  // real bars
  setFill(C.emerald);
  doc.roundedRect(mx + 25, my + 3, 45, 4, 1, 1, 'F');
  setFill(C.amber);
  doc.roundedRect(mx + 40, my + 11, 35, 4, 1, 1, 'F');
  setFill(C.blueTag);
  doc.roundedRect(mx + 60, my + 19, 20, 4, 1, 1, 'F');
  // today line
  setDraw(C.red); doc.setLineDashPattern([1, 1], 0);
  doc.line(mx + 80, my + 1, mx + 80, my + 25);
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4); setColor(C.red);
  doc.text('hoy', mx + 78, my + 28);
}, 120, 30);

codeBlock(
`// Barra plan (ghost)
bg-slate-200 rounded h-4 opacity-50

// Barra real (color por estado)
bg-st-success  // en tiempo
bg-st-error    // demorado

// L\u00ednea "hoy"
border-l-2 border-red-400 border-dashed`
);

// ════════════════════════════════════════════════════
// 17. ICONS
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('17. \u00cdconos', 'icons');

subSection('Librer\u00eda de \u00cdconos');
bodyText('Librer\u00eda recomendada: Lucide Icons (lucide.dev). Consistente, open-source, tree-shakeable.');
bodyText('Alternativas: Heroicons, Phosphor Icons, Tabler Icons.');
y += 4;

subSection('Tama\u00f1os y Stroke');

drawMockup((mx, my) => {
  // size comparison with simple drawn icon (gear/cog simplified as hexagon)
  const sizes = [
    [14, 'XS', '14px', 3],
    [36, 'SM', '16px', 3.5],
    [60, 'MD', '20px', 4.5],
    [86, 'LG', '24px', 5.5],
    [116, 'XL', '32px', 7],
  ];
  sizes.forEach(([ox, name, px, r]) => {
    const cx = mx + ox, cy = my + 10;
    // Circle container
    setFill(C.slate100); setDraw(C.slate200);
    doc.circle(cx, cy, r + 1, 'FD');
    // Simple star icon drawn inside (scales with size)
    doc.setLineWidth(0.4); setDraw(C.slate600);
    // horizontal line
    doc.line(cx - r * 0.6, cy, cx + r * 0.6, cy);
    // vertical line
    doc.line(cx, cy - r * 0.6, cx, cy + r * 0.6);
    // diagonals
    const d = r * 0.4;
    doc.line(cx - d, cy - d, cx + d, cy + d);
    doc.line(cx + d, cy - d, cx - d, cy + d);
    doc.setLineWidth(0.2);
    // labels
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5); setColor(C.slate700);
    doc.text(name, cx, cy + r + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate400);
    doc.text(px, cx, cy + r + 9, { align: 'center' });
  });
}, 140, 26);

tableHeader([['TAMA\u00d1O', 3], ['PX', 18], ['CLASE', 33], ['USO', 65]]);
[
  ['XS', '14px', 'w-3.5 h-3.5', 'Dentro de badges, tags, inline'],
  ['SM', '16px', 'w-4 h-4', 'Botones compactos, nav items, inputs'],
  ['MD', '20px', 'w-5 h-5', 'Botones standard, sidebar items'],
  ['LG', '24px', 'w-6 h-6', 'Headers, action buttons grandes'],
  ['XL', '32px', 'w-8 h-8', 'Empty states, feature highlights'],
].forEach(([size, px, cls, uso], i) => {
  tableRow([
    [size, 3, 'helvetica', C.navy],
    [px, 18, 'courier', C.slate600],
    [cls, 33, 'courier', C.blue],
    [uso, 65, 'helvetica', C.slate700, 105],
  ], i);
});
y += 4;

codeBlock(
`// Stroke width est\u00e1ndar
strokeWidth: 1.5   // Default, limpio y legible
strokeWidth: 2     // Bold, para \u00e9nfasis (nav activo, CTAs)
strokeWidth: 2.5   // Extra bold, para checkmarks y X`
);

subSection('Colores de \u00cdconos');
bodyText('text-slate-400: decorativos, placeholder, disabled');
bodyText('text-slate-500: secundarios, nav inactivo');
bodyText('text-slate-700: funcionales activos');
bodyText('text-brand-blue: acci\u00f3n, links');
bodyText('text-white: fondos oscuros (navbar, botones)');
bodyText('Sem\u00e1nticos: text-st-success, text-st-error, text-st-warning');
y += 4;

subSection('Containers de \u00cdconos');

drawMockup((mx, my) => {
  const gap = 38;

  // ── 1. Filled circle (green check) ──
  setFill(C.emerald); doc.circle(mx + 15, my + 10, 7, 'F');
  // Draw a checkmark with lines
  doc.setLineWidth(1); setDraw(C.white);
  doc.line(mx + 11.5, my + 10, mx + 14, my + 13);
  doc.line(mx + 14, my + 13, mx + 19, my + 7);
  doc.setLineWidth(0.2);
  // label
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
  doc.text('Filled', mx + 15, my + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate400);
  doc.text('bg-emerald-500', mx + 15, my + 25, { align: 'center' });
  doc.text('text-white', mx + 15, my + 28.5, { align: 'center' });

  // ── 2. Outlined circle (blue user) ──
  const ox = mx + 15 + gap;
  setDraw(C.blueTag); setFill(C.white);
  doc.setLineWidth(0.6);
  doc.circle(ox, my + 10, 7, 'FD');
  // Draw a person icon (head + body)
  setFill(C.blueTag);
  doc.circle(ox, my + 7.5, 1.8, 'F');   // head
  // shoulders arc (simplified)
  doc.setLineWidth(0.6); setDraw(C.blueTag);
  doc.line(ox - 3.5, my + 14, ox - 2, my + 11.5);
  doc.line(ox + 3.5, my + 14, ox + 2, my + 11.5);
  doc.line(ox - 2, my + 11.5, ox + 2, my + 11.5);
  doc.setLineWidth(0.2);
  // label
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
  doc.text('Outlined', ox, my + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate400);
  doc.text('border-2 border-blue', ox, my + 25, { align: 'center' });
  doc.text('bg-white text-blue', ox, my + 28.5, { align: 'center' });

  // ── 3. Tinted square (bell icon) ──
  const tx = mx + 15 + gap * 2;
  setFill(C.blueLt);
  doc.roundedRect(tx - 7, my + 3, 14, 14, 3, 3, 'F');
  // Draw a bell icon
  doc.setLineWidth(0.6); setDraw(C.blue); setFill(C.blue);
  // bell body
  doc.line(tx - 3, my + 13, tx + 3, my + 13); // base
  doc.line(tx - 3, my + 13, tx - 3.5, my + 10);
  doc.line(tx + 3, my + 13, tx + 3.5, my + 10);
  doc.line(tx - 3.5, my + 10, tx - 2, my + 7);
  doc.line(tx + 3.5, my + 10, tx + 2, my + 7);
  doc.line(tx - 2, my + 7, tx + 2, my + 7);
  // bell top
  doc.circle(tx, my + 6.5, 0.8, 'F');
  // clapper
  doc.circle(tx, my + 14, 0.8, 'F');
  doc.setLineWidth(0.2);
  // label
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.slate700);
  doc.text('Tinted', tx, my + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate400);
  doc.text('bg-blue-50 rounded-lg', tx, my + 25, { align: 'center' });
  doc.text('text-blue-600', tx, my + 28.5, { align: 'center' });
}, 130, 32);

// ════════════════════════════════════════════════════
// 18. ANIMATIONS & TRANSITIONS
// ════════════════════════════════════════════════════
sectionTitle('18. Animaciones & Transiciones', 'anims');

subSection('Transiciones Est\u00e1ndar');
tableHeader([['CLASE', 3], ['DURACI\u00d3N', 50], ['USO', 82]]);
[
  ['transition-colors', '150ms (default)', 'Hover en botones, links, nav'],
  ['transition-all duration-200', '200ms', 'Cambios de tama\u00f1o + color'],
  ['transition-transform duration-200', '200ms', 'Chevron rotate, scale'],
  ['transition-transform duration-300', '300ms', 'Drawer slide, modal entrance'],
  ['transition-opacity duration-150', '150ms', 'Fade in/out de tooltips'],
].forEach(([cls, dur, uso], i) => {
  tableRow([
    [cls, 3, 'courier', C.blue],
    [dur, 50, 'helvetica', C.slate600],
    [uso, 82, 'helvetica', C.slate700, 88],
  ], i);
});
y += 4;

subSection('Keyframe Animations');
codeBlock(
`// Built-in Tailwind
animate-spin        // Spinners
animate-pulse       // Skeleton loaders, dots activos
animate-ping        // Indicadores de notificaci\u00f3n
animate-bounce      // Call to action (uso limitado)

// Custom
animate-pulse-slow  // pulse 2s cubic-bezier(0.4,0,0.6,1) infinite
slideInRight        // 0%: translateX(100%) -> 100%: translateX(0)
slideOutRight       // 0%: translateX(0) -> 100%: translateX(100%)`
);

subSection('Hover States');
codeBlock(
`hover:bg-slate-50     // Table rows
hover:bg-slate-100    // Ghost buttons, sidebar items
hover:bg-emerald-700  // Primary button
hover:opacity-90      // Brand button
hover:text-slate-700  // Ghost text
hover:text-brand-blue // Links
hover:border-slate-300// Tabs inactive
hover:shadow-md       // Card lift effect (uso limitado)`
);

// ════════════════════════════════════════════════════
// 19. LAYOUT & RESPONSIVE
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('19. Layout & Responsive', 'layout');

subSection('Estructura de P\u00e1gina');

drawMockup((mx, my) => {
  // navbar
  setFill(C.navy); doc.rect(mx, my + 1, 140, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5); setColor(C.white);
  doc.text('NAVBAR (z-40, fixed)', mx + 50, my + 6);
  // sidebar
  setFill(C.white); setDraw(C.slate200);
  doc.rect(mx, my + 9, 25, 36, 'FD');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate500);
  doc.text('SIDEBAR', mx + 3, my + 22);
  doc.text('w-60', mx + 5, my + 27);
  // main content
  setFill(C.slate50);
  doc.rect(mx + 25, my + 9, 115, 36, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5); setColor(C.slate500);
  doc.text('MAIN CONTENT', mx + 65, my + 18);
  doc.text('p-3 sm:p-6 max-w-[1600px] mx-auto', mx + 50, my + 24);
  // filters bar mock
  setFill(C.white); setDraw(C.slate200);
  doc.roundedRect(mx + 30, my + 28, 105, 6, 1, 1, 'FD');
  doc.setFontSize(4); doc.text('dm-filters-bar', mx + 65, my + 32);
  // card mock
  doc.roundedRect(mx + 30, my + 36, 105, 6, 1, 1, 'FD');
  doc.text('dm-card', mx + 72, my + 40);
}, 140, 48);

codeBlock(
`<div class="min-h-screen bg-slate-50">
  <nav class="fixed top-0 inset-x-0 z-40 h-14 bg-brand-navy">
  </nav>
  <aside class="fixed left-0 top-14 w-60 h-[calc(100vh-56px)]
                bg-white border-r border-slate-200"></aside>
  <main class="pt-14 sm:ml-60">
    <div class="p-3 sm:p-6 max-w-[1600px] mx-auto">
      <div class="dm-filters-bar">...</div>
      <div class="dm-card">...</div>
    </div>
  </main>
</div>`
);

subSection('Breakpoints Responsive');
tableHeader([['BREAKPOINT', 3], ['MIN-WIDTH', 32], ['COMPORTAMIENTO', 58]]);
[
  ['(base)', '0px', 'Stack vertical, p-3, text-lg, drawer bottom-slide'],
  ['sm (640px)', '640px', 'Row layouts, p-4/p-6, text-xl, drawer right-slide'],
  ['md (768px)', '768px', 'Grid 2-col, filtros expandidos, sidebar visible'],
  ['lg (1024px)', '1024px', 'Grid 3-4 col, full sidebar, tablas anchas'],
  ['xl (1280px)', '1280px', 'max-w containers, dashboards multi-col'],
  ['2xl (1536px)', '1536px', 'Ultra-wide, max-w-[1600px] content'],
].forEach(([bp, width, desc], i) => {
  tableRow([
    [bp, 3, 'courier', C.navy],
    [width, 32, 'courier', C.slate600],
    [desc, 58, 'helvetica', C.slate700, 112],
  ], i);
});
y += 6;

subSection('Patrones Grid & Flex');
codeBlock(
`// KPI cards row
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

// Two-column form
grid grid-cols-1 md:grid-cols-2 gap-4

// Header: title left, actions right
flex items-center justify-between

// Responsive stack -> row
flex flex-col sm:flex-row sm:items-center gap-3

// Center content (empty states)
flex flex-col items-center justify-center`
);

// ════════════════════════════════════════════════════
// 20. SPACING & SIZING
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('20. Spacing & Sizing', 'spacing');

subSection('Escala de Espaciado');
tableHeader([['TOKEN', 3], ['VALOR', 20], ['USO COM\u00daN', 45]]);
[
  ['0.5', '2px', 'mt-0.5 para subt\u00edtulos bajo t\u00edtulos'],
  ['1', '4px', 'gap-1 entre \u00edcono y texto inline'],
  ['1.5', '6px', 'gap-1.5 entre dot y label en badges'],
  ['2', '8px', 'gap-2 entre items compactos, py-2 inputs'],
  ['3', '12px', 'p-3 mobile cards, gap-3 entre controles'],
  ['4', '16px', 'p-4 desktop cards, gap-4 entre secciones, mb-4 filtros'],
  ['5', '20px', 'p-5 KPI cards'],
  ['6', '24px', 'p-6 p\u00e1ginas desktop, gap-6 secciones grandes'],
  ['8', '32px', 'py-8 separadores de secci\u00f3n'],
  ['16', '64px', 'py-16 empty states'],
].forEach(([token, val, uso], i) => {
  tableRow([
    [token, 3, 'courier', C.navy],
    [val, 20, 'courier', C.slate600],
    [uso, 45, 'helvetica', C.slate700, 125],
  ], i);
});
y += 4;

subSection('Referencia de Tama\u00f1os Fijos');
codeBlock(
`h-14           // Navbar height (56px)
w-60           // Sidebar width (240px)
w-96           // Drawer width (384px)
max-w-sm       // Toast width (384px)
max-w-md       // Small modal (448px)
max-w-lg       // Standard modal (512px)
max-w-[1600px] // Page content max-width`
);

// ════════════════════════════════════════════════════
// 21. SHADOWS & BORDERS
// ════════════════════════════════════════════════════
sectionTitle('21. Shadows & Borders', 'shadows');

subSection('Escala de Sombras');
tableHeader([['CLASE', 3], ['USO', 35], ['ELEVACI\u00d3N', 100]]);
[
  ['shadow-none', 'Flat elements, inline items', 'Level 0'],
  ['shadow-sm', 'Cards, containers, filters bar', 'Level 1'],
  ['shadow', 'Dropdowns, slight elevation', 'Level 2'],
  ['shadow-md', 'Tooltips, popovers', 'Level 3'],
  ['shadow-lg', 'Dropdown menus, toasts', 'Level 4'],
  ['shadow-xl', 'Hover cards, drawers, modales', 'Level 5'],
].forEach(([cls, uso, level], i) => {
  tableRow([
    [cls, 3, 'courier', C.blue],
    [uso, 35, 'helvetica', C.slate700, 60],
    [level, 100, 'helvetica', C.slate500],
  ], i);
});
y += 4;

subSection('Patrones de Borde');
codeBlock(
`// Container borders
border border-slate-200          // Borde est\u00e1ndar de card
border-b border-slate-200        // Separador header/secci\u00f3n
border-t border-slate-100        // Divisor interno sutil
border-l-4 border-brand-blue     // Borde acento (KPI cards)

// Status borders
border border-st-success-border  // Badge/pill de \u00e9xito
border border-st-error-border    // Badge/pill de error

// Interactive
border-b-2 border-brand-blue     // Tab activo
focus:ring-2 focus:ring-blue-500 // Focus state ring`
);

subSection('Border Radius');
codeBlock(
`rounded        // 4px  - Elementos peque\u00f1os
rounded-lg     // 8px  - Cards, botones, inputs (DEFAULT)
rounded-xl     // 12px - Modales, cards grandes
rounded-full   // 50%  - Badges, dots, avatares, pills`
);

// ════════════════════════════════════════════════════
// 22. Z-INDEX & LAYERING
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('22. Z-Index & Layering', 'zindex');

drawMockup((mx, my) => {
  // layers
  const layers = [
    [C.slate100, 'z-0  Content', 0],
    [C.slate200, 'z-10 Sticky', 4],
    [C.slate300, 'z-20 Tooltips', 8],
    [[180,200,220], 'z-30 Dropdowns', 12],
    [C.blue, 'z-40 Navbar', 16],
    [C.navy, 'z-50 Modales', 20],
    [[80,40,60], 'z-100 Hover cards', 24],
  ];
  layers.forEach(([rgb, label, offset], i) => {
    setFill(rgb); setDraw(C.white);
    doc.roundedRect(mx + 5 + offset, my + 28 - offset, 55, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(4.5);
    setColor(i >= 4 ? C.white : C.slate700);
    doc.text(label, mx + 8 + offset, my + 32 - offset);
  });
}, 90, 36);

tableHeader([['Z-INDEX', 3], ['ELEMENTO', 25], ['DESCRIPCI\u00d3N', 70]]);
[
  ['z-0', 'Content', 'Contenido regular de p\u00e1gina'],
  ['z-10', 'Sticky', 'Sticky table headers, nodos en flujo'],
  ['z-20', 'Tooltips locales', 'Tooltips dentro de componentes'],
  ['z-30', 'Dropdown menus', 'Men\u00fas desplegables'],
  ['z-40', 'Navbar / Sidebar', 'Navegaci\u00f3n fija principal'],
  ['z-50', 'Overlays / Modales', 'Modales, toasts, alertas flotantes'],
  ['z-[100]', 'Hover cards', 'Cards flotantes de m\u00e1ximo z-index'],
].forEach(([z, el, desc], i) => {
  tableRow([
    [z, 3, 'courier', C.navy],
    [el, 25, 'helvetica', C.slate800],
    [desc, 70, 'helvetica', C.slate600, 100],
  ], i);
});
y += 4;
bodyText('Regla: nunca saltar m\u00e1s de 10 niveles entre capas adyacentes.');

// ════════════════════════════════════════════════════
// 23. SCROLLBAR & OVERFLOW
// ════════════════════════════════════════════════════
y += 4;
sectionTitle('23. Scrollbar & Overflow', 'scroll');

codeBlock(
`/* Custom scrollbar (webkit) */
::-webkit-scrollbar       { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Overflow patterns */
overflow-x-auto    // Tablas anchas, barras de gr\u00e1ficos
overflow-y-auto    // Contenido scrolleable en modales/drawers
overflow-hidden    // Prevenir scroll con modal abierto
truncate           // text-overflow: ellipsis (1 l\u00ednea)
line-clamp-2       // Limitar a 2 l\u00edneas con ellipsis`
);

// ════════════════════════════════════════════════════
// 24. ACCESSIBILITY
// ════════════════════════════════════════════════════
sectionTitle('24. Accesibilidad', 'a11y');

subSection('Gesti\u00f3n de Focus');
codeBlock(
`// Focus ring (todos los interactivos)
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

// Skip to content
<a href="#main" class="sr-only focus:not-sr-only focus:absolute
   focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2
   focus:bg-white focus:rounded-lg focus:shadow-lg">
  Ir al contenido
</a>`
);

subSection('ARIA & Sem\u00e1ntica');
bulletPoint('role="status" en badges din\u00e1micos');
bulletPoint('[attr.aria-label] en botones de solo \u00edcono');
bulletPoint('aria-expanded en collapsibles y dropdowns');
bulletPoint('aria-current="page" en nav item activo');
bulletPoint('role="alert" en notificaciones y errores');
y += 2;

subSection('Contraste de Color');
bodyText('M\u00ednimo WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande.');
bodyText('Nunca usar solo color para comunicar estado - siempre incluir \u00edcono o texto.');
bodyText('Status dots siempre acompa\u00f1ados de label textual.');

// ════════════════════════════════════════════════════
// 25. QUICK REFERENCE
// ════════════════════════════════════════════════════
doc.addPage(); y = MT;

sectionTitle('25. Gu\u00eda de Uso R\u00e1pido', 'quickref');

subSection('Base Reset');
codeBlock(
`* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
}`
);

subSection('Template Tailwind Config');
codeBlock(
`module.exports = {
  content: ['./src/**/*.{html,ts,tsx,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { navy: '#1E3A5F', blue: '#2E75B6', light: '#EFF6FF' },
        'st-success':  { DEFAULT:'#10b981', light:'#ecfdf5', border:'#a7f3d0' },
        'st-warning':  { DEFAULT:'#f59e0b', light:'#fffbeb', border:'#fde68a' },
        'st-error':    { DEFAULT:'#ef4444', light:'#fef2f2', border:'#fecaca' },
        'st-info':     { DEFAULT:'#3b82f6', light:'#eff6ff', border:'#bfdbfe' },
        'st-neutral':  { DEFAULT:'#64748b', light:'#f8fafc', border:'#e2e8f0' },
        'st-disabled': { DEFAULT:'#94a3b8', light:'#f1f5f9', border:'#e2e8f0' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};`
);

subSection('Checklist de Componentes');
const checklist = [
  ['Layout', 'Navbar, Sidebar, Page wrapper, Footer'],
  ['Navegaci\u00f3n', 'Tabs, Breadcrumbs, Back button, Paginaci\u00f3n'],
  ['Data Entry', 'Input, Select, Search, Textarea, Checkbox, Radio, Toggle'],
  ['Data Display', 'Table, Card, KPI card, Badge, Tag, Tooltip, Hover card'],
  ['Feedback', 'Alert, Toast, Empty state, Spinner, Skeleton, Progress bar'],
  ['Overlay', 'Modal, Drawer, Dropdown menu, Confirmaci\u00f3n'],
  ['Data Viz', 'Gantt, Trend indicators, Progress bars'],
];
checklist.forEach(([cat, items]) => {
  checkPage(7);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setColor(C.navy);
  doc.text(cat, ML + 3, y + 4);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); setColor(C.slate600);
  doc.text(items, ML + 32, y + 4);
  y += 7;
});

y += 6;
subSection('Principios de Dise\u00f1o');
bulletPoint('Consistencia: usar tokens y clases globales, nunca valores hardcodeados.');
bulletPoint('Jerarqu\u00eda: m\u00e1ximo 3 niveles de \u00e9nfasis visual por vista (t\u00edtulo > body > metadata).');
bulletPoint('Espacio: el whitespace es un elemento de dise\u00f1o. No llenar cada p\u00edxel.');
bulletPoint('Feedback: toda acci\u00f3n del usuario debe tener respuesta visual (hover, focus, loading).');
bulletPoint('Mobile-first: dise\u00f1ar para mobile, expandir para desktop con breakpoints.');
bulletPoint('Accesibilidad: focus visible, contraste WCAG AA, ARIA labels en interactivos.');

// ════════════════════════════════════════════════════
// POST-PROCESSING: TOC links + footers
// ════════════════════════════════════════════════════

// Add internal links AND page numbers to TOC
tocEntries.forEach(({ key, y: entryY, page, textY }) => {
  const targetPage = sectionPages[key];
  if (targetPage) {
    doc.setPage(page);
    // Add clickable link
    doc.link(ML, entryY, CW, 8, { pageNumber: targetPage });
    // Write page number at the right end
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setColor(C.slate500);
    doc.text(String(targetPage), ML + CW, textY, { align: 'right' });
  }
});

// Footer on every page (except cover)
const totalPages = doc.internal.getNumberOfPages();
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i);
  setDraw(C.slate200);
  doc.line(ML, H - 15, ML + CW, H - 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(C.slate400);
  doc.text('Divemotor Design System - Style Workbook v1.0', ML, H - 10);
  doc.text(`${i} / ${totalPages}`, ML + CW, H - 10, { align: 'right' });
}

// Save
const fs = require('fs');
const buffer = Buffer.from(doc.output('arraybuffer'));
const outPath = './divemotor-style-workbook-v6.pdf';
fs.writeFileSync(outPath, buffer);
console.log(`PDF generated: ${outPath} (${totalPages} pages, ${(buffer.length/1024).toFixed(0)} KB)`);
