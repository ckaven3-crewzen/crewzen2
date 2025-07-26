import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2, FileText, ExternalLink } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';

export interface DocumentFile {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  type: string;
}

interface DocumentsUploaderProps {
  workerId: string;
  documents: DocumentFile[];
  onDocumentsChange: (docs: DocumentFile[]) => void;
  editable?: boolean;
}

const DocumentsUploader: React.FC<DocumentsUploaderProps> = ({ workerId, documents, onDocumentsChange, editable = false }) => {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const id = `${Date.now()}-${file.name}`;
      const path = `workerProfiles/${workerId}/documents/${id}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      const newDoc: DocumentFile = {
        id,
        name: file.name,
        url,
        storagePath: path,
        type: file.type,
      };
      const updatedDocs = [...documents, newDoc];
      // Update Firestore
      const workerDocRef = doc(db, 'workerProfiles', workerId);
      await setDoc(workerDocRef, { documents: updatedDocs }, { merge: true });
      onDocumentsChange(updatedDocs);
    } catch (err) {
      // Optionally show error
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const docToDelete = documents.find(doc => doc.id === id);
      if (!docToDelete) return;
      const fileRef = storageRef(storage, docToDelete.storagePath);
      await deleteObject(fileRef);
      const updatedDocs = documents.filter(doc => doc.id !== id);
      // Update Firestore
      const workerDocRef = doc(db, 'workerProfiles', workerId);
      await setDoc(workerDocRef, { documents: updatedDocs }, { merge: true });
      onDocumentsChange(updatedDocs);
    } catch (err) {
      // Optionally show error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Documents</h2>
        {editable && (
          <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Document'}
          </Button>
        )}
        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="relative group overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium truncate">{doc.name}</div>
                <div className="text-xs text-muted-foreground truncate">{doc.type}</div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs flex items-center gap-1 mt-1">
                  <ExternalLink className="h-3 w-3" /> View/Download
                </a>
              </div>
              {editable && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="ml-2"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                >
                  {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {documents.length === 0 && <div className="text-muted-foreground text-center py-8">No documents uploaded yet.</div>}
    </div>
  );
};

export default DocumentsUploader; 