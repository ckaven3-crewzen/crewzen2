import React, { useRef, useState } from 'react';
import EmployeeCameraDialog2 from '../app/(modules)/crewzen/components/EmployeeCameraDialog2';
import EmployeeImageCropperDialog2 from '../app/(modules)/crewzen/components/EmployeeImageCropperDialog2';
import { Button } from './ui/button';
import { Loader2, Camera, Plus } from 'lucide-react';
import { Area, Point } from 'react-easy-crop';
import { uploadFileToStorage } from '@/lib/upload';
import { v4 as uuidv4 } from 'uuid';

function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

interface PhotoUploaderProps {
  storagePath: (imageId: string) => string;
  onUploadComplete: (url: string, storagePath?: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ storagePath, onUploadComplete, maxImages = 10, disabled = false }) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera logic
  const handleOpenCamera = async () => {
    setCameraOpen(true);
    setHasCameraPermission(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch {
      setHasCameraPermission(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageToCrop(canvas.toDataURL('image/jpeg'));
        setCropperOpen(true);
      }
    }
    setCameraOpen(false);
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCancelCamera = () => {
    setCameraOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // File upload logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageToCrop(event.target.result as string);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cropper logic
  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    setUploading(true);
    setUploadError(null);
    try {
      const blob = dataURLtoBlob(imageToCrop);
      const imageId = uuidv4();
      const path = storagePath(imageId);
      const downloadUrl = await uploadFileToStorage(blob, path);
      onUploadComplete(downloadUrl, path);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
      setCropperOpen(false);
      setImageToCrop(null);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpenCamera}
        disabled={disabled || uploading}
      >
        <Camera className="h-4 w-4 mr-1" />
        Take Photo
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
      >
        <Plus className="h-4 w-4 mr-1" />
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Image'}
      </Button>
      {uploadError && <div className="text-red-500 text-sm ml-2">{uploadError}</div>}
      <EmployeeCameraDialog2
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        videoRef={videoRef}
        canvasRef={canvasRef}
        hasCameraPermission={hasCameraPermission}
        onCancel={handleCancelCamera}
        onCapture={handleCapture}
      />
      <EmployeeImageCropperDialog2
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageToCrop={imageToCrop}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        setCrop={setCrop}
        setZoom={setZoom}
        setRotation={setRotation}
        onCropComplete={handleCropComplete}
        onCancel={() => { setCropperOpen(false); setImageToCrop(null); }}
        onSave={handleSaveCroppedImage}
      />
    </div>
  );
};

export default PhotoUploader;