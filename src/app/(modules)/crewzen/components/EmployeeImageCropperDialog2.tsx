// Renamed from EmployeeImageCropperDialog.tsx to EmployeeImageCropperDialog2.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Cropper, { Point, Area } from 'react-easy-crop';

interface EmployeeImageCropperDialog2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageToCrop: string | null;
  crop: Point;
  zoom: number;
  rotation: number;
  setCrop: (crop: Point) => void;
  setZoom: (zoom: number) => void;
  setRotation: (rotation: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCancel: () => void;
  onSave: () => void;
}

const EmployeeImageCropperDialog2: React.FC<EmployeeImageCropperDialog2Props> = ({
  open,
  onOpenChange,
  imageToCrop,
  crop,
  zoom,
  rotation,
  setCrop,
  setZoom,
  setRotation,
  onCropComplete,
  onCancel,
  onSave,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>Edit Image</DialogTitle></DialogHeader>
      <div className="relative h-80 w-full bg-muted">
        {imageToCrop && (
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="zoom">Zoom</Label>
          <div className="flex items-center gap-2">
            <ZoomOut />
            <Slider id="zoom" min={1} max={3} step={0.1} value={[zoom]} onValueChange={(val: number[]) => setZoom(val[0])} />
            <ZoomIn />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rotation">Rotate</Label>
          <div className="flex items-center gap-2">
            <RotateCw className="transform -scale-x-100" />
            <Slider id="rotation" min={0} max={360} step={1} value={[rotation]} onValueChange={(val: number[]) => setRotation(val[0])} />
            <RotateCw />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save Image</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EmployeeImageCropperDialog2;
