import { format } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface PdfReportOptions {
  reportData: (string | number)[][];
  headers: string[];
  title: string;
  filenameSuffix: string;
  email?: boolean;
}

export async function generatePdfReport({ reportData, headers, title, filenameSuffix, email }: PdfReportOptions): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  if (!(jsPDF as any).prototype.autoTable) {
    const autoTable = (await import('jspdf-autotable')).default;
    autoTable(jsPDF, (typeof window !== 'undefined' ? window : global));
  }
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  (doc as any).autoTable({
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
