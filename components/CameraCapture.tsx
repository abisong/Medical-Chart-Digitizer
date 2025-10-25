
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onPhotoTaken: (blob: Blob) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoTaken, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to start the camera
  const startCamera = useCallback(async () => {
    // Stop any existing stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    try {
      // Prefer back camera on mobile ('environment')
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCapturedImage(null);
      setError(null);
    } catch (err) {
      console.error("Error accessing rear camera:", err);
      // Fallback to any camera if environment fails
      try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(fallbackStream);
          if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
          }
          setCapturedImage(null);
          setError(null);
      } catch (fallbackErr) {
          console.error("Fallback camera access failed:", fallbackErr);
          setError('Could not access the camera. Please ensure you have granted permission and that your device has a camera.');
      }
    }
  }, [stream]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        // Stop the stream to freeze the frame
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleRetake = () => {
    startCamera();
  };
  
  const handleConfirm = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        if (blob) {
          onPhotoTaken(blob);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="camera-title">
      <h2 id="camera-title" className="sr-only">Camera View</h2>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center" aria-label="Close camera view" title="Close camera">&times;</button>
      
      <div className="relative w-full max-w-4xl h-full max-h-[80vh] bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
        {error ? (
          <div className="text-white text-center p-8">
            <h3 className="text-xl font-semibold mb-2">Camera Error</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-contain ${capturedImage ? 'hidden' : 'block'}`}></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            {capturedImage && (
              <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
            )}
          </>
        )}
      </div>
      
      <div className="mt-6 flex items-center justify-center space-x-8 h-20">
        {!error && (
          <>
            {capturedImage ? (
              <>
                <button onClick={handleRetake} className="bg-slate-200 text-slate-800 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-slate-300 transition-transform transform hover:scale-105" title="Discard this photo and take a new one">Retake</button>

                <button onClick={handleConfirm} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105" title="Use this photo">Confirm</button>
              </>
            ) : (
              <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white" aria-label="Take picture" title="Capture photo"></button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
