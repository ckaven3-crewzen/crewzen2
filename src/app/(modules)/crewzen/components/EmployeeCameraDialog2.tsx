// Renamed from EmployeeCameraDialog.tsx to EmployeeCameraDialog2.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface EmployeeCameraDialog2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hasCameraPermission: boolean | null;
  onCancel: () => void;
  onCapture: () => void;
}

const EmployeeCameraDialog2: React.FC<EmployeeCameraDialog2Props> = ({
  open,
  onOpenChange,
  videoRef,
  canvasRef,
  hasCameraPermission,
  onCancel,
  onCapture,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Capture Image</DialogTitle></DialogHeader>
      <div className="relative">
        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
        <canvas ref={canvasRef} className="hidden" />
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
            <Alert variant="destructive" className="w-3/4">
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>Enable camera permissions.</AlertDescription>
            </Alert>
          </div>
        )}
        {hasCameraPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
            <p className="text-white">Requesting camera...</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onCapture} disabled={!hasCameraPermission}>Capture</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EmployeeCameraDialog2;
