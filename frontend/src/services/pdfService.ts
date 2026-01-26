import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translationService } from './translationService';

interface ExtraWork {
  id: number;
  custom_id?: string;
  name?: string;
  description?: string;
  project_name?: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
  created_at?: string;
  status?: string;
  work_date?: string;
  duration_hours?: number;
  durationHours?: number;
  material_description_text?: string;
  materials?: Array<{ name: string; quantity: number; unit?: string }>;
  photos?: Array<{ file_path: string; file_name?: string }>;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('cs-CZ');
};

const removeDiacritics = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const loadImageAsBase64 = async (url: string): Promise<{ data: string; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve({
        data: canvas.toDataURL('image/jpeg'),
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      console.error('Chyba při načítání obrázku:', url);
      resolve(null);
    };
    img.src = url;
  });
};

export const generateExtraWorkPDF = async (extraWork: ExtraWork): Promise<void> => {
  // Automaticky přeložit všechny hodnoty do češtiny
  const translatedWork = {
    ...extraWork,
    name: await translationService.autoTranslateToCzech(extraWork.name),
    description: await translationService.autoTranslateToCzech(extraWork.description),
    project_name: await translationService.autoTranslateToCzech(extraWork.project_name),
    material_description_text: await translationService.autoTranslateToCzech(extraWork.material_description_text),
    materials: extraWork.materials ? await Promise.all(
      extraWork.materials.map(async (m) => ({
        ...m,
        name: await translationService.autoTranslateToCzech(m.name),
        unit: await translationService.autoTranslateToCzech(m.unit)
      }))
    ) : []
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Použít Times font pro lepší podporu UTF-8
  doc.setFont('times', 'normal');
  
  let yPosition = 30;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Hlavní nadpis
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text(removeDiacritics('DOKUMENTACE VICEPRACE'), pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Linka
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 12;
  
  // Základní informace - jednoduchý formát
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  
  // ID vícepráce
  doc.setFont('times', 'bold');
  doc.text(removeDiacritics('ID viceprace:'), margin, yPosition);
  doc.setFont('times', 'normal');
  doc.text(removeDiacritics(translatedWork.custom_id || ''), margin + 40, yPosition);
  yPosition += 8;
  
  // Název víceprace
  if (translatedWork.name) {
    doc.setFont('times', 'bold');
    doc.text(removeDiacritics('Nazev:'), margin, yPosition);
    doc.setFont('times', 'normal');
    const nameLines = doc.splitTextToSize(removeDiacritics(translatedWork.name), contentWidth - 45);
    doc.text(nameLines, margin + 40, yPosition);
    yPosition += nameLines.length * 6 + 2;
  }
  
  // Projekt
  doc.setFont('times', 'bold');
  doc.text(removeDiacritics('Projekt:'), margin, yPosition);
  doc.setFont('times', 'normal');
  doc.text(removeDiacritics(translatedWork.project_name || ''), margin + 40, yPosition);
  yPosition += 8;
  
  // Datum
  doc.setFont('times', 'bold');
  doc.text(removeDiacritics('Datum:'), margin, yPosition);
  doc.setFont('times', 'normal');
  const workDate = translatedWork.work_date || translatedWork.created_at || new Date().toISOString();
  doc.text(removeDiacritics(formatDate(workDate)), margin + 40, yPosition);
  yPosition += 8;
  
  // Počet hodin
  const hours = translatedWork.duration_hours || translatedWork.durationHours;
  if (hours) {
    doc.setFont('times', 'bold');
    doc.text(removeDiacritics('Pocet hodin:'), margin, yPosition);
    doc.setFont('times', 'normal');
    doc.text(removeDiacritics(`${hours} h`), margin + 40, yPosition);
    yPosition += 8;
  }
  
  yPosition += 10;
  
  // Linka před fotkami
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 12;

  // Seznam použitých materiálů
  if (translatedWork.materials && translatedWork.materials.length > 0) {
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text(removeDiacritics('SEZNAM POUZITYCH MATERIALU'), margin, yPosition);
    yPosition += 10;

    // Materiály v tabulce
    const materialRows = translatedWork.materials.map((m) => [
      removeDiacritics(m.name),
      m.quantity.toString(),
      removeDiacritics(m.unit || ''),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [[removeDiacritics('Materiál'), removeDiacritics('Množství'), removeDiacritics('Jednotka')]],
      body: materialRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        font: 'times',
      },
      styles: { 
        font: 'times',
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.5 },
        1: { cellWidth: contentWidth * 0.25, halign: 'right' },
        2: { cellWidth: contentWidth * 0.25 },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
    
    // Linka po materiálech
    if (yPosition < pageHeight - 80) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;
    }
  }

  // Fotodokumentace
  if (translatedWork.photos && translatedWork.photos.length > 0) {
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text(removeDiacritics('FOTODOKUMENTACE'), margin, yPosition);
    yPosition += 10;

    // 3 fotky na stránku - každá na šířku celého contentWidth
    const maxImgWidth = contentWidth;
    const maxImgHeight = (pageHeight - 100) / 3; // Rozdělíme dostupnou výšku na 3 části

    for (let i = 0; i < translatedWork.photos.length; i++) {
      const photo = translatedWork.photos[i];

      // Nová stránka po každých 3 fotkách
      if (i > 0 && i % 3 === 0) {
        doc.addPage();
        yPosition = 25;
      }

      // Pokud se nevejde na stránku
      if (yPosition + maxImgHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = 25;
      }

      try {
        const apiUrl = import.meta.env.MODE === 'production'
          ? 'https://stavebniaplikacebackend-production.up.railway.app'
          : 'http://localhost:3001';
        const imageUrl = `${apiUrl}${photo.file_path}`;
        const imageData = await loadImageAsBase64(imageUrl);
        
        if (imageData) {
          // Vypočítat poměr stran a skutečnou velikost
          const aspectRatio = imageData.width / imageData.height;
          let imgWidth = maxImgWidth;
          let imgHeight = maxImgWidth / aspectRatio;
          
          // Pokud je výška příliš velká, zmenšíme podle výšky
          if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight;
            imgWidth = maxImgHeight * aspectRatio;
          }
          
          // Vystředit obrázek horizontálně
          const xOffset = margin + (maxImgWidth - imgWidth) / 2;
          
          // Rámeček kolem obrázku
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.rect(margin, yPosition, maxImgWidth, imgHeight);
          
          // Přidat obrázek se zachováním poměru stran
          doc.addImage(imageData.data, 'JPEG', xOffset, yPosition, imgWidth, imgHeight);
          
          // Číslo fotky v rohu
          doc.setFontSize(9);
          doc.setFont('times', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Foto ${i + 1}`, margin + 5, yPosition + 7);
          
          doc.setTextColor(33, 37, 41);
          
          yPosition += imgHeight + 10;
        } else {
          // Placeholder
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPosition, maxImgWidth, maxImgHeight, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, yPosition, maxImgWidth, maxImgHeight);
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(removeDiacritics('Obrazek neni dostupny'), margin + maxImgWidth / 2, yPosition + maxImgHeight / 2, { align: 'center' });
          doc.setTextColor(33, 37, 41);
          
          yPosition += maxImgHeight + 10;
        }
      } catch (error) {
        console.error('Chyba při přidávání obrázku do PDF:', error);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition, maxImgWidth, maxImgHeight, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPosition, maxImgWidth, maxImgHeight);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(removeDiacritics('Chyba pri nacteni'), margin + maxImgWidth / 2, yPosition + maxImgHeight / 2, { align: 'center' });
        doc.setTextColor(33, 37, 41);
        
        yPosition += maxImgHeight + 10;
      }
    }
  }

  // Patička na všech stránkách
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      removeDiacritics(`Strana ${i} z ${totalPages}`),
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Uložit PDF
  const customId = (translatedWork.custom_id || 'ID').replace(/\//g, '-');
  const dateStr = formatDate(translatedWork.created_at || new Date().toISOString()).replace(/\./g, '-');
  const fileName = `viceprace_${customId}_${dateStr}.pdf`;
  doc.save(fileName);
};
