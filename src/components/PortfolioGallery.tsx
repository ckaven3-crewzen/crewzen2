import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';

export interface PortfolioImage {
  id: string;
  url: string;
  title?: string;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  onDeleteImage: (id: string) => Promise<void>;
  editable?: boolean;
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ images, onDeleteImage, editable = false }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteImage(id);
    } catch (err) {
      // Optionally show error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Portfolio Gallery</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <Card key={img.id} className="relative group overflow-hidden">
            <CardContent className="p-0">
              <img
                src={img.url}
                alt={img.title || 'Portfolio Image'}
                className="object-cover w-full h-40 md:h-48 rounded"
                onClick={() => setShowDeleteId(img.id)}
              />
              {img.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                  {img.title}
                </div>
              )}
              {editable && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${showDeleteId === img.id ? 'opacity-100' : ''}`}
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                >
                  {deletingId === img.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {images.length === 0 && <div className="text-muted-foreground text-center py-8">No portfolio images yet.</div>}
    </div>
  );
};

export default PortfolioGallery; 