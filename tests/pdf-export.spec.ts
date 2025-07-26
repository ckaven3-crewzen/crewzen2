import { generatePdfReport } from '../src/components/ui/PdfReportGenerator';

describe('PDF Export', () => {
  it('should generate a PDF without errors', async () => {
    const headers = ['Col1', 'Col2'];
    const reportData = [
      ['A', 1],
      ['B', 2],
    ];
    const title = 'Test PDF';
    const filenameSuffix = 'test';
    // This will not actually save a file in a test, but should not throw
    await expect(
      generatePdfReport({ reportData, headers, title, filenameSuffix })
    ).resolves.not.toThrow();
  });
});
