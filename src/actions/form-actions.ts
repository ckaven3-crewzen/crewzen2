// This is now a CLIENT-SIDE function.
// It will be imported and run directly in the browser from the component.
// This ensures it uses the currently logged-in user's authentication context,
// satisfying Firestore and Storage security rules.

// Import the CLIENT-SIDE Firebase SDKs.
import { db, storage } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  writeBatch,
  documentId,
} from 'firebase/firestore';
import {
  ref,
  getBytes,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Project, Employee, Estate, CompanyInfo, Helper } from '@/lib/types';
import { format } from 'date-fns';

// Helper to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunkedArr: T[][] = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, size + index));
    index += size;
  }
  return chunkedArr;
}

// Helper to get the correct text for a given app-side field name
function getTextForMapping(
  appFieldName: string,
  project: Project,
  employeesOnPage: Employee[],
  companyInfo: CompanyInfo | null,
): string {
    // Company Info fields
    if (appFieldName === 'companyName' && companyInfo) return companyInfo.name || '';
    if (appFieldName === 'companyAddress' && companyInfo) return companyInfo.address || '';
    if (appFieldName === 'companyPhone' && companyInfo) return companyInfo.phone || '';
    if (appFieldName === 'companyEmail' && companyInfo) return companyInfo.email || '';
    if (appFieldName === 'companyOwnerName' && companyInfo) return companyInfo.ownerName || '';

    // Principal Contractor fields
    if (appFieldName === 'principalContractorCompanyName' && project.principalContractor) return project.principalContractor.companyName || '';
    if (appFieldName === 'principalContractorContactName' && project.principalContractor) return project.principalContractor.contactName || '';
    if (appFieldName === 'principalContractorPhone' && project.principalContractor) return project.principalContractor.phone || '';
    if (appFieldName === 'principalContractorEmail' && project.principalContractor) return project.principalContractor.email || '';

    // Project-level fields (no index)
    if (appFieldName === 'todaysDate') return format(new Date(), 'yyyy-MM-dd');
    if (appFieldName === 'projectName') return project.name || '';
    if (appFieldName === 'projectAddress') return project.address || '';
    
    // Employee/Helper fields (e.g., employeeFullName_1)
    const parts = appFieldName.match(/^([a-zA-Z]+)_(\d+)$/);
    if (!parts) return ''; // Not a valid indexed field format, e.g., "employeeFullName_1"

    const baseFieldName = parts[1];
    const employeeIndex = parseInt(parts[2], 10) - 1; // Convert 1-based index to 0-based

    if (employeeIndex < 0 || employeeIndex >= employeesOnPage.length) {
        return ''; // Employee index is not present on this page
    }
    const employee = employeesOnPage[employeeIndex];

    switch(baseFieldName) {
        case 'employeeFullName': return `${employee.firstName} ${employee.lastName}`;
        case 'employeeFirstName': return employee.firstName || '';
        case 'employeeLastName': return employee.lastName || '';
        case 'employeeIdNumber': return employee.idNumber || 'N/A';
        case 'employeeCompanyNumber': return employee.companyNumber || 'N/A';
        case 'employeePhone': return employee.phone || 'N/A';
        case 'employeeIsDriver': return employee.isDriver ? 'Yes' : 'No';
        case 'helperFullName': return employee.hasHelper && employee.helper ? `${employee.helper.firstName} ${employee.helper.lastName}` : '';
        case 'helperFirstName': return employee.hasHelper && employee.helper ? employee.helper.firstName || '' : '';
        case 'helperLastName': return employee.hasHelper && employee.helper ? employee.helper.lastName || '' : '';
        case 'helperIdNumber': return employee.hasHelper && employee.helper ? employee.helper.idNumber || 'N/A' : '';
        default: return '';
    }
}


