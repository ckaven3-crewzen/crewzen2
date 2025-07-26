# PDF Export Fix for CrewZen Reporting

**Date:** 2025-07-24

## Problem

PDF export using jsPDF and jspdf-autotable was failing with errors:
- `TypeError: Cannot read properties of undefined (reading 'getFontSize')`
- `TypeError: doc.autoTable is not a function`

## Cause

- Dynamic import and manual registration of `jspdf-autotable` was not compatible with ESM and Next.js.
- The correct ESM usage is to import `autoTable` as a function and call `autoTable(doc, options)`.

## Solution

- Changed `src/components/ui/PdfReportGenerator.ts` to:
  - Import `jsPDF` and `autoTable` at the top level:
    ```ts
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';
    ```
  - Use `autoTable(doc, options)` instead of `doc.autoTable(options)`.
- Removed all dynamic import and prototype patching logic.

## Result

PDF export now works reliably in the CrewZen reporting page for both download and email options.

---

**Reference:** See `src/components/ui/PdfReportGenerator.ts` for the working implementation.
