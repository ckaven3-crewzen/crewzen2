
/**
 * PdfReportGenerator.ts
 *
 * Canonical PDF report generator for CrewZen/ProZen modules.
 *
 * Usage: Import and use `generatePdfReport` for all PDF export needs.
 * Location: src/components/ui/PdfReportGenerator.ts
 *
 * Old/duplicate files have been removed. This is the only maintained version.
 */
import { format } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfReportOptions {
  reportData: (string | number)[][];
  headers: string[];
  title: string;
  filenameSuffix: string;
  email?: boolean;
}

export async function generatePdfReport({ reportData, headers, title, filenameSuffix, email }: PdfReportOptions): Promise<void> {
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  autoTable(doc, {
    head: [headers],
    body: reportData,
    startY: 20,
  });
  const filename = `${filenameSuffix}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

  if (email) {
    const blob = doc.output('blob');
    const reportRef = ref(storage, `generated-reports/attendance/${filename}`);
    await uploadBytes(reportRef, blob);
    const downloadUrl = await getDownloadURL(reportRef);
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`Please find the requested report attached or download it from the link below:\n\n${downloadUrl}\n\nThanks`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  } else {
    doc.save(filename);
  }
}