export async function fillAccessForm({
  projectId,
  employeeIds,
}: {
  projectId: string;
  employeeIds: string[];
}): Promise<{ success: boolean; formUrl?: string; error?: string }> {
  try {
    const projectDocRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectDocRef);

    if (!projectDoc.exists()) {
      throw new Error('Project not found.');
    }
    const project = { id: projectDoc.id, ...projectDoc.data() } as Project;

    if (!project.estateId) {
      throw new Error('Project is not linked to an estate.');
    }

    const estateDocRef = doc(db, 'estates', project.estateId);
    const estateDoc = await getDoc(estateDocRef);
    if (!estateDoc.exists()) {
      throw new Error('Estate not found.');
    }
    const estate = { id: estateDoc.id, ...estateDoc.data() } as Estate;

    if (!estate.formTemplateUrl) {
      throw new Error('The selected estate does not have a form template.');
    }
    if (!estate.formFieldMappings || Object.keys(estate.formFieldMappings).length === 0) {
        throw new Error('The selected estate form has not been mapped yet. Please map the fields first.');
    }
    
    const companyInfoDoc = await getDoc(doc(db, 'settings', 'companyInfo'));
    const companyInfo = companyInfoDoc.exists() ? companyInfoDoc.data() as CompanyInfo : null;

    const employeesQuery = query(collection(db, 'employees'), where(documentId(), 'in', employeeIds));
    const employeeDocs = await getDocs(employeesQuery);
    const employees = employeeDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Employee));

    const templateRef = ref(storage, estate.formTemplateUrl);
    const pdfTemplateBytes = await getBytes(templateRef);

    const finalPdfDoc = await PDFDocument.create();

    const maxEmployeesPerSheet = estate.formMaxEmployees || 1;
    const employeeChunks = chunkArray(employees, maxEmployeesPerSheet);

    for (const chunk of employeeChunks) {
        const pagePdfDoc = await PDFDocument.load(pdfTemplateBytes);
        const form = pagePdfDoc.getForm();
        const mappings = estate.formFieldMappings || {};

        for (const appFieldName in mappings) {
            const pdfFieldName = mappings[appFieldName];
            if (!pdfFieldName) continue;

            const textToFill = getTextForMapping(appFieldName, project, chunk, companyInfo);

            if (textToFill) {
                try {
                    const field = form.getTextField(pdfFieldName);
                    field.setText(textToFill);
                } catch (e) {
                    console.warn(`PDF form field named "${pdfFieldName}" (mapped from "${appFieldName}") not found or could not be set. Skipping.`);
                }
            }
        }
        form.flatten();
        const pagePdfBytes = await pagePdfDoc.save();
        const tempDoc = await PDFDocument.load(pagePdfBytes);
        const copiedPages = await finalPdfDoc.copyPages(tempDoc, tempDoc.getPageIndices());
        copiedPages.forEach(p => finalPdfDoc.addPage(p));
    }
    
    if (estate.requiredDocuments && estate.requiredDocuments.length > 0) {
        const docsPdf = await PDFDocument.create();
        const helveticaFont = await docsPdf.embedFont(StandardFonts.Helvetica);

        for (const employee of employees) {
            for (const docKey of estate.requiredDocuments) {
                let docUrl: string | undefined;
                let docOwnerName: string;
                let docTitleKey: string;

                if (docKey.startsWith('helper')) {
                    if (employee.hasHelper && employee.helper) {
                        const helperKey = (docKey.replace('helper', '').charAt(0).toLowerCase() + docKey.slice(7)) as keyof Helper;
                        docUrl = employee.helper[helperKey] as string | undefined;
                        docOwnerName = `${employee.helper.firstName} ${employee.helper.lastName}`;
                        docTitleKey = docKey.replace('Url', '').replace('helper', 'Helper ');
                    } else {
                        continue;
                    }
                } else {
                    docUrl = employee[docKey as keyof Employee] as string | undefined;
                    docOwnerName = `${employee.firstName} ${employee.lastName}`;
                    docTitleKey = docKey.replace(/Url$/, '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                }

                if (docUrl) {
                    try {
                        const fileRef = ref(storage, docUrl);
                        const fileBytes = await getBytes(fileRef);
                        const docTitle = `${docOwnerName} - ${docTitleKey}`;
                        
                        if (docKey.includes('Certificate')) {
                           const embeddedPdf = await PDFDocument.load(fileBytes);
                           const copiedPages = await docsPdf.copyPages(embeddedPdf, embeddedPdf.getPageIndices());
                           const titlePage = docsPdf.addPage();
                           titlePage.drawText(docTitle, { x: 50, y: titlePage.getHeight() / 2, font: helveticaFont, size: 24, color: rgb(0, 0, 0) });
                           for (const copiedPage of copiedPages) {
                               docsPdf.addPage(copiedPage);
                           }
                        } else {
                           const page = docsPdf.addPage();
                           const { width, height } = page.getSize();
                           let image;
                            try {
                                image = await docsPdf.embedJpg(fileBytes);
                            } catch (jpgError) {
                                try {
                                    image = await docsPdf.embedPng(fileBytes);
                                } catch (pngError) {
                                    console.error(`- FAILED to embed image ${docKey} for ${docOwnerName}. Not a valid JPG/PNG.`);
                                    docsPdf.removePage(docsPdf.getPageCount() -1);
                                    continue;
                                }
                            }
                           page.drawText(docTitle, { x: 50, y: height - 50, font: helveticaFont, size: 18 });
                           const scaled = image.scaleToFit(width - 100, height - 150);
                           page.drawImage(image, {
                               x: (width - scaled.width) / 2,
                               y: (height - scaled.height) / 2 - 50,
                               width: scaled.width,
                               height: scaled.height,
                           });
                        }
                    } catch (e) {
                        console.error(`- FAILED to embed document ${docKey} for ${docOwnerName}. Skipping. Error:`, e);
                    }
                }
            }
        }
        
        if (docsPdf.getPageCount() > 0) {
            const copiedDocsPages = await finalPdfDoc.copyPages(docsPdf, docsPdf.getPageIndices());
            copiedDocsPages.forEach(p => finalPdfDoc.addPage(p));
        }
    }

    const finalPdfBytes = await finalPdfDoc.save();
    const outputFileName = `generated-forms/${projectId}/combined-access-form_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const outputFileRef = ref(storage, outputFileName);
    await uploadBytes(outputFileRef, finalPdfBytes, { contentType: 'application/pdf' });
    const finalUrl = await getDownloadURL(outputFileRef);

    const batch = writeBatch(db);
    for (const emp of employees) {
      const employeeRef = doc(db, 'employees', emp.id);
      batch.update(employeeRef, {
        registeredEstateIds: arrayUnion(project.estateId),
      });
    }
    await batch.commit();

    return { success: true, formUrl: finalUrl };
  } catch (error: any) {
    console.error('Error in fillAccessForm:', error);
    if (error.code === 'storage/unauthorized' || error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied. Please check Firestore/Storage security rules.' };
    }
    return { success: false, error: error.message };
  }
}
