import React, { useState, useCallback, forwardRef, useEffect, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

const ZoomInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const ZoomOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const ResetZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.166l-1.581 1.581A5.002 5.002 0 005.502 7.222V5a1 1 0 01-1-1H2a1 1 0 01-1-1V2a1 1 0 011-1h2zm12 16a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.898-2.166l1.581-1.581A5.002 5.002 0 0014.498 12.778V15a1 1 0 011 1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2z" clipRule="evenodd" /></svg>;

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  imageUrl: string | null;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(({ onFileSelect, imageUrl }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Reset zoom and pan when a new image is selected
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageUrl) setIsDragging(true);
  }, [imageUrl]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const handleZoomIn = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setZoom(z => Math.min(z + 0.2, 3)); };
  const handleZoomOut = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setZoom(z => Math.max(z - 0.2, 0.5)); };
  const handleResetZoom = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); };

  const onMouseDown = (e: React.MouseEvent<HTMLImageElement>) => { if (zoom <= 1) return; e.preventDefault(); setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const onMouseUp = () => setIsPanning(false);
  const onMouseLeave = () => setIsPanning(false);
  const onMouseMove = (e: React.MouseEvent<HTMLImageElement>) => { if (!isPanning) return; setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); };
  
  const onTouchStart = (e: React.TouchEvent<HTMLImageElement>) => { if (zoom <= 1 || e.touches.length !== 1) return; const touch = e.touches[0]; setIsPanning(true); setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y }); };
  const onTouchMove = (e: React.TouchEvent<HTMLImageElement>) => { if (!isPanning || e.touches.length !== 1) return; const touch = e.touches[0]; setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y }); };
  const onTouchEnd = () => setIsPanning(false);

  const baseClasses = "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 overflow-hidden";
  const draggingClasses = "border-blue-500 bg-blue-50";
  const defaultClasses = "border-slate-300 bg-slate-50 hover:bg-slate-100";

  return (
    <div>
      <label
        htmlFor="dropzone-file"
        className={`${baseClasses} ${isDragging ? draggingClasses : defaultClasses}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="absolute top-0 left-0 h-full w-full object-contain transition-transform duration-100 ease-linear"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
              }}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onMouseMove={onMouseMove}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              draggable={false}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm p-1.5 rounded-full flex items-center space-x-2 z-10">
              <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 text-white rounded-full hover:bg-white/20 transition-colors"><ZoomOutIcon /></button>
              <button onClick={handleResetZoom} title="Reset Zoom" className="p-1.5 text-white rounded-full hover:bg-white/20 transition-colors"><ResetZoomIcon /></button>
              <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 text-white rounded-full hover:bg-white/20 transition-colors"><ZoomInIcon /></button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon />
            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
          </div>
        )}
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" ref={ref} />
      </label>
    </div>
  );
});